"use client";

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
  const handleClick = (key: string) => {
    console.log("[KEYBOARD] Key pressed:", key);
    onKeyPress(key);
  };

  return (
    <div className="flex flex-col gap-2">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((key) => {
            const status = letterStates.get(key);
            const isSpecial = key === "ENTER" || key === "BACKSPACE";

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={`nb-key ${status || ""} ${isSpecial ? "px-3" : ""}`}
              >
                {key === "BACKSPACE" ? "←" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
