import { describe, it, expect } from "vitest";
import { getShortProductName, getProductRating } from "../src/lib/product-display";
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
});
