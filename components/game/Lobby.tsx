"use client";

import { useState } from "react";
import { Users, Plus, LogIn } from "lucide-react";
import { WordleLogo } from "./WordleLogo";

interface LobbyProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  isConnecting: boolean;
  error: string | null;
}

export function Lobby({ onCreateRoom, onJoinRoom, isConnecting, error }: LobbyProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      console.log("[LOBBY] Creating room for:", playerName);
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      console.log("[LOBBY] Joining room:", roomCode, "as:", playerName);
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <WordleLogo size="lg" />
        </div>
        <h2 className="text-4xl font-black mb-3 tracking-tight">Multiplayer Wordle</h2>
        <p className="text-[var(--nb-text-light)] text-lg">
          Create a room or join friends to play together!
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-[var(--nb-error)] text-white p-4 rounded-xl mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-xl">⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* Mode Toggle - Sleek Sliding Animation */}
      <div className="relative mb-8">
        <div className="bg-[var(--nb-bg-dark)] rounded-2xl p-1.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="relative flex">
            {/* Sliding Background */}
            <div
              className="absolute top-0 bottom-0 w-1/2 bg-[var(--nb-primary)] rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                transform: mode === "create" ? "translateX(0%)" : "translateX(100%)",
              }}
            />
            
            {/* Create Button */}
            <button
              onClick={() => setMode("create")}
              className={`relative z-10 flex-1 py-3.5 px-2 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 ${
                mode === "create"
                  ? "text-black"
                  : "text-[var(--nb-text-light)] hover:text-black"
              }`}
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ${mode === "create" ? "scale-110" : "scale-100"}`} />
              <span>Create</span>
            </button>

            {/* Join Button */}
            <button
              onClick={() => setMode("join")}
              className={`relative z-10 flex-1 py-3.5 px-2 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 ${
                mode === "join"
                  ? "text-black"
                  : "text-[var(--nb-text-light)] hover:text-black"
              }`}
            >
              <LogIn className={`w-5 h-5 transition-transform duration-300 ${mode === "join" ? "scale-110" : "scale-100"}`} />
              <span>Join</span>
            </button>
          </div>
        </div>
        
        {/* Decorative glow effect */}
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-[var(--nb-primary)]/20 via-transparent to-[var(--nb-primary)]/20 rounded-3xl blur-xl transition-opacity duration-500 -z-10"
          style={{ opacity: mode === "create" ? 0.6 : 0.3 }}
        />
      </div>

      {/* Form */}
      <div className="nb-card p-8">
        {mode === "create" ? (
          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div>
              <label className="block font-bold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="nb-input w-full text-lg py-4"
                maxLength={20}
                disabled={isConnecting}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || isConnecting}
              className="nb-button w-full text-lg py-4 disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Creating...
                </span>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create Room
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label className="block font-bold text-lg mb-3">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="nb-input w-full text-lg py-4 uppercase text-center tracking-[0.3em] font-mono font-bold"
                maxLength={6}
                disabled={isConnecting}
                autoFocus
              />
            </div>
            <div>
              <label className="block font-bold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="nb-input w-full text-lg py-4"
                maxLength={20}
                disabled={isConnecting}
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !roomCode.trim() || isConnecting}
              className="nb-button w-full text-lg py-4 disabled:opacity-50"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Joining...
                </span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 inline mr-2" />
                  Join Room
                </>
              )}
            </button>
          </form>
        )}


      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-[var(--nb-text-light)]">
        <p className="text-sm">Play with friends in real-time!</p>
      </div>
    </div>
  );
}
