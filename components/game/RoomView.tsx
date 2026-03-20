"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, Crown, Wifi, WifiOff, Play, LogOut, Trophy, AlertCircle, Target, Eye } from "lucide-react";
import type { RoomData, Player, GameState } from "@/lib/types/game";
import { Board } from "./Board";
import { Keyboard } from "./Keyboard";
import { MiniBoard } from "./MiniBoard";
import { DevWordReveal } from "./DevWordReveal";
import confetti from "canvas-confetti";
import { gsap } from "gsap";

interface RoomViewProps {
  room: RoomData;
  currentPlayer: Player;
  error: string | null;
  onStartGame: () => void;
  onSubmitGuess: (guess: string) => void;
  onLeaveRoom: () => void;
  onPlayAgain: () => void;
  onClearError: () => void;
}

export function RoomView({
  room,
  currentPlayer,
  error,
  onStartGame,
  onSubmitGuess,
  onLeaveRoom,
  onPlayAgain,
  onClearError,
}: RoomViewProps) {
  const [currentGuess, setCurrentGuess] = useState("");
  const [letterStates, setLetterStates] = useState<Map<string, "correct" | "present" | "absent">>(new Map());
  const [localError, setLocalError] = useState<string | null>(null);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [shakeRow, setShakeRow] = useState<number | undefined>(undefined);
  const winnerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const hasConfettiFired = useRef(false);

  // Reset local state when game starts/restarts
  useEffect(() => {
    if (room.game.status === "playing" && room.game.startedAt) {
      setCurrentGuess("");
      setWordRevealed(false);
      setHasWon(false);
      setHasFinished(false);
      setLocalError(null);
      setShowRevealButton(false);
    }
  }, [room.game.status, room.game.startedAt]);

  // Check if current player has won or finished
  useEffect(() => {
    const lastGuess = currentPlayer.guesses[currentPlayer.guesses.length - 1];
    const won = lastGuess === room.game.targetWord && room.game.targetWord !== "";
    const finished = won || currentPlayer.guesses.length >= room.game.maxGuesses;
    
    setHasWon(won);
    setHasFinished(finished);
    
    // Show reveal button if finished and game is still ongoing
    if (finished && room.game.status === "playing") {
      setShowRevealButton(true);
    }
  }, [currentPlayer.guesses, room.game.targetWord, room.game.maxGuesses, room.game.status]);

  // Trigger confetti when current player wins
  useEffect(() => {
    const lastGuess = currentPlayer.guesses[currentPlayer.guesses.length - 1];
    const justWon = lastGuess === room.game.targetWord && room.game.targetWord !== "";

    if (justWon && room.game.status === "playing" && !hasConfettiFired.current) {
      hasConfettiFired.current = true;

      // Confetti explosion
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // GSAP animation for winner banner
      if (winnerRef.current) {
        gsap.fromTo(winnerRef.current,
          { scale: 0, opacity: 0, y: -50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }
        );
      }

      return () => clearInterval(interval);
    }

    // Reset confetti flag when game restarts
    if (room.game.status === "waiting") {
      hasConfettiFired.current = false;
    }
  }, [currentPlayer.guesses, room.game.targetWord, room.game.status]);

  // GSAP animation when someone else wins
  useEffect(() => {
    if (room.game.winner && room.game.winner !== currentPlayer.id && room.game.status === "playing") {
      // Animate the board when someone else wins
      if (boardRef.current) {
        gsap.to(boardRef.current, {
          scale: 0.98,
          duration: 0.2,
          yoyo: true,
          repeat: 3,
          ease: "power2.inOut"
        });
      }
    }
  }, [room.game.winner, room.game.status, currentPlayer.id]);

  useEffect(() => {
    console.log("[ROOM VIEW] Room updated:", room.code, "Game status:", room.game.status);
  }, [room]);

  useEffect(() => {
    const states = new Map<string, "correct" | "present" | "absent">();

    currentPlayer.letterStates.forEach((row) => {
      row.forEach(({ letter, status }) => {
        const current = states.get(letter);
        if (status === "correct" || (status === "present" && current !== "correct")) {
          states.set(letter, status);
        } else if (status === "absent" && !current) {
          states.set(letter, status);
        }
      });
    });

    setLetterStates(states);
  }, [currentPlayer.letterStates]);

  // Show store errors in local state and trigger shake
  useEffect(() => {
    if (error) {
      setLocalError(error);
      setShakeRow(currentPlayer.guesses.length);
      setTimeout(() => setShakeRow(undefined), 500);
      onClearError();
      const timer = setTimeout(() => {
        setLocalError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError, currentPlayer.guesses.length]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (room.game.status !== "playing") return;
      if (currentPlayer.guesses.length >= room.game.maxGuesses) return;
      if (hasWon) return; // Can't type if already won

      if (key !== "ENTER") {
        setLocalError(null);
      }

      if (key === "ENTER") {
        if (currentGuess.length === 5) {
          onSubmitGuess(currentGuess);
          setCurrentGuess("");
        }
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, room.game.status, currentPlayer.guesses.length, room.game.maxGuesses, onSubmitGuess, hasWon]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const handleRevealWord = () => {
    setWordRevealed(true);
    // GSAP animation for reveal
    gsap.fromTo(".revealed-word",
      { rotationX: -90, opacity: 0 },
      { rotationX: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
    );
  };

  const isHost = currentPlayer.id === room.hostId;
  const canStart = isHost && room.game.status === "waiting" && room.players.length >= 1;
  const isPlaying = room.game.status === "playing";
  const isFinished = room.game.status === "finished";
  const winner = room.players.find((p) => p.id === room.game.winner);

  // Sort players: current player first, then by guess count (descending)
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.id === currentPlayer.id) return -1;
    if (b.id === currentPlayer.id) return 1;
    return b.guesses.length - a.guesses.length;
  });

  return (
    <div className="nb-container max-w-6xl">
      {/* Winner Banner - Shows when current player wins */}
      {hasWon && room.game.status === "playing" && (
        <div 
          ref={winnerRef}
          className="nb-card p-6 mb-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 border-4 border-black text-center"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-700" />
          <h2 className="text-4xl font-black mb-2 text-black">🎉 You Won! 🎉</h2>
          <p className="text-xl font-bold text-black/70">
            Amazing! You guessed the word!
          </p>
          <p className="text-lg text-black/60 mt-2">
            Waiting for other players to finish...
          </p>
        </div>
      )}

      {/* Someone Else Won Banner */}
      {room.game.winner && room.game.winner !== currentPlayer.id && room.game.status === "playing" && winner && (
        <div className="nb-card p-6 mb-6 bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 border-4 border-black text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-blue-700" />
          <h2 className="text-2xl font-black mb-2 text-black">{winner.name} Won!</h2>
          <p className="text-lg font-bold text-black/70">
            Keep playing to find the word!
          </p>
        </div>
      )}

      {/* Error Display */}
      {localError && (
        <div className="nb-card p-4 mb-6 bg-[var(--nb-error)] text-white border-[var(--nb-border)] animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold text-lg">{localError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Room Info + Players */}
        <div className="lg:col-span-1 space-y-4">
          {/* Room Info Card */}
          <div className="nb-card p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="nb-badge text-base py-2 px-3">
                  <Users className="w-4 h-4 mr-1" />
                  {room.players.length} Players
                </div>
                <div className="text-base font-mono font-bold bg-white px-3 py-2 rounded-lg border-2 border-black">
                  Room: <span className="text-[var(--nb-primary)]">{room.code}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canStart && (
                  <button onClick={onStartGame} className="nb-button px-4 py-2">
                    <Play className="w-4 h-4 inline mr-1" />
                    Start
                  </button>
                )}
                <button onClick={onLeaveRoom} className="nb-button nb-button-danger px-3 py-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Players Card */}
          <div className="nb-card p-4">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Players
            </h3>
            
            <div className="space-y-3">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    player.id === currentPlayer.id 
                      ? "bg-[var(--nb-primary)]/20 border-[var(--nb-primary)]" 
                      : "bg-white border-black"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {player.isHost && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="font-bold truncate">{player.name}</span>
                        {player.isConnected ? (
                          <Wifi className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <WifiOff className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                        {player.id === currentPlayer.id && (
                          <span className="text-xs bg-[var(--nb-primary)] text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {player.id === room.game.winner && (
                          <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                            👑 Winner
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--nb-text-light)]">
                        {player.guesses.length} / {room.game.maxGuesses} guesses
                      </div>
                    </div>
                    
                    {/* Mini Board */}
                    <MiniBoard 
                      guesses={player.guesses}
                      letterStates={player.letterStates}
                      maxGuesses={room.game.maxGuesses}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Game Board */}
        <div className="lg:col-span-2">
          {isPlaying && (
            <>
              <div ref={boardRef} className="nb-card p-8 mb-4">
                <Board
                  guesses={currentPlayer.guesses}
                  letterStates={currentPlayer.letterStates}
                  currentGuess={currentGuess}
                  maxGuesses={room.game.maxGuesses}
                  shakeRow={shakeRow}
                />
              </div>
              
              {/* Reveal Word Button - Shows when finished but game still ongoing */}
              {showRevealButton && !wordRevealed && !hasWon && (
                <div className="nb-card p-6 mb-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 text-center">
                  <p className="text-lg font-bold text-purple-800 mb-4">
                    You&apos;ve used all your guesses!
                  </p>
                  <button
                    onClick={handleRevealWord}
                    className="nb-button nb-button-lg"
                    style={{ backgroundColor: '#a855f7', color: 'white' }}
                  >
                    <Eye className="w-5 h-5 inline mr-2" />
                    Reveal the Word
                  </button>
                </div>
              )}

              {/* Revealed Word Display */}
              {wordRevealed && (
                <div className="revealed-word nb-card p-6 mb-4 bg-gradient-to-r from-yellow-200 to-orange-200 border-4 border-black text-center">
                  <p className="text-sm font-bold text-black/60 uppercase tracking-wide mb-2">
                    The word was
                  </p>
                  <p className="text-5xl font-black tracking-[0.2em] text-black">
                    {room.game.targetWord}
                  </p>
                </div>
              )}
              
              {!hasWon && !hasFinished && (
                <div className="nb-card p-6">
                  <Keyboard onKeyPress={handleKeyPress} letterStates={letterStates} />
                </div>
              )}

              {(hasWon || hasFinished) && room.game.status === "playing" && (
                <div className="nb-card p-8 text-center bg-gray-50">
                  <div className="text-6xl mb-4">⏳</div>
                  <h3 className="text-2xl font-bold mb-2">
                    {hasWon ? "You Won!" : "Out of Guesses"}
                  </h3>
                  <p className="text-[var(--nb-text-light)] text-lg">
                    Waiting for other players to finish...
                  </p>
                </div>
              )}
            </>
          )}

          {isFinished && (
            <div className="nb-card p-8 text-center">
              <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-4">
                {winner ? `${winner.name} Wins!` : "Game Over"}
              </h2>
              <p className="text-xl mb-6">
                The word was: <span className="font-bold text-2xl text-[var(--nb-primary)]">{room.game.targetWord}</span>
              </p>
              {isHost && (
                <button onClick={onPlayAgain} className="nb-button text-lg px-8 py-4">
                  Play Again
                </button>
              )}
            </div>
          )}

          {room.game.status === "waiting" && (
            <div className="nb-card p-12 text-center">
              <div className="text-6xl mb-6">🎮</div>
              <h3 className="text-2xl font-bold mb-4">Waiting to Start</h3>
              <p className="text-[var(--nb-text-light)] text-lg">
                {isHost
                  ? "Click 'Start Game' when all players are ready!"
                  : "Waiting for host to start the game..."}
              </p>
              
              {isHost && room.players.length > 1 && (
                <div className="mt-6 text-sm text-[var(--nb-text-light)]">
                  {room.players.length} players ready to play
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dev Mode Word Reveal - Only shows in development */}
      <DevWordReveal targetWord={room.game.targetWord} />
    </div>
  );
}
