"use client";

import type { LetterState } from "@/lib/types/game";

interface MiniBoardProps {
  guesses: string[];
  letterStates: LetterState[][];
  maxGuesses?: number;
  size?: "sm" | "md";
}

export function MiniBoard({ 
  guesses, 
  letterStates, 
  maxGuesses = 6,
  size = "sm" 
}: MiniBoardProps) {
  const tileSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";
  
  const rows = [];

  for (let i = 0; i < maxGuesses; i++) {
    const isSubmitted = i < guesses.length;
    const states = letterStates[i] || [];

    const tiles = [];
    for (let j = 0; j < 5; j++) {
      const status = isSubmitted && states[j] ? states[j].status : "empty";
      
      let bgColor = "bg-gray-200";
      if (status === "correct") bgColor = "bg-[var(--nb-correct)]";
      else if (status === "present") bgColor = "bg-[var(--nb-present)]";
      else if (status === "absent") bgColor = "bg-[var(--nb-absent)]";
      
      tiles.push(
        <div
          key={j}
          className={`${tileSize} ${bgColor} rounded-sm border border-black/20`}
        />
      );
    }

    rows.push(
      <div key={i} className={`flex ${gap}`}>
        {tiles}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${gap}`}>
      {rows}
    </div>
  );
}
