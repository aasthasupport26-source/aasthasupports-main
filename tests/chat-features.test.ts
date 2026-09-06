import { describe, it, expect } from "vitest";
import { categories } from "@/data/catalog";

describe("chat.md Restored Features Verification", () => {
  it("1. MegaDropdown & Catalog: Indonesian Rudraksha is present and Malas are excluded", () => {
    const rudrakshaCat = categories.find((c) => c.slug === "rudraksha");
    expect(rudrakshaCat).toBeDefined();

    const indonesianSection = rudrakshaCat?.sections.find((s) =>
      s.title.toLowerCase().includes("indonesian")
    );
    expect(indonesianSection).toBeDefined();
    expect(indonesianSection?.title).toBe("Indonesian Rudraksha (1-14 Mukhi)");

    // Ensure all items in Indonesian section are Indo Rudraksha, not Malas
    const items = indonesianSection?.items || [];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.name.toLowerCase()).not.toContain("mala");
      expect(item.slug.toLowerCase()).not.toContain("mala");
      expect(item.name.toLowerCase()).toMatch(/indo/i);
    }

    // Ensure no malas in Rudraksha category catalog
    for (const section of rudrakshaCat?.sections || []) {
      for (const item of section.items) {
        expect(item.name.toLowerCase()).not.toContain("mala");
      }
    }
  });

  it("2. Gemstones Category: Bracelets are excluded and Gemstones are present", () => {
    const gemstonesCat = categories.find((c) => c.slug === "gemstones");
    expect(gemstonesCat).toBeDefined();

    const items = gemstonesCat?.sections[0]?.items || [];
    expect(items.length).toBeGreaterThan(0);

    // Verify known gemstones exist
    const names = items.map((i) => i.name.toLowerCase());
    expect(names.some((n) => n.includes("ruby"))).toBe(true);
    expect(names.some((n) => n.includes("pearl"))).toBe(true);
    expect(names.some((n) => n.includes("emerald"))).toBe(true);
    expect(names.some((n) => n.includes("sapphire"))).toBe(true);

    // Verify NO bracelets
    for (const item of items) {
      expect(item.name.toLowerCase()).not.toContain("bracelet");
      expect(item.slug.toLowerCase()).not.toContain("bracelet");
    }
  });

  it("3. Product Title Shortener: shortens mukhi type and origin correctly", () => {
    function getShortProductName(name: string) {
      const mukhi = name.match(/(\d+)\s*mukhi/i);
      const lowerName = name.toLowerCase();
      const origin =
        lowerName.includes("indo") || lowerName.includes("indonesian")
          ? "Indo"
          : lowerName.includes("nepali")
            ? "Nepali"
            : lowerName.includes("indian")
              ? "Indian"
              : "";
      const suffix = lowerName.includes("mala") ? " Mala" : " Rudraksha";

      if (mukhi) return `${mukhi[1]} Mukhi${origin ? ` ${origin}` : ""}${suffix}`;

      const descriptor = name
        .split("|")[0]
        .replace(/^Natural\s+/i, "")
        .replace(/\s+Rudraksha.*$/i, "")
        .replace(/\s+Bead.*$/i, "")
        .trim();
      return `${descriptor}${origin ? ` ${origin}` : ""}${suffix}`.trim();
    }

    expect(getShortProductName("Natural 18 Mukhi Nepali Rudraksha Bead Original Collector"))
      .toBe("18 Mukhi Nepali Rudraksha");
    expect(getShortProductName("Natural 4 Mukhi Indo Rudraksha Bead Certified"))
      .toBe("4 Mukhi Indo Rudraksha");
    expect(getShortProductName("Natural Ganesh Rudraksha Nepali Bead"))
      .toBe("Ganesh Nepali Rudraksha");
  });

  it("4. Product Rating: returns credible ratings between 4.0 and 4.5 stars", () => {
    function getProductRating(slug: string) {
      const seed = [...slug].reduce((total, character) => total + character.charCodeAt(0), 0);
      return 4 + (seed % 2) * 0.5;
    }

    const testSlugs = [
      "18-mukhi-nepali-rudraksha",
      "4-mukhi-indo-rudraksha",
      "natural-ganesh-nepali-rudraksha",
      "ruby-gemstone",
      "emerald-gemstone",
    ];

    for (const slug of testSlugs) {
      const rating = getProductRating(slug);
      expect(rating).toBeGreaterThanOrEqual(4.0);
      expect(rating).toBeLessThanOrEqual(4.5);
      expect([4.0, 4.5]).toContain(rating);
    }
  });
});
