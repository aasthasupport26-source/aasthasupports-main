/**
 * Product display helpers for title shortening and credible star rating calculation.
 */

export function getShortProductName(
  name: string,
  extra?: { description?: string; slug?: string } | string,
): string {
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

  // 5. Gemstones (Sapphire, Pukhraj, Ruby, Manik, Emerald, Panna, Pearl, Moti, Coral, Moonga, etc.)
  const isGemstone =
    lower.includes("sapphire") ||
    lower.includes("pukhraj") ||
    lower.includes("ruby") ||
    lower.includes("manik") ||
    lower.includes("emerald") ||
    lower.includes("panna") ||
    lower.includes("coral") ||
    lower.includes("moonga") ||
    lower.includes("pearl") ||
    lower.includes("moti") ||
    lower.includes("neelam") ||
    lower.includes("gemstone") ||
    lower.includes("ratti");

  if (isGemstone) {
    let rattiStr = "";
    const extraDesc =
      typeof extra === "object"
        ? extra?.description || ""
        : typeof extra === "string"
          ? extra
          : "";
    const extraSlug = typeof extra === "object" ? extra?.slug || "" : "";

    const rattiMatch =
      cleanName.match(/(\d+(?:\.\d+)?)\s*ratti\b/i) ||
      name.match(/(\d+(?:\.\d+)?)\s*ratti\b/i) ||
      extraDesc.match(/(\d+(?:\.\d+)?)\s*ratti\b/i) ||
      extraSlug.match(/(?:^|-)(\d+)[-_](\d+)[-_]ratti(?:-|$)/i);

    if (rattiMatch) {
      if (rattiMatch[1] && rattiMatch[2]) {
        rattiStr = ` (${rattiMatch[1]}.${rattiMatch[2]} Ratti)`;
      } else {
        rattiStr = ` (${rattiMatch[1]} Ratti)`;
      }
    }

    let g = cleanName
      .replace(/^Natural\s+/i, "")
      .replace(/^Original\s+/i, "")
      .replace(/\(Sri Lanka\)/i, "")
      .replace(/\s*\(\s*\d+(?:\.\d+)?\s*ratti\s*\)/i, "")
      .replace(/\s*-\s*\d+(?:\.\d+)?\s*ratti/i, "")
      .replace(/\s+/g, " ")
      .trim();

    return `${g}${rattiStr}`.trim();
  }

  // Fallback (e.g. other catalog items)
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
  let seed = 0;
  for (let i = 0; i < identifier.length; i++) {
    seed += identifier.charCodeAt(i);
  }
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

/**
 * Trims redundant boilerplate from product descriptions for listing cards,
 * ensuring each card displays its unique specifications (Carat, Ratti, Cut, Origin)
 * rather than repetitive introductory phrases.
 */
export function getProductCardDescription(desc?: string | null): string {
  if (!desc) return "";
  let clean = desc
    .replace(
      /^Presenting a(?:n)?\s+100%\s+genuine\s+and\s+certified\s+[^(,]+(?:\s*\([^)]*\))?\s*(?:sourced\s+from\s+[^,]+,)?\s*/i,
      "",
    )
    .trim();
  if (/^weighing\b/i.test(clean)) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  clean = clean.replace(/([.!?])([A-Za-z])/g, "$1 $2");
  return clean || desc;
}

/**
 * Shortens and cleans product titles for detail pages, removing SEO pipe/dash keyword delimiters.
 */
export function getCleanProductTitle(title?: string | null): string {
  if (!title) return "";
  const primary = title.split(/\s+[|–—]\s+|\|/)[0].trim();
  return primary || title;
}

/**
 * Extracts a concise summary from product descriptions for above-the-fold display.
 */
export function getProductSummary(description?: string | null, maxSentences = 2): string {
  if (!description) return "";
  const clean = description.trim().replace(/([.!?])([A-Za-z])/g, "$1 $2");
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    const summary = sentences
      .slice(0, maxSentences)
      .map((s) => s.trim())
      .join(" ");
    if (summary.length <= 260) {
      return summary;
    }
    return sentences[0].trim();
  }
  if (clean.length > 160) {
    return clean.slice(0, 157).replace(/\s+\S*$/, "") + "...";
  }
  return clean;
}

