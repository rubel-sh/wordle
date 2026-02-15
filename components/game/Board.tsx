"use client";

import { useEffect, useCallback } from "react";
import type { LetterState } from "@/lib/types/game";
import { Row } from "./Row";

interface BoardProps {
  guesses: string[];
  letterStates: LetterState[][];
  currentGuess: string;
  maxGuesses?: number;
}

export function Board({
  guesses,
  letterStates,
  currentGuess,
  maxGuesses = 6,
}: BoardProps) {
  const rows = [];

  for (let i = 0; i < maxGuesses; i++) {
    const isCurrentRow = i === guesses.length;
    const guess = isCurrentRow ? currentGuess : guesses[i] || "";
    const states = letterStates[i] || [];
    const isSubmitted = i < guesses.length;

    rows.push(
      <Row
        key={i}
        guess={guess}
        letterStates={states}
        isCurrentRow={isCurrentRow}
        isSubmitted={isSubmitted}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows}
    </div>
  );
}
