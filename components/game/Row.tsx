"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { LetterState } from "@/lib/types/game";
import { Tile } from "./Tile";

interface RowProps {
  guess: string;
  letterStates?: LetterState[];
  isCurrentRow?: boolean;
  isSubmitted?: boolean;
  shake?: boolean;
}

export function Row({
  guess,
  letterStates = [],
  isCurrentRow = false,
  isSubmitted = false,
  shake = false,
}: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shake && rowRef.current) {
      gsap.fromTo(
        rowRef.current,
        { x: -10 },
        {
          x: 10,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(rowRef.current, { x: 0, duration: 0.1 });
          },
        }
      );
    }
  }, [shake]);

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
    <div ref={rowRef} className="flex gap-2 justify-center">
      {tiles}
    </div>
  );
}
