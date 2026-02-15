"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Gamepad2, Wifi, WifiOff } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { Lobby } from "@/components/game/Lobby";
import { RoomView } from "@/components/game/RoomView";

function GameContent() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const connectionAttempted = useRef(false);

  const {
    connect,
    createRoom,
    joinRoom,
    rejoinRoom,
    leaveRoom,
    startGame,
    submitGuess,
    playAgain,
    setError,
    room,
    currentPlayer,
    isConnected,
    isConnecting,
    error,
  } = useGameStore();

  useEffect(() => {
    console.log("[HOME] Component mounted");
    setIsClient(true);
    
    if (!connectionAttempted.current) {
      connectionAttempted.current = true;
      connect();
    }

    const playerId = localStorage.getItem("wordle_player_id");
    const roomCode = localStorage.getItem("wordle_room_code");

    if (playerId && roomCode) {
      console.log("[HOME] Attempting to rejoin room:", roomCode);
      rejoinRoom(roomCode, playerId);
    }
  }, [connect, rejoinRoom]);

  const handleClearError = () => {
    setError(null);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nb-bg)]">
        <div className="text-2xl font-black animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--nb-bg)]">
      {/* Header */}
      <header className="bg-[var(--nb-bg-dark)] border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--nb-primary)] p-2 rounded-lg border-2 border-black">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Wordle</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-black">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-600">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4">
        {!room || !currentPlayer ? (
          <Lobby
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isConnecting={isConnecting}
            error={error}
          />
        ) : (
          <RoomView
            room={room}
            currentPlayer={currentPlayer}
            error={error}
            onStartGame={startGame}
            onSubmitGuess={submitGuess}
            onLeaveRoom={leaveRoom}
            onPlayAgain={playAgain}
            onClearError={handleClearError}
          />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--nb-bg)]">
        <div className="text-2xl font-black animate-pulse">Loading...</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
