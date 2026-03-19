"use client";

import { useState } from "react";
import { Eye, EyeOff, Bug } from "lucide-react";

interface DevWordRevealProps {
  targetWord: string;
}

export function DevWordReveal({ targetWord }: DevWordRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev || !targetWord) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="nb-button nb-button-sm"
        style={{ backgroundColor: '#9333ea', color: 'white' }}
      >
        <Bug className="w-4 h-4" />
        {isVisible ? (
          <>
            <EyeOff className="w-4 h-4" />
            Hide Word
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Show Word
          </>
        )}
      </button>

      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 bg-yellow-300 border-2 border-black rounded-lg px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce-short">
          <div className="text-xs font-bold text-black/60 uppercase tracking-wide mb-1">
            Dev Mode - Secret Word
          </div>
          <div className="text-2xl font-black tracking-[0.2em] text-black">
            {targetWord}
          </div>
        </div>
      )}
    </div>
  );
}
