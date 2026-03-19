import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Room,
  Player,
  GameState,
  RoomData,
  LetterState,
} from "@/lib/types/game";
import { getRandomWord, generateRoomCode, isValidWord } from "@/lib/data/words";

console.log("[SOCKET SERVER] Module loaded");

const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>();

function sanitizeRoomData(room: Room): RoomData {
  return {
    code: room.code,
    hostId: room.hostId,
    players: Array.from(room.players.values()),
    game: room.game,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

function evaluateGuess(guess: string, targetWord: string): LetterState[] {
  console.log("[GAME LOGIC] Evaluating guess:", guess, "against target:", targetWord);
  const result: LetterState[] = [];
  const targetLetters = targetWord.split("");
  const guessLetters = guess.toUpperCase().split("");
  const usedIndices = new Set<number>();

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result.push({ letter: guessLetters[i], status: "correct" });
      usedIndices.add(i);
    } else {
      result.push({ letter: guessLetters[i], status: "empty" });
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i].status === "correct") continue;

    const letter = guessLetters[i];
    let found = false;

    for (let j = 0; j < 5; j++) {
      if (!usedIndices.has(j) && targetLetters[j] === letter) {
        found = true;
        usedIndices.add(j);
        break;
      }
    }

    result[i].status = found ? "present" : "absent";
  }

  return result;
}

function createRoom(hostName: string, hostSocketId: string): Room {
  console.log("[ROOM] Creating room for host:", hostName);
  const roomCode = generateRoomCode();
  const playerId = crypto.randomUUID();
  const now = Date.now();

  const host: Player = {
    id: playerId,
    name: hostName,
    socketId: hostSocketId,
    isHost: true,
    guesses: [],
    letterStates: [],
    isConnected: true,
    joinedAt: now,
    lastSeen: now,
  };

  const game: GameState = {
    status: "waiting",
    targetWord: "",
    currentRow: 0,
    winner: null,
    startedAt: null,
    endedAt: null,
    maxGuesses: 6,
  };

  const room: Room = {
    code: roomCode,
    hostId: playerId,
    players: new Map([[playerId, host]]),
    game,
    createdAt: now,
    updatedAt: now,
  };

  rooms.set(roomCode, room);
  playerRooms.set(playerId, roomCode);

  console.log("[ROOM] Room created:", roomCode);
  return room;
}

function joinRoom(roomCode: string, playerName: string, socketId: string): { room: Room; player: Player } | null {
  console.log("[ROOM] Player", playerName, "attempting to join room:", roomCode);
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    console.log("[ROOM] Room not found:", roomCode);
    return null;
  }

  if (room.game.status === "playing") {
    console.log("[ROOM] Game already in progress, cannot join:", roomCode);
    return null;
  }

  const playerId = crypto.randomUUID();
  const now = Date.now();

  const player: Player = {
    id: playerId,
    name: playerName,
    socketId: socketId,
    isHost: false,
    guesses: [],
    letterStates: [],
    isConnected: true,
    joinedAt: now,
    lastSeen: now,
  };

  room.players.set(playerId, player);
  room.updatedAt = now;
  playerRooms.set(playerId, roomCode);

  console.log("[ROOM] Player", playerName, "joined room:", roomCode);
  return { room, player };
}

function rejoinRoom(roomCode: string, playerId: string, socketId: string): { room: Room; player: Player } | null {
  console.log("[ROOM] Player", playerId, "attempting to rejoin room:", roomCode);
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    console.log("[ROOM] Room not found for rejoin:", roomCode);
    return null;
  }

  const player = room.players.get(playerId);
  if (!player) {
    console.log("[ROOM] Player not found in room for rejoin:", playerId);
    return null;
  }

  player.socketId = socketId;
  player.isConnected = true;
  player.lastSeen = Date.now();
  room.updatedAt = Date.now();

  console.log("[ROOM] Player", player.name, "rejoined room:", roomCode);
  return { room, player };
}

function startGame(roomCode: string, playerId: string): boolean {
  console.log("[GAME] Attempting to start game in room:", roomCode);
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    console.log("[GAME] Room not found:", roomCode);
    return false;
  }

  if (room.hostId !== playerId) {
    console.log("[GAME] Only host can start game");
    return false;
  }

  if (room.game.status === "playing") {
    console.log("[GAME] Game already in progress");
    return false;
  }

  const targetWord = getRandomWord();
  room.game = {
    status: "playing",
    targetWord,
    currentRow: 0,
    winner: null,
    startedAt: Date.now(),
    endedAt: null,
    maxGuesses: 6,
  };

  room.players.forEach((player) => {
    player.guesses = [];
    player.letterStates = [];
  });

  room.updatedAt = Date.now();

  console.log("[GAME] Game started in room:", roomCode, "with word:", targetWord);
  return true;
}

