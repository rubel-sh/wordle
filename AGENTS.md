# Multiplayer Wordle - Project Documentation

A real-time multiplayer Wordle game built with Next.js, Socket.IO, and Zustand. Play Wordle with friends in real-time!

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture & Logic](#architecture--logic)
- [UI/UX Pattern](#uiux-pattern)
- [How to Run](#how-to-run)
- [How to Develop](#how-to-develop)
- [How to Contribute](#how-to-contribute)

---

## Project Overview

This is a multiplayer version of the popular word guessing game Wordle. Players can:

- **Create Rooms**: Generate a unique 6-character room code to invite friends
- **Join Rooms**: Enter a room code to join an existing game
- **Real-time Play**: All players guess the same word simultaneously
- **Competitive Play**: See other players' progress on mini-boards
- **Win Detection**: First player to guess correctly wins, but others can continue playing

### Game Rules

- Each player gets 6 attempts to guess a 5-letter word
- After each guess, feedback shows:
  - **Green (Correct)**: Letter is in the correct position
  - **Yellow (Present)**: Letter is in the word but wrong position
  - **Gray (Absent)**: Letter is not in the word

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Real-time** | Socket.IO (Server + Client) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS v4 |
| **Animations** | GSAP, canvas-confetti |
| **Icons** | Lucide React |
| **Dev Tools** | TSX (TypeScript Execute) |

### Dependencies

- `next` - React framework with SSR/SSG
- `socket.io` / `socket.io-client` - WebSocket communication
- `zustand` - Lightweight state management
- `tailwindcss` - Utility-first CSS framework
- `gsap` - Animation library
- `canvas-confetti` - Confetti effects for wins
- `lucide-react` - Icon library
- `tsx` - TypeScript execution for development server

---

## Project Structure

```
project-wordle-multiplayer/
├── app/                        # Next.js App Router
│   ├── api/socket/             # Socket.IO endpoint
│   │   └── route.ts           # Socket.IO route handler
│   ├── globals.css            # Global styles (Tailwind + custom)
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page (GameContent)
│
├── components/
│   └── game/                  # Game-related components
│       ├── Board.tsx          # Main game board (6 rows)
│       ├── Row.tsx            # Single row of 5 tiles
│       ├── Tile.tsx           # Individual letter tile
│       ├── Keyboard.tsx       # On-screen keyboard
│       ├── Lobby.tsx          # Create/Join room UI
│       ├── RoomView.tsx       # Main game room view
│       ├── MiniBoard.tsx     # Small board for player list
│       └── DevWordReveal.tsx # Dev mode word reveal
│
├── lib/
│   ├── data/
│   │   └── words.ts           # Word list (500+ words)
│   ├── types/
│   │   └── game.ts            # TypeScript interfaces
│   └── utils.ts               # Utility functions (cn)
│
├── server/
│   └── socket.ts              # Socket.IO server logic
│
├── stores/
│   └── gameStore.ts           # Zustand state management
│
├── server.ts                  # Custom Next.js server entry
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── postcss.config.mjs         # PostCSS config
└── eslint.config.mjs           # ESLint config
```

---

## Architecture & Logic

### Server Architecture

The project uses a **custom Node.js server** (`server.ts`) that combines:

1. **Next.js Handler**: Handles all HTTP requests via Next.js
2. **Socket.IO Server**: Manages WebSocket connections

```
┌─────────────────────────────────────────────────┐
│              Custom Server (server.ts)          │
├─────────────────────────────────────────────────┤
│  HTTP Requests    │    WebSocket (Socket.IO)    │
│  ─────────────   │    ─────────────────────    │
│  Next.js App     │    /api/socket path         │
│  (getRequestHandler) │  Room Management        │
│                   │    Game Logic              │
└─────────────────────────────────────────────────┘
```

### Socket.IO Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room:create` | `{ playerName: string }` | Create new room |
| `room:join` | `{ roomCode: string, playerName: string }` | Join existing room |
| `room:rejoin` | `{ roomCode: string, playerId: string }` | Reconnect to room |
| `room:leave` | - | Leave current room |
| `game:start` | - | Host starts the game |
| `game:submitGuess` | `{ guess: string }` | Submit a guess |
| `game:playAgain` | - | Request new game (host only) |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room:joined` | `{ room: RoomData, player: Player }` | Successfully joined |
| `room:playerJoined` | `{ player: Player, playerCount: number }` | New player joined |
| `room:playerLeft` | `{ playerId: string, playerCount: number }` | Player left |
| `room:playerDisconnected` | `{ playerId: string }` | Player lost connection |
| `game:started` | `{ game: GameState }` | Game begins |
| `game:guessResult` | `{ playerId, guess, letterStates, row }` | Guess evaluated |
| `game:playerWon` | `{ playerId, playerName }` | Someone won |
| `game:ended` | `{ winner: string, targetWord: string }` | Game over |

### State Management (Zustand)

The `gameStore.ts` manages all client-side state:

```typescript
interface GameStore {
  socket: Socket | null;
  room: RoomData | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  submitGuess: (guess: string) => void;
  // ... more actions
}
```

### Game Logic

Located in `server/socket.ts`:

1. **Room Management**
   - Rooms stored in memory (`Map<string, Room>`)
   - Auto-cleanup of empty rooms after 5 minutes
   - 6-character alphanumeric room codes

2. **Guess Evaluation**
   - Compare guess against target word
   - First pass: Mark correct positions (green)
   - Second pass: Mark present letters (yellow), handling duplicates correctly

3. **Win Condition**
   - First correct guess wins
   - Game continues until all players finish
   - Host can start a new game with `playAgain`

---

## UI/UX Pattern

### Design System (Custom CSS Variables)

The project uses a cohesive design system defined in `globals.css`:

```css
:root {
  /* Colors */
  --nb-bg: #fefae0;          /* Cream background */
  --nb-bg-dark: #faedcd;     /* Darker cream */
  --nb-primary: #d4a373;     /* Warm brown */
  --nb-secondary: #ccd5ae;   /* Sage green */
  --nb-accent: #e9edc9;     /* Light green */
  --nb-correct: #6aaa64;    /* Wordle green */
  --nb-present: #c9b458;    /* Wordle yellow */
  --nb-absent: #787c7e;     /* Gray */
  --nb-error: #ff6b6b;      /* Error red */
  
  /* Shadows */
  --nb-shadow-sm: 2px 2px 0px black;
  --nb-shadow-md: 4px 4px 0px black;
  --nb-shadow-lg: 6px 6px 0px black;
}
```

### Component Patterns

All components follow these patterns:

1. **Borders**: 3px solid black borders
2. **Shadows**: Hard drop shadows (no blur)
3. **Border Radius**: 8px (0.5rem)
4. **Animations**: GSAP for complex, CSS for simple
5. **Interactions**: Scale + shadow on hover, pressed state on click

### Custom CSS Classes

| Class | Description |
|-------|-------------|
| `.nb-card` | Card container with border + shadow |
| `.nb-button` | Primary button with hover effect |
| `.nb-button-secondary` | Secondary action button |
| `.nb-button-danger` | Danger/delete button |
| `.nb-input` | Input field with border + shadow |
| `.nb-tile` | Letter tile (correct/present/absent states) |
| `.nb-key` | Keyboard key |
| `.nb-badge` | Small label/badge |

### Layout

```
┌────────────────────────────────────────────────┐
│  Header: Logo + Connection Status             │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Players    │  │     Game Board      │   │
│  │   (Sidebar)  │  │                     │   │
│  │              │  │  [Board Component]  │   │
│  │  - Player 1  │  │  [Keyboard]         │   │
│  │  - Player 2  │  │                     │   │
│  │  - MiniBoard │  │                     │   │
│  └──────────────┘  └─────────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

Responsive: Single column on mobile, 2-column (sidebar + main) on desktop.

---

## How to Run

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm/bun)

### Installation

```bash
# Clone the repository
cd project-wordle-multiplayer

# Install dependencies
npm install
```

### Development Mode

```bash
npm run dev
```

This runs the custom server (`server.ts`) which starts:
- Next.js app on `http://localhost:3000`
- Socket.IO server on `/api/socket`

### Production Build

```bash
# Build the Next.js app
npm run build

# Start production server
npm start
```

### Opening the Game

1. Open browser to `http://localhost:3000`
2. Create a room (enter your name, click "Create Room")
3. Share the room code with friends
4. Friends join by entering the room code
5. Host clicks "Start Game" when ready

---

## How to Develop

### Project Setup

1. **Codebase Structure**
   - `app/` - Next.js pages and API routes
   - `components/game/` - React components
   - `server/` - Server-side logic
   - `stores/` - Client state (Zustand)
   - `lib/` - Shared types, data, utilities

2. **Development Workflow**
   - All game logic is in `server/socket.ts`
   - Client state is in `stores/gameStore.ts`
   - UI components are in `components/game/`

### Key Files to Edit

| File | Purpose |
|------|---------|
| `lib/data/words.ts` | Add/remove words from word list |
| `server/socket.ts` | Modify game logic, room rules |
| `stores/gameStore.ts` | Add client-side state/actions |
| `components/game/*.tsx` | Modify UI components |
| `app/globals.css` | Add/modify design system |

### Adding New Features

1. **New Socket Event**
   - Add type to `lib/types/game.ts`
   - Add handler in `server/socket.ts`
   - Add listener in `stores/gameStore.ts`
   - Use in component

2. **New UI Component**
   - Create in `components/game/`
   - Use existing CSS classes (`.nb-card`, `.nb-button`, etc.)
   - Import in `RoomView.tsx` or `page.tsx`

### Debugging

The codebase includes extensive console logging:

```bash
# Server logs
[SERVER] Starting server...
[SOCKET] Client connected: xyz
[GAME] Submitting guess: HELLO
[STORE] Guess result for player: abc

# In browser console
[HOME] Component mounted
[LOBBY] Creating room for: John
[STORE] Socket connected: xyz
```

### Environment Variables

Currently no required env vars. The server runs on localhost:3000.

---

## How to Contribute

### Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Runs on commit
- **Formatting**: Prettier (via ESLint)
- **Tailwind**: Utility classes, custom classes in `globals.css`

### Common Contribution Types

#### Bug Fixes
1. Describe the bug in issue
2. Create test case
3. Fix in appropriate file
4. Verify with `npm run dev`

#### New Features
1. Open discussion in issues first
2. Design approach before coding
3. Follow existing patterns in codebase
4. Add types for any new data structures

#### UI Improvements
1. Keep design system consistent
2. Use existing CSS classes
3. Test responsive layouts
4. Check accessibility

### Submitting Changes

1. Commit with clear messages:
   ```bash
   git commit -m "Add: New feature description"
   ```

2. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Open a Pull Request

### Testing Checklist

Before submitting:
- [ ] Game creates and joins rooms correctly
- [ ] Multiple players see each other's progress
- [ ] Win detection works correctly
- [ ] Reconnection after disconnect works
- [ ] No console errors in browser
- [ ] `npm run build` completes successfully

---

## License

MIT License - Feel free to use this project for learning or personal projects.

---

## Acknowledgments

- [Wordle](https://www.nytimes.com/games/wordle/) - Original game inspiration
- [Next.js](https://nextjs.org/) - Framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
