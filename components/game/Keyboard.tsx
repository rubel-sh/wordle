"use client";

import { useState, useEffect, useCallback } from "react";
import type { LetterState } from "@/lib/types/game";

const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates?: Map<string, LetterState["status"]>;
}

export function Keyboard({ onKeyPress, letterStates = new Map() }: KeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleClick = useCallback((key: string) => {
    console.log("[KEYBOARD] Key pressed:", key);
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    onKeyPress(key);
  }, [onKeyPress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        setPressedKey("ENTER");
        setTimeout(() => setPressedKey(null), 150);
      } else if (key === "BACKSPACE") {
        setPressedKey("BACKSPACE");
        setTimeout(() => setPressedKey(null), 150);
      } else if (/^[A-Z]$/.test(key)) {
        setPressedKey(key);
        setTimeout(() => setPressedKey(null), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center">
          {row.map((key) => {
            const status = letterStates.get(key);
            const isSpecial = key === "ENTER" || key === "BACKSPACE";
            const isPressed = pressedKey === key;

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                data-key={key}
                className={`
                  nb-key 
                  ${status || ""} 
                  ${isSpecial ? "px-4 min-w-[4rem]" : ""}
                  ${isPressed ? "nb-key-pressed" : ""}
                `}
              >
                <span className="relative z-10">
                  {key === "BACKSPACE" ? "←" : key}
                </span>
                {isPressed && <span className="nb-key-ripple" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
