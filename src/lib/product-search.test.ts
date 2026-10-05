import { describe, it, expect } from "vitest";
import {
  buildSearchIndex,
  searchProducts,
  searchProductsDetailed,
  normalizeSearchText,
  parseQuery,
  highlightMatches,
} from "./product-search";

const products = [
  { name: "Ruby (Manik) Gemstone", slug: "ruby-manik", productType: "Gemstone", tags: ["gemstone"], price: 4500 },
  { name: "7 Mukhi Rudraksha", slug: "7-mukhi-rudraksha", productType: "Rudraksha", tags: [], price: 799 },
  { name: "10 Mukhi Rudraksha", slug: "10-mukhi-rudraksha", productType: "Rudraksha", tags: [] },
  { name: "Rudraksha Mala 108 Beads", slug: "rudraksha-mala", productType: "Mala", tags: ["mala"] },
  { name: "Yellow Sapphire (Pukhraj)", slug: "pukhraj", productType: "Gemstone", tags: [], price: 6000 },
  { name: "Pyrite Money Magnet Bracelet", slug: "pyrite-bracelet", productType: "Bracelet", tags: [], price: 999 },
  { name: "Blue Sapphire (Neelam)", slug: "neelam", productType: "Gemstone", tags: [], price: 9000 },
  { name: "Shree Yantra", slug: "shree-yantra", productType: "Yantra", description: "Brings rudraksha-like energy" },
];
const index = buildSearchIndex(products);
const names = (q: string) => searchProducts(index, q).map((p) => p.name);

describe("product search", () => {
  it("returns everything for an empty query", () => {
    expect(names("  ")).toHaveLength(products.length);
  });

  it("matches the start of words while typing", () => {
    expect(names("rud").slice(0, 3)).toEqual(
      expect.arrayContaining(["7 Mukhi Rudraksha", "10 Mukhi Rudraksha", "Rudraksha Mala 108 Beads"]),
    );
  });

  it("ranks names that start with the query first", () => {
    expect(names("rudraksha")[0]).toBe("Rudraksha Mala 108 Beads");
    // description-only match ranks last
    expect(names("rudraksha").at(-1)).toBe("Shree Yantra");
  });

  it("matches numbers exactly and splits '7mukhi'", () => {
    expect(names("7 mukhi")).toEqual(["7 Mukhi Rudraksha"]);
    expect(names("7mukhi")).toEqual(["7 Mukhi Rudraksha"]);
    expect(names("1")).not.toContain("10 Mukhi Rudraksha");
  });

  it("handles plurals and synonyms", () => {
    expect(names("malas")[0]).toBe("Rudraksha Mala 108 Beads");
    expect(names("manik")[0]).toBe("Ruby (Manik) Gemstone");
    expect(names("saat mukhi")[0]).toBe("7 Mukhi Rudraksha");
  });

  it("falls back to partial matches instead of empty results", () => {
    expect(names("pukhraj xyzzy")).toContain("Yellow Sapphire (Pukhraj)");
  });

  it("normalizes punctuation", () => {
    expect(normalizeSearchText("Ruby-(Manik)!")).toBe("ruby manik");
  });

  it("tolerates typos", () => {
    expect(names("rudrksha")).toContain("7 Mukhi Rudraksha");
    expect(names("pukraj")[0]).toBe("Yellow Sapphire (Pukhraj)");
    expect(names("braclet")[0]).toBe("Pyrite Money Magnet Bracelet");
  });

  it("suggests corrections for typos", () => {
    expect(searchProductsDetailed(index, "braclet").suggestion).toBe("bracelet");
    expect(searchProductsDetailed(index, "bracelet").suggestion).toBeUndefined();
  });

  it("understands intents and planets", () => {
    expect(names("for wealth")[0]).toBe("Pyrite Money Magnet Bracelet");
    expect(names("shani stone")[0]).toBe("Blue Sapphire (Neelam)");
  });

  it("understands price phrases", () => {
    expect(parseQuery("rudraksha under 1000")).toEqual({ tokens: ["rudraksha"], minPrice: undefined, maxPrice: 1000 });
    expect(names("under 1000").sort()).toEqual(["7 Mukhi Rudraksha", "Pyrite Money Magnet Bracelet"]);
    expect(names("gemstone above ₹5,000")).toEqual(
      expect.arrayContaining(["Yellow Sapphire (Pukhraj)", "Blue Sapphire (Neelam)"]),
    );
    expect(names("gemstone above ₹5,000")).not.toContain("Ruby (Manik) Gemstone");
  });

  it("highlights matched prefixes", () => {
    expect(highlightMatches("7 Mukhi Rudraksha", "rud")).toEqual([
      { text: "7", match: false },
      { text: " ", match: false },
      { text: "Mukhi", match: false },
      { text: " ", match: false },
      { text: "Rud", match: true },
      { text: "raksha", match: false },
    ]);
  });
});