function playAgain(roomCode: string, playerId: string): boolean {
  console.log("[GAME] Attempting to play again in room:", roomCode);
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    console.log("[GAME] Room not found:", roomCode);
    return false;
  }

  if (room.hostId !== playerId) {
    console.log("[GAME] Only host can play again");
    return false;
  }

  if (room.game.status !== "finished") {
    console.log("[GAME] Game must be finished to play again");
    return false;
  }

  const targetWord = getRandomWord();
  room.game = {
    status: "playing",
    targetWord,
    currentRow: 0,
    winner: null,
    startedAt: Date.now(),
    endedAt: null,
    maxGuesses: 6,
  };

  room.players.forEach((player) => {
    player.guesses = [];
    player.letterStates = [];
  });

  room.updatedAt = Date.now();

  console.log("[GAME] Game restarted in room:", roomCode, "with new word:", targetWord);
  return true;
}

function submitGuess(roomCode: string, playerId: string, guess: string): { success: boolean; letterStates?: LetterState[]; row?: number; isWin?: boolean; error?: string } {
  console.log("[GAME] Submitting guess:", guess, "from player:", playerId, "in room:", roomCode);
  const room = rooms.get(roomCode.toUpperCase());

  if (!room) {
    return { success: false, error: "Room not found" };
  }

  if (room.game.status !== "playing") {
    return { success: false, error: "Game not in progress" };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { success: false, error: "Player not found" };
  }

  if (guess.length !== 5) {
    return { success: false, error: "Guess must be 5 letters" };
  }

  if (player.guesses.length >= room.game.maxGuesses) {
    return { success: false, error: "No more guesses remaining" };
  }

  const letterStates = evaluateGuess(guess, room.game.targetWord);
  const currentRow = player.guesses.length;

  player.guesses.push(guess.toUpperCase());
  player.letterStates.push(letterStates);
  player.lastSeen = Date.now();
  room.updatedAt = Date.now();

  const isWin = guess.toUpperCase() === room.game.targetWord;

  if (isWin && !room.game.winner) {
    // First winner - set them as winner but don't end game yet
    room.game.winner = playerId;
    console.log("[GAME] Player", player.name, "won the game! Others can continue playing.");
  }

  // Check if all players have finished (either won or used all guesses)
  const allPlayersFinished = Array.from(room.players.values()).every(
    (p) => p.guesses.length >= room.game.maxGuesses || p.guesses[p.guesses.length - 1] === room.game.targetWord
  );

  if (allPlayersFinished && room.game.status === "playing") {
    room.game.status = "finished";
    room.game.endedAt = Date.now();
    console.log("[GAME] All players finished. Game ended.");
  }

  return { success: true, letterStates, row: currentRow, isWin };
}

function handlePlayerDisconnect(socketId: string): { roomCode: string; playerId: string } | null {
  console.log("[SOCKET] Handling disconnect for socket:", socketId);

  for (const [roomCode, room] of rooms.entries()) {
    for (const [playerId, player] of room.players.entries()) {
      if (player.socketId === socketId) {
        player.isConnected = false;
        player.lastSeen = Date.now();
        room.updatedAt = Date.now();
        console.log("[SOCKET] Player", player.name, "disconnected from room:", roomCode);
        return { roomCode, playerId };
      }
    }
  }

  return null;
}

function cleanupEmptyRooms(): void {
  console.log("[CLEANUP] Checking for empty rooms...");
  let cleanedCount = 0;

  for (const [roomCode, room] of rooms.entries()) {
    const allDisconnected = Array.from(room.players.values()).every((p) => !p.isConnected);
    const timeSinceUpdate = Date.now() - room.updatedAt;

    if (allDisconnected && timeSinceUpdate > 5 * 60 * 1000) {
      rooms.delete(roomCode);
      cleanedCount++;
      console.log("[CLEANUP] Deleted empty room:", roomCode);
    }
  }

  console.log("[CLEANUP] Cleaned up", cleanedCount, "rooms");
}

