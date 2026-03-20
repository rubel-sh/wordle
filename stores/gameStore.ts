import { create } from "zustand";
import type {
  RoomData,
  Player,
  GameState,
  LetterState,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/lib/types/game";
import { io, Socket } from "socket.io-client";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface GameStore {
  socket: SocketType | null;
  room: RoomData | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionPromise: Promise<void> | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  rejoinRoom: (roomCode: string, playerId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitGuess: (guess: string) => void;
  playAgain: () => void;

  setRoom: (room: RoomData) => void;
  setCurrentPlayer: (player: Player) => void;
  updatePlayerGuess: (
    playerId: string,
    guess: string,
    letterStates: LetterState[],
    row: number
  ) => void;
  setGameState: (game: GameState) => void;
  setError: (error: string | null) => void;
}

console.log("[STORE] Creating game store...");

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  room: null,
  currentPlayer: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connectionPromise: null,

  connect: async () => {
    const { socket, isConnecting, connectionPromise } = get();

    // Return existing promise if already connecting
    if (isConnecting && connectionPromise) {
      console.log("[STORE] Connection already in progress, waiting...");
      return connectionPromise;
    }

    // Already connected
    if (socket?.connected) {
      console.log("[STORE] Already connected");
      return;
    }

    console.log("[STORE] Connecting to Socket.IO...");

    // Create connection promise
    const promise = new Promise<void>((resolve, reject) => {
      set({ isConnecting: true });

      const newSocket = io(typeof window !== "undefined" ? window.location.origin : "http://localhost:3000", {
        path: "/api/socket",
        addTrailingSlash: false,
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("[STORE] Socket connected:", newSocket.id);
        set({ 
          isConnected: true, 
          isConnecting: false, 
          error: null,
          connectionPromise: null 
        });
        resolve();
      });

      newSocket.on("disconnect", (reason) => {
        console.log("[STORE] Socket disconnected:", reason);
        set({ isConnected: false });
      });

      newSocket.on("connect_error", (error) => {
        console.error("[STORE] Socket connection error:", error.message);
        set({ 
          error: "Connection failed: " + error.message, 
          isConnecting: false,
          connectionPromise: null 
        });
        reject(error);
      });

      newSocket.on("room:joined", ({ room, player }) => {
        console.log("[STORE] Joined room:", room.code, "as player:", player.name);
        set({ room, currentPlayer: player, error: null });
        localStorage.setItem("wordle_player_id", player.id);
        localStorage.setItem("wordle_room_code", room.code);
      });

      newSocket.on("room:playerJoined", ({ player, playerCount }) => {
        console.log("[STORE] Player joined:", player.name, "total:", playerCount);
        const { room } = get();
        if (room) {
          const updatedPlayers = [...room.players, player];
          set({ room: { ...room, players: updatedPlayers } });
        }
      });

      newSocket.on("room:playerLeft", ({ playerId, playerCount }) => {
        console.log("[STORE] Player left:", playerId, "remaining:", playerCount);
        const { room, currentPlayer } = get();
        if (room) {
          const updatedPlayers = room.players.filter((p) => p.id !== playerId);
          set({ room: { ...room, players: updatedPlayers } });
        }
      });

      newSocket.on("room:playerReconnected", ({ player }) => {
        console.log("[STORE] Player reconnected:", player.name);
        const { room } = get();
        if (room) {
          const updatedPlayers = room.players.map((p) =>
            p.id === player.id ? { ...player } : p
          );
          set({ room: { ...room, players: updatedPlayers } });
        }
      });

      newSocket.on("room:playerDisconnected", ({ playerId }) => {
        console.log("[STORE] Player disconnected:", playerId);
        const { room } = get();
        if (room) {
          const updatedPlayers = room.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: false } : p
          );
          set({ room: { ...room, players: updatedPlayers } });
        }
      });

      newSocket.on("game:started", ({ game, players }) => {
        console.log("[STORE] Game started");
        const { room, currentPlayer } = get();
        if (room) {
          const updatedRoom = { ...room, game };
          if (players) {
            updatedRoom.players = players;
            const updatedCurrentPlayer = players.find((p: Player) => p.id === currentPlayer?.id);
            if (updatedCurrentPlayer) {
              set({ room: updatedRoom, currentPlayer: updatedCurrentPlayer });
              return;
            }
          }
          set({ room: updatedRoom });
        }
      });

      newSocket.on("game:guessResult", ({ playerId, guess, letterStates, row }) => {
        console.log("[STORE] Guess result for player:", playerId, "row:", row);
        const { room, currentPlayer } = get();
        if (room) {
          const updatedPlayers = room.players.map((p) => {
            if (p.id === playerId) {
              const newGuesses = [...p.guesses];
              newGuesses[row] = guess;
              const newLetterStates = [...p.letterStates];
              newLetterStates[row] = letterStates;
              return { ...p, guesses: newGuesses, letterStates: newLetterStates };
            }
            return p;
          });

          if (currentPlayer?.id === playerId) {
            const updatedPlayer = updatedPlayers.find((p) => p.id === playerId);
            if (updatedPlayer) {
              set({ currentPlayer: updatedPlayer });
            }
          }

          set({ room: { ...room, players: updatedPlayers } });
        }
      });

      newSocket.on("game:playerWon", ({ playerId, playerName }) => {
        console.log("[STORE] Player won:", playerName);
        const { room } = get();
        if (room) {
          set({
            room: {
              ...room,
              game: { ...room.game, winner: playerId },
            },
          });
        }
      });

      newSocket.on("game:playerLost", ({ playerId, targetWord }) => {
        console.log("[STORE] Player lost:", playerId);
      });

      newSocket.on("game:ended", ({ winner, targetWord }) => {
        console.log("[STORE] Game ended. Winner:", winner);
        const { room } = get();
        if (room) {
          set({
            room: {
              ...room,
              game: {
                ...room.game,
                status: "finished",
                winner,
                endedAt: Date.now(),
              },
            },
          });
        }
      });

      newSocket.on("error", ({ message }) => {
        console.error("[STORE] Socket error:", message);
        set({ error: message });
      });

      set({ socket: newSocket });
    });

    set({ connectionPromise: promise });
    return promise;
  },

  disconnect: () => {
    console.log("[STORE] Disconnecting socket...");
    const { socket } = get();
    socket?.disconnect();
    set({ socket: null, isConnected: false, connectionPromise: null });
  },

  createRoom: async (playerName: string) => {
    console.log("[STORE] Creating room for:", playerName);
    const { socket, connect } = get();
    
    if (!socket?.connected) {
      await connect();
    }
    
    const { socket: newSocket } = get();
    newSocket?.emit("room:create", { playerName });
  },

  joinRoom: async (roomCode: string, playerName: string) => {
    console.log("[STORE] Joining room:", roomCode);
    const { socket, connect } = get();
    
    if (!socket?.connected) {
      await connect();
    }
    
    const { socket: newSocket } = get();
    newSocket?.emit("room:join", { roomCode, playerName });
  },

  rejoinRoom: async (roomCode: string, playerId: string) => {
    console.log("[STORE] Rejoining room:", roomCode);
    const { socket, connect } = get();
    
    if (!socket?.connected) {
      await connect();
    }
    
    const { socket: newSocket } = get();
    newSocket?.emit("room:rejoin", { roomCode, playerId });
  },

  leaveRoom: () => {
    console.log("[STORE] Leaving room");
    const { socket } = get();
    socket?.emit("room:leave");
    localStorage.removeItem("wordle_player_id");
    localStorage.removeItem("wordle_room_code");
    set({ room: null, currentPlayer: null });
  },

  startGame: () => {
    console.log("[STORE] Starting game");
    const { socket } = get();
    socket?.emit("game:start");
  },

  submitGuess: (guess: string) => {
    console.log("[STORE] Submitting guess:", guess);
    const { socket } = get();
    socket?.emit("game:submitGuess", { guess });
  },

  playAgain: () => {
    console.log("[STORE] Playing again");
    const { socket } = get();
    socket?.emit("game:playAgain");
  },

  setRoom: (room: RoomData) => set({ room }),
  setCurrentPlayer: (player: Player) => set({ currentPlayer: player }),
  updatePlayerGuess: (playerId, guess, letterStates, row) => {
    const { room } = get();
    if (!room) return;

    const updatedPlayers = room.players.map((p) => {
      if (p.id === playerId) {
        const newGuesses = [...p.guesses];
        newGuesses[row] = guess;
        const newLetterStates = [...p.letterStates];
        newLetterStates[row] = letterStates;
        return { ...p, guesses: newGuesses, letterStates: newLetterStates };
      }
      return p;
    });

    set({ room: { ...room, players: updatedPlayers } });
  },
  setGameState: (game: GameState) => {
    const { room } = get();
    if (room) {
      set({ room: { ...room, game } });
    }
  },
  setError: (error: string | null) => set({ error }),
}));

console.log("[STORE] Game store created");
