"use client";

import type { LetterState } from "@/lib/types/game";
import { Tile } from "./Tile";

interface RowProps {
  guess: string;
  letterStates?: LetterState[];
  isCurrentRow?: boolean;
  isSubmitted?: boolean;
}

export function Row({
  guess,
  letterStates = [],
  isCurrentRow = false,
  isSubmitted = false,
}: RowProps) {
  const tiles = [];

  for (let i = 0; i < 5; i++) {
    const letter = guess[i] || "";
    const status = isSubmitted && letterStates[i] ? letterStates[i].status : "empty";

    tiles.push(
      <Tile
        key={i}
        letter={letter}
        status={status}
        isActive={isCurrentRow && i === guess.length}
      />
    );
  }

  return (
    <div className="flex gap-2 justify-center">
      {tiles}
    </div>
  );
}