export function setupSocketHandlers(httpServer: HTTPServer): SocketIOServer {
  console.log("[SOCKET SERVER] Setting up Socket.IO...");

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[SOCKET] Client connected:", socket.id);

    socket.on("room:create", ({ playerName }) => {
      console.log("[SOCKET] room:create event from:", socket.id);

      try {
        const room = createRoom(playerName, socket.id);
        const player = room.players.get(room.hostId)!;

        socket.join(room.code);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.data.playerName = playerName;

        socket.emit("room:joined", { room: sanitizeRoomData(room), player });
        console.log("[SOCKET] Room created and joined:", room.code);
      } catch (error) {
        console.error("[SOCKET] Error creating room:", error);
        socket.emit("error", { message: "Failed to create room" });
      }
    });

    socket.on("room:join", ({ roomCode, playerName }) => {
      console.log("[SOCKET] room:join event from:", socket.id);

      try {
        const result = joinRoom(roomCode, playerName, socket.id);

        if (!result) {
          socket.emit("error", { message: "Room not found or game already in progress" });
          return;
        }

        const { room, player } = result;

        socket.join(room.code);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;
        socket.data.playerName = playerName;

        socket.emit("room:joined", { room: sanitizeRoomData(room), player });
        socket.to(room.code).emit("room:playerJoined", {
          player,
          playerCount: room.players.size,
        });

        console.log("[SOCKET] Player joined room:", room.code);
      } catch (error) {
        console.error("[SOCKET] Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("room:rejoin", ({ roomCode, playerId }) => {
      console.log("[SOCKET] room:rejoin event from:", socket.id);

      try {
        const result = rejoinRoom(roomCode, playerId, socket.id);

        if (!result) {
          socket.emit("error", { message: "Room or player not found" });
          return;
        }

        const { room, player } = result;

        socket.join(room.code);
        socket.data.playerId = player.id;
        socket.data.roomCode = room.code;

        socket.emit("room:joined", { room: sanitizeRoomData(room), player });
        socket.to(room.code).emit("room:playerReconnected", { player });

        console.log("[SOCKET] Player rejoined room:", room.code);
      } catch (error) {
        console.error("[SOCKET] Error rejoining room:", error);
        socket.emit("error", { message: "Failed to rejoin room" });
      }
    });

    socket.on("room:leave", () => {
      console.log("[SOCKET] room:leave event from:", socket.id);

      const disconnectInfo = handlePlayerDisconnect(socket.id);
      if (disconnectInfo) {
        const { roomCode, playerId } = disconnectInfo;
        const room = rooms.get(roomCode);

        if (room) {
          socket.to(roomCode).emit("room:playerLeft", {
            playerId,
            playerCount: room.players.size,
          });
        }

        socket.leave(roomCode);
        console.log("[SOCKET] Player left room:", roomCode);
      }
    });

    socket.on("game:start", () => {
      console.log("[SOCKET] game:start event from:", socket.id);

      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;

      if (!roomCode || !playerId) {
        socket.emit("error", { message: "Not in a room" });
        return;
      }

      const success = startGame(roomCode, playerId);

      if (success) {
        const room = rooms.get(roomCode)!;
        io.to(roomCode).emit("game:started", { game: room.game });
        console.log("[SOCKET] Game started in room:", roomCode);
      } else {
        socket.emit("error", { message: "Failed to start game" });
      }
    });

    socket.on("game:submitGuess", ({ guess }) => {
      console.log("[SOCKET] game:submitGuess event from:", socket.id);

      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;

      if (!roomCode || !playerId) {
        socket.emit("error", { message: "Not in a room" });
        return;
      }

      const result = submitGuess(roomCode, playerId, guess);

      if (result.success && result.letterStates !== undefined && result.row !== undefined) {
        const room = rooms.get(roomCode)!;
        const player = room.players.get(playerId)!;

        io.to(roomCode).emit("game:guessResult", {
          playerId,
          guess,
          letterStates: result.letterStates,
          row: result.row,
        });

        // If someone won, notify everyone
        if (result.isWin) {
          io.to(roomCode).emit("game:playerWon", {
            playerId,
            playerName: player.name,
          });
        }

        // If game ended (all players finished)
        if (room.game.status === "finished") {
          io.to(roomCode).emit("game:ended", {
            winner: room.game.winner,
            targetWord: room.game.targetWord,
          });
        }

        console.log("[SOCKET] Guess processed for player:", playerId);
      } else {
        socket.emit("error", { message: result.error || "Invalid guess" });
      }
    });

    socket.on("game:playAgain", () => {
      console.log("[SOCKET] game:playAgain event from:", socket.id);

      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;

      if (!roomCode || !playerId) {
        socket.emit("error", { message: "Not in a room" });
        return;
      }

      const success = playAgain(roomCode, playerId);

      if (success) {
        const room = rooms.get(roomCode)!;
        io.to(roomCode).emit("game:started", { game: room.game, players: Array.from(room.players.values()) });
        console.log("[SOCKET] Game restarted in room:", roomCode);
      } else {
        socket.emit("error", { message: "Failed to restart game" });
      }
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Client disconnected:", socket.id);

      const disconnectInfo = handlePlayerDisconnect(socket.id);
      if (disconnectInfo) {
        const { roomCode, playerId } = disconnectInfo;
        const room = rooms.get(roomCode);

        if (room) {
          socket.to(roomCode).emit("room:playerDisconnected", { playerId });
        }
      }
    });
  });

  // Start cleanup interval
  setInterval(cleanupEmptyRooms, 60 * 1000);

  console.log("[SOCKET SERVER] Socket.IO setup complete");
  return io;
}

export { rooms };
