import React from "react";
import { Star, StarHalf } from "lucide-react";
import { getStarDisplay } from "@/lib/product-display";

interface ProductRatingProps {
  rating: number;
  showScore?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProductRating({
  rating,
  showScore = true,
  size = "sm",
  className = "",
}: ProductRatingProps) {
  const { fullStars, hasHalfStar, emptyStars, ratingFormatted } = getStarDisplay(rating);
  const iconClass = size === "md" ? "w-4 h-4" : "w-3 h-3";

  return (
    <div
      className={`flex items-center gap-1 text-gold mb-1.5 ${className}`}
      aria-label={`${ratingFormatted} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${iconClass} fill-current`} />
        ))}
        {hasHalfStar && <StarHalf className={`${iconClass} fill-current`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${iconClass} text-gold/30`} />
        ))}
      </div>
      {showScore && (
        <span className="text-[11px] font-semibold text-gold/90 ml-0.5">{ratingFormatted}</span>
      )}
    </div>
  );
}
