"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
            key={`${room.code}-${room.game.startedAt || 'waiting'}`}
            room={room}
            currentPlayer={currentPlayer}
            error={error}
            isConnected={isConnected}
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
