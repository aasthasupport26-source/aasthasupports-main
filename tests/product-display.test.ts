import { describe, it, expect } from "vitest";
import {
  getShortProductName,
  getProductRating,
  getProductCardDescription,
  getCleanProductTitle,
  getProductSummary,
} from "../src/lib/product-display";
import { formatShopifyProductName } from "../src/lib/shopify.functions";

describe("getShortProductName", () => {
  it("formats gemstones with ratti from name", () => {
    const result = getShortProductName("Natural Ceylon (Sri Lanka) Yellow Sapphire (Pukhraj) (2.65 Ratti)");
    expect(result).toBe("Ceylon Yellow Sapphire (Pukhraj) (2.65 Ratti)");
  });

  it("extracts ratti from description when extra is provided", () => {
    const result = getShortProductName("Natural Ceylon (Sri Lanka) Yellow Sapphire (Pukhraj)", {
      description: "Weighing 2.42 Carat (2.65 Ratti) oval mixed cut",
    });
    expect(result).toBe("Ceylon Yellow Sapphire (Pukhraj) (2.65 Ratti)");
  });

  it("extracts ratti from slug when extra is provided", () => {
    const result = getShortProductName("Yellow Sapphire (Pukhraj)", {
      slug: "natural-ceylon-sri-lanka-yellow-sapphire-pukhraj-2-42-carat-2-65-ratti-oval-mixed-certified",
    });
    expect(result).toBe("Yellow Sapphire (Pukhraj) (2.65 Ratti)");
  });

  it("formats bangkok gemstone correctly", () => {
    const result = getShortProductName("Natural Bangkok Yellow Sapphire (Pukhraj)", {
      description: "Weighing 4.41 Carat (4.90 Ratti)",
    });
    expect(result).toBe("Bangkok Yellow Sapphire (Pukhraj) (4.90 Ratti)");
  });

  it("handles rudraksha, mala, yantra, and bracelet correctly", () => {
    expect(getShortProductName("5 Mukhi Nepali Rudraksha Bead")).toBe("5 Mukhi Nepali Rudraksha");
    expect(getShortProductName("108 Beads Rudraksha Mala")).toBe("108 Beads Rudraksha Mala");
    expect(getShortProductName("Rudraaura Gold Plated Shree Yantra Frame")).toBe("Shree Yantra");
  });
});

describe("formatShopifyProductName", () => {
  it("appends ratti to gemstone title if missing", () => {
    const node = {
      title: "Natural Ceylon (Sri Lanka) Yellow Sapphire (Pukhraj)",
      productType: "Gemstone",
      description: "Presenting a certified stone weighing 3.62 Carat (4.02 Ratti).",
      handle: "natural-ceylon-sri-lanka-yellow-sapphire-pukhraj-3",
    };
    expect(formatShopifyProductName(node)).toBe(
      "Natural Ceylon (Sri Lanka) Yellow Sapphire (Pukhraj) (4.02 Ratti)"
    );
  });

  it("does not duplicate ratti if already present in title", () => {
    const node = {
      title: "Natural Yellow Sapphire (Pukhraj) (2.65 Ratti)",
      productType: "Gemstone",
      description: "Weighing 2.65 Ratti",
    };
    expect(formatShopifyProductName(node)).toBe("Natural Yellow Sapphire (Pukhraj) (2.65 Ratti)");
  });
  it("strips pipe delimiters from SEO stuffed titles", () => {
    const node = {
      title:
        "Natural Gauri Shankar Rudraksha Nepali Bead | Original Gauri Shankar Rudraksha | Premium Rudraksha for Harmony, Peace & Relationship",
      productType: "Rudraksha",
    };
    expect(formatShopifyProductName(node)).toBe(
      "Natural Gauri Shankar Rudraksha Nepali Bead"
    );
  });
});

describe("getProductCardDescription", () => {
  it("trims boilerplate intro and capitalizes specs", () => {
    const raw = "Presenting a 100% genuine and certified Yellow Sapphire (Pukhraj) sourced from Ceylon (Sri Lanka), weighing 7.31 Carat (8.12 Ratti).Crafted with an elegant Oval Mixed...";
    const result = getProductCardDescription(raw);
    expect(result).toBe("Weighing 7.31 Carat (8.12 Ratti). Crafted with an elegant Oval Mixed...");
  });

  it("handles descriptions without boilerplate", () => {
    const raw = "Authentic 5 Mukhi Nepali Rudraksha with natural facets.";
    expect(getProductCardDescription(raw)).toBe("Authentic 5 Mukhi Nepali Rudraksha with natural facets.");
  });

  it("handles null or empty descriptions gracefully", () => {
    expect(getProductCardDescription(null)).toBe("");
    expect(getProductCardDescription("")).toBe("");
  });
});

describe("getCleanProductTitle", () => {
  it("strips SEO pipes and subtitles", () => {
    const title = "Natural Gauri Shankar Rudraksha Nepali Bead | Original Gauri Shankar Rudraksha | Premium Rudraksha";
    expect(getCleanProductTitle(title)).toBe("Natural Gauri Shankar Rudraksha Nepali Bead");
  });

  it("preserves single clean titles", () => {
    expect(getCleanProductTitle("5 Mukhi Nepali Rudraksha")).toBe("5 Mukhi Nepali Rudraksha");
  });

  it("handles empty or null titles", () => {
    expect(getCleanProductTitle("")).toBe("");
    expect(getCleanProductTitle(null)).toBe("");
  });
});

describe("getProductSummary", () => {
  it("extracts concise 2-sentence summary from long descriptions", () => {
    const desc =
      "Natural Gauri Shankar Rudraksha is a highly auspicious and rare sacred bead originating from Nepal. It is naturally formed by the joining of two Rudraksha beads, symbolizing the divine union of Lord Shiva and Goddess Parvati. Every bead is unique in its natural formation, texture, and appearance.";
    const summary = getProductSummary(desc);
    expect(summary).toBe(
      "Natural Gauri Shankar Rudraksha is a highly auspicious and rare sacred bead originating from Nepal. It is naturally formed by the joining of two Rudraksha beads, symbolizing the divine union of Lord Shiva and Goddess Parvati."
    );
  });

  it("handles short descriptions or null", () => {
    expect(getProductSummary("Pure Silver Frame.")).toBe("Pure Silver Frame.");
    expect(getProductSummary(null)).toBe("");
  });
});

