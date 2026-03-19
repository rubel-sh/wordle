"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { LetterState } from "@/lib/types/game";

interface TileProps {
  letter?: string;
  status?: LetterState["status"];
  isActive?: boolean;
}

export function Tile({ letter = "", status = "empty", isActive = false }: TileProps) {
  const tileRef = useRef<HTMLDivElement>(null);
  const prevLetter = useRef(letter);

  useEffect(() => {
    if (letter && letter !== prevLetter.current && tileRef.current) {
      gsap.fromTo(
        tileRef.current,
        { scale: 1.2, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 0.15, ease: "power2.out" }
      );
    }
    prevLetter.current = letter;
  }, [letter]);

  useEffect(() => {
    if (status !== "empty" && status !== undefined && tileRef.current) {
      gsap.fromTo(
        tileRef.current,
        { rotateX: -90 },
        { rotateX: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
      );
    }
  }, [status]);

  return (
    <div
      ref={tileRef}
      className={`nb-tile ${status || ""} ${isActive ? "nb-tile-active" : ""} ${letter ? "nb-tile-filled" : ""}`}
    >
      {letter}
    </div>
  );
}
