"use client";

interface WordleLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function WordleLogo({ className = "", size = "md" }: WordleLogoProps) {
  const sizes = {
    sm: 48,
    md: 96,
    lg: 144,
    xl: 192,
  };

  const containerSize = sizes[size];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={containerSize}
        height={containerSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" fill="#fefae0"/>
        
        <rect x="8" y="8" width="25" height="25" fill="#5a5a5a"/>
        <rect x="37" y="8" width="25" height="25" fill="#6aaa64"/>
        <rect x="66" y="8" width="25" height="25" fill="#c9b458"/>
        
        <rect x="8" y="37" width="25" height="25" fill="#d4d4d4"/>
        <rect x="37" y="37" width="25" height="25" fill="#d4d4d4"/>
        <rect x="66" y="37" width="25" height="25" fill="#d4d4d4"/>
        
        <rect x="8" y="66" width="25" height="25" fill="#6b7b8a"/>
        <rect x="37" y="66" width="25" height="25" fill="#6b7b8a"/>
        <rect x="66" y="66" width="25" height="25" fill="#6b7b8a"/>
      </svg>
    </div>
  );
}
