import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
}

export function Logo({ variant = "light", compact = false }: LogoProps) {
  const textColor = variant === "light" ? "text-cream" : "text-maroon-deep";
  const subColor = variant === "light" ? "text-gold-soft" : "text-gold";

  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="Aastha Support home">
      <div className="relative">
        <svg
          viewBox="0 0 64 64"
          className="w-14 h-14 animate-glow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer mandala ring */}
          <circle cx="32" cy="32" r="30" stroke="var(--gold)" strokeWidth="1" opacity="0.7" />
          <circle cx="32" cy="32" r="26" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5" strokeDasharray="2 2" />
          {/* Lotus petals */}
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="32"
              cy="6"
              rx="2.2"
              ry="5"
              fill="var(--gold)"
              opacity="0.85"
              transform={`rotate(${i * 45} 32 32)`}
            />
          ))}
          {/* Om symbol */}
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontSize="28"
            fontFamily="serif"
            fontWeight="700"
            fill="var(--gold)"
          >
            ॐ
          </text>
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className={`font-display text-2xl tracking-wider ${textColor}`} font-numeric>
            AASTHA
          </span>
          <span className={`text-xs tracking-[0.35em] mt-0.5 ${subColor}`}>
            SUPPORT
          </span>
        </div>
      )}
    </Link>
  );
}
