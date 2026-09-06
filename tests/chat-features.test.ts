import { describe, it, expect } from "vitest";
import { categories } from "@/data/catalog";
import { getShortProductName, getProductRating, getStarDisplay } from "@/lib/product-display";

describe("chat.md Restored Features Verification", () => {
  it("1. MegaDropdown & Catalog: Indonesian Rudraksha is present and Malas are excluded", () => {
    const rudrakshaCat = categories.find((c) => c.slug === "rudraksha");
    expect(rudrakshaCat).toBeDefined();

    const indonesianSection = rudrakshaCat?.sections.find((s) =>
      s.title.toLowerCase().includes("indonesian"),
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

  it("3. Product Title Shortener: shortens all product types cleanly", () => {
    // Rudrakshas
    expect(
      getShortProductName(
        "Natural Ganesh Rudraksha Nepali Bead | Original Ganesha Rudraksha | Premium Rudraksha for Wisdom, Success & Obstacle Removal",
      ),
    ).toBe("Ganesh Nepali Rudraksha");

    expect(
      getShortProductName(
        "Natural 18 Mukhi Nepali Rudraksha Bead | Original Atharah Mukhi Rudraksha | Premium  Rudraksha for Meditation, Prayer & Daily Wear",
      ),
    ).toBe("18 Mukhi Nepali Rudraksha");

    expect(getShortProductName("Natural 4 Mukhi Indo Rudraksha Bead Certified")).toBe(
      "4 Mukhi Indo Rudraksha",
    );

    expect(
      getShortProductName(
        "Natural 1 Mukhi Sawar Nepali Rudraksha Bead | Original Savar Rudraksha | Premium Bead for Spiritual Awakening & Wealth",
      ),
    ).toBe("1 Mukhi Sawar Nepali Rudraksha");

    // Malas
    expect(
      getShortProductName("Natural 5 Mukhi Rudraksha Mala - Indonesian Origin (108+1 Beads)"),
    ).toBe("5 Mukhi Indo Mala");

    // Yantras
    expect(
      getShortProductName(
        "Rudraaura Gold Plated Shree Baglamukhi Yantra Frame | Energised Yantra for Victory, Protection & Negativity Removal | Vastu & Spiritual Wall Decor",
      ),
    ).toBe("Shree Baglamukhi Yantra");

    expect(
      getShortProductName(
        "Rudraaura Gold Plated Shree Sampoorna Sarv Kasht Nivaran Yantra Frame | Energised Vastu Yantra for Home, Office & Temple | Spiritual Wall Decor & Gift Item",
      ),
    ).toBe("Shree Sampoorna Sarv Kasht Nivaran Yantra");

    // Bracelets
    expect(
      getShortProductName("Natural Black Obsidian Crystal Healing Bracelet for Men & Women"),
    ).toBe("Black Obsidian Crystal Healing Bracelet");

    // Gemstones fallback
    expect(getShortProductName("Ruby (Manik)")).toBe("Ruby (Manik)");
  });

  it("4. Product Rating: returns ratings strictly ranging from 3.9 to 5.0 for all products", async () => {
    const products = (await import("../all-products.json")).default;

    let minRating = 5;
    let maxRating = 3.9;

    for (const p of products) {
      const rating = getProductRating(p.handle);
      expect(rating).toBeGreaterThanOrEqual(3.9);
      expect(rating).toBeLessThanOrEqual(5.0);
      if (rating < minRating) minRating = rating;
      if (rating > maxRating) maxRating = rating;

      const starDisplay = getStarDisplay(rating);
      expect(
        starDisplay.fullStars + (starDisplay.hasHalfStar ? 1 : 0) + starDisplay.emptyStars,
      ).toBe(5);
      expect(Number.parseFloat(starDisplay.ratingFormatted)).toBe(rating);
    }

    // Verify rating distribution covers the range exactly from 3.9 to 5.0
    expect(minRating).toBe(3.9);
    expect(maxRating).toBe(5.0);
  });
});
