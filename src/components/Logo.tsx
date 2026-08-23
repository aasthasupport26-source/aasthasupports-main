import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
}

export function Logo({ variant = "light", compact = false }: LogoProps) {
  const textColor = variant === "light" ? "text-cream" : "text-maroon-deep";

  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="Aastha Supports home">
      <img 
        src="/logo.png" 
        alt="Aastha Supports" 
        className={`object-cover rounded-full bg-white shadow-sm transition-transform duration-500 group-hover:scale-105 ${compact ? 'w-10 h-10' : 'w-14 h-14 md:w-16 md:h-16'}`} 
      />
      {!compact && (
        <span className={`font-display text-xl font-bold tracking-tight ${textColor}`}>
          Aastha Supports
        </span>
      )}
    </Link>
  );
}
