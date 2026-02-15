"use client";

import type { LetterState } from "@/lib/types/game";

interface TileProps {
  letter?: string;
  status?: LetterState["status"];
  isActive?: boolean;
}

export function Tile({ letter = "", status = "empty", isActive = false }: TileProps) {
  return (
    <div
      className={`nb-tile ${status} ${isActive ? "ring-2 ring-black" : ""}`}
    >
      {letter}
    </div>
  );
}
