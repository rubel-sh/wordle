"use client";

interface WordleLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function WordleLogo({ className = "", size = "md" }: WordleLogoProps) {
  const sizes = {
    sm: { container: 48, tile: 14, gap: 2 },
    md: { container: 96, tile: 28, gap: 4 },
    lg: { container: 144, tile: 42, gap: 6 },
    xl: { container: 192, tile: 56, gap: 8 },
  };

  const { container, tile, gap } = sizes[size];
  const strokeWidth = size === "sm" ? 2 : size === "md" ? 3 : 4;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={container}
        height={container}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
      >
        {/* Background */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="12"
          fill="#fefae0"
          stroke="#000"
          strokeWidth={strokeWidth}
        />

        {/* Tile Grid */}
        {/* Row 1 */}
        <rect
          x={10}
          y={10}
          width={tile}
          height={tile}
          rx="4"
          fill="#6aaa64"
          stroke="#000"
          strokeWidth={strokeWidth}
        />
        <rect
          x={10 + tile + gap}
          y={10}
          width={tile}
          height={tile}
          rx="4"
          fill="#c9b458"
          stroke="#000"
          strokeWidth={strokeWidth}
        />
        <rect
          x={10 + (tile + gap) * 2}
          y={10}
          width={tile}
          height={tile}
          rx="4"
          fill="#787c7e"
          stroke="#000"
          strokeWidth={strokeWidth}
        />

        {/* Row 2 */}
        <rect
          x={10}
          y={10 + tile + gap}
          width={tile}
          height={tile}
          rx="4"
          fill="#c9b458"
          stroke="#000"
          strokeWidth={strokeWidth}
        />
        <rect
          x={10 + tile + gap}
          y={10 + tile + gap}
          width={tile}
          height={tile}
          rx="4"
          fill="#6aaa64"
          stroke="#000"
          strokeWidth={strokeWidth}
        />
        <rect
          x={10 + (tile + gap) * 2}
          y={10 + tile + gap}
          width={tile}
          height={tile}
          rx="4"
          fill="#c9b458"
          stroke="#000"
          strokeWidth={strokeWidth}
        />

        {/* Row 3 - Cute face tile */}
        <rect
          x={10 + tile + gap}
          y={10 + (tile + gap) * 2}
          width={tile}
          height={tile}
          rx="4"
          fill="#d4a373"
          stroke="#000"
          strokeWidth={strokeWidth}
        />
        {/* Eyes */}
        <circle
          cx={10 + tile + gap + tile * 0.35}
          cy={10 + (tile + gap) * 2 + tile * 0.4}
          r={size === "sm" ? 1.5 : 2.5}
          fill="#000"
        />
        <circle
          cx={10 + tile + gap + tile * 0.65}
          cy={10 + (tile + gap) * 2 + tile * 0.4}
          r={size === "sm" ? 1.5 : 2.5}
          fill="#000"
        />
        {/* Smile */}
        <path
          d={`M ${10 + tile + gap + tile * 0.35} ${10 + (tile + gap) * 2 + tile * 0.65} 
              Q ${10 + tile + gap + tile * 0.5} ${10 + (tile + gap) * 2 + tile * 0.75} 
              ${10 + tile + gap + tile * 0.65} ${10 + (tile + gap) * 2 + tile * 0.65}`}
          stroke="#000"
          strokeWidth={size === "sm" ? 1 : 1.5}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
