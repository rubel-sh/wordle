"use client";

import { useState } from "react";
import { Users, Plus, LogIn, Copy, Check, Gamepad2 } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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

  const copyInviteLink = () => {
    const link = `${window.location.origin}?code=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--nb-primary)] rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <Gamepad2 className="w-12 h-12" />
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

      {/* Mode Toggle */}
      <div className="nb-card p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              mode === "create"
                ? "bg-[var(--nb-primary)] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create Room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              mode === "join"
                ? "bg-[var(--nb-primary)] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <LogIn className="w-5 h-5 inline mr-2" />
            Join Room
          </button>
        </div>
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

        {/* Invite Link Section */}
        {mode === "join" && (
          <div className="mt-6 pt-6 border-t-2 border-black/10">
            <p className="text-sm text-center text-[var(--nb-text-light)] mb-3">
              Or paste a room code from an invite link
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Paste room code"
                className="nb-input flex-1 text-center font-mono"
                maxLength={6}
              />
              <button
                onClick={copyInviteLink}
                disabled={!roomCode.trim()}
                className="nb-button-secondary px-4"
                title="Copy invite link"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-[var(--nb-text-light)]">
        <p className="text-sm">Play with friends in real-time!</p>
      </div>
    </div>
  );
}
