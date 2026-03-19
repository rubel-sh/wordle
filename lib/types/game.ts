export type LetterStatus = "correct" | "present" | "absent" | "empty";

export interface LetterState {
  letter: string;
  status: LetterStatus;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  guesses: string[];
  letterStates: LetterState[][];
  isConnected: boolean;
  joinedAt: number;
  lastSeen: number;
}

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
  status: GameStatus;
  targetWord: string;
  currentRow: number;
  winner: string | null;
  startedAt: number | null;
  endedAt: number | null;
  maxGuesses: number;
}

export interface Room {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  game: GameState;
  createdAt: number;
  updatedAt: number;
}

export interface RoomData {
  code: string;
  hostId: string;
  players: Player[];
  game: GameState;
  createdAt: number;
  updatedAt: number;
}

export interface ServerToClientEvents {
  "room:joined": (data: { room: RoomData; player: Player }) => void;
  "room:playerJoined": (data: { player: Player; playerCount: number }) => void;
  "room:playerLeft": (data: { playerId: string; playerCount: number }) => void;
  "room:playerReconnected": (data: { player: Player }) => void;
  "room:playerDisconnected": (data: { playerId: string }) => void;
  "game:started": (data: { game: GameState; players?: Player[] }) => void;
  "game:guessResult": (data: {
    playerId: string;
    guess: string;
    letterStates: LetterState[];
    row: number;
  }) => void;
  "game:playerWon": (data: { playerId: string; playerName: string }) => void;
  "game:playerLost": (data: { playerId: string; targetWord: string }) => void;
  "game:ended": (data: { winner: string | null; targetWord: string }) => void;
  "error": (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "room:create": (data: { playerName: string }) => void;
  "room:join": (data: { roomCode: string; playerName: string }) => void;
  "room:rejoin": (data: { roomCode: string; playerId: string }) => void;
  "room:leave": () => void;
  "game:start": () => void;
  "game:submitGuess": (data: { guess: string }) => void;
  "game:playAgain": () => void;
  "ping": () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  roomCode: string;
  playerName: string;
}
