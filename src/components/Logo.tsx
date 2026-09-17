import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
}

export function Logo({ variant = "light", compact = false, className = "" }: LogoProps) {
  // variant="light" is for dark backgrounds (Header, Footer, Admin sidebar)
  // variant="dark" is for light/cream backgrounds (Invoice, Checkout, Modals)
  const fullLogoSrc = variant === "light" ? "/logo-light.png" : "/logo.png";
  const emblemSrc = "/icon-192.png";

  return (
    <Link
      to="/"
      className={`inline-flex items-center group transition-transform duration-300 hover:scale-[1.02] ${className}`}
      aria-label="Aastha Supports home"
    >
      {compact ? (
        <img
          src={emblemSrc}
          alt="Aastha Supports"
          className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
      ) : (
        <img
          src={fullLogoSrc}
          alt="Aastha Supports - Your Faith, Our Support"
          className="h-11 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-all duration-300 drop-shadow-sm"
          loading="eager"
        />
      )}
    </Link>
  );
}
