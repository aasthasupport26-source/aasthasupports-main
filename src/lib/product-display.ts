/**
 * Product display helpers for title shortening and credible star rating calculation.
 */

export function getShortProductName(name: string): string {
  if (!name) return "";

  // Split at pipe or dash delimiters if present (e.g. "Title | Subtitle" or "Title – Subtitle")
  const cleanName = name.split(/[|–]/)[0].trim();
  const lower = name.toLowerCase();

  const isIndo = lower.includes("indo") || lower.includes("indonesian");
  const isNepali = lower.includes("nepali");
  const isIndian = lower.includes("indian");
  const origin = isIndo ? "Indo" : isNepali ? "Nepali" : isIndian ? "Indian" : "";

  // 1. Mala
  if (lower.includes("mala")) {
    const mukhi = cleanName.match(/(\d+)\s*mukhi/i);
    if (mukhi) {
      return `${mukhi[1]} Mukhi${origin ? ` ${origin}` : ""} Mala`;
    }
    let m = cleanName
      .replace(/^Natural\s+/i, "")
      .replace(/^Original\s+/i, "")
      .replace(/\s*-\s*.*$/i, "")
      .replace(/\s*\(\d+.*$/i, "")
      .trim();
    if (!/mala$/i.test(m)) m = `${m} Mala`;
    return m;
  }

  // 2. Yantra (checked before rudraksha because words like Baglamukhi contain "mukhi")
  if (lower.includes("yantra")) {
    let y = cleanName
      .replace(/^Rudraaura\s+/i, "")
      .replace(/^Gold\s+Plated\s+/i, "")
      .replace(/^Pyrite\s+Dust\s+Golden\s+Frame\s+/i, "")
      .replace(/\s+with\s+Golden\s+Frame.*$/i, "")
      .replace(/\s+for\s+Home.*$/i, "")
      .replace(/\s+Frame.*$/i, "")
      .replace(/^Shri\s+/i, "Shree ")
      .trim();
    if (!/yantra$/i.test(y)) y = `${y} Yantra`;
    return y;
  }

  // 3. Bracelet
  if (lower.includes("bracelet")) {
    const b = cleanName
      .replace(/^Natural\s+/i, "")
      .replace(/^Protective\s+/i, "")
      .replace(/\s+for\s+Men\s*&?\s*Women/i, "")
      .replace(/\s+for\s+Clarity.*$/i, "")
      .replace(/\s+Wealth\s*&?\s*Prosperity/i, " Wealth")
      .replace(/\s+Courage\s*&?\s*Strength/i, " Courage")
      .trim();
    return b;
  }

  // 4. Rudraksha (Mukhi or special beads like Ganesh, Gauri Shankar, Garbh Gauri, Sawar)
  if (
    /\brudraksh/i.test(cleanName) ||
    /\b\d+\s*mukhi\b/i.test(cleanName) ||
    /gauri|ganesh|garbh/i.test(cleanName)
  ) {
    const mukhi = cleanName.match(/(\d+)\s*mukhi/i);
    const sawar = /sawar|savar/i.test(cleanName);
    if (mukhi) {
      const sawarText = sawar ? " Sawar" : "";
      return `${mukhi[1]} Mukhi${sawarText}${origin ? ` ${origin}` : ""} Rudraksha`;
    }
    const descriptor = cleanName
      .replace(/^Natural\s+/i, "")
      .replace(/^Original\s+/i, "")
      .replace(/^Premium\s+/i, "")
      .replace(/\s+Nepali.*$/i, "")
      .replace(/\s+Indo.*$/i, "")
      .replace(/\s+Indian.*$/i, "")
      .replace(/\s+Rudraksha.*$/i, "")
      .replace(/\s+Bead.*$/i, "")
      .trim();
    return `${descriptor}${origin ? ` ${origin}` : ""} Rudraksha`.trim();
  }

  // Fallback (e.g. Gemstones or other catalog items)
  return cleanName
    .replace(/^Natural\s+/i, "")
    .replace(/^Original\s+/i, "")
    .trim();
}

/**
 * Returns a deterministic star rating strictly ranging from 3.9 to 5.0 for any product.
 */
export function getProductRating(identifier: string): number {
  if (!identifier) return 4.5;
  const seed = [...identifier].reduce((total, char) => total + char.charCodeAt(0), 0);
  // Produce values between 3.9 and 5.0 in 0.1 increments (12 possible values)
  const offset = (seed % 12) * 0.1;
  const rating = 3.9 + offset;
  return Math.round(rating * 10) / 10;
}

/**
 * Calculates full, half, and empty stars for a 5-star rating system.
 */
export function getStarDisplay(rating: number): {
  fullStars: number;
  hasHalfStar: boolean;
  emptyStars: number;
  ratingFormatted: string;
} {
  const full = Math.floor(rating);
  const decimal = Math.round((rating - full) * 10) / 10;
  let fullStars = full;
  let hasHalfStar = false;

  if (decimal >= 0.8) {
    fullStars = Math.min(5, full + 1);
  } else if (decimal >= 0.3 && decimal <= 0.7) {
    hasHalfStar = true;
  }
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return {
    fullStars,
    hasHalfStar,
    emptyStars,
    ratingFormatted: rating.toFixed(1),
  };
}
