import { describe, it, expect } from "vitest";

describe("Rudraksha Pendant Selection & Pricing Logic", () => {
  const basePrice = 799;
  const baseMrp = 1499;

  it("calculates base price when Without Pendant is chosen", () => {
    const pendantOption: "without" | "with" = "without";
    const effectivePrice = pendantOption === "with" ? basePrice + 700 : basePrice;
    const effectiveMrp = pendantOption === "with" ? baseMrp + 700 : baseMrp;

    expect(effectivePrice).toBe(799);
    expect(effectiveMrp).toBe(1499);
  });

  it("calculates price + 700 when With Pure Silver Pendant is chosen", () => {
    const pendantOption: "without" | "with" = "with";
    const effectivePrice = pendantOption === "with" ? basePrice + 700 : basePrice;
    const effectiveMrp = pendantOption === "with" ? baseMrp + 700 : baseMrp;

    expect(effectivePrice).toBe(1499);
    expect(effectiveMrp).toBe(2199);
  });

  it("correctly identifies single Rudraksha beads vs Malas and Bracelets", () => {
    const isRudrakshaBead = (catKey: string, title: string) => {
      if (catKey !== "rudraksha") return false;
      const t = title.toLowerCase();
      return !t.includes("mala") && !t.includes("bracelet");
    };

    expect(isRudrakshaBead("rudraksha", "Natural 4 Mukhi Nepali Rudraksha Bead")).toBe(true);
    expect(isRudrakshaBead("rudraksha", "Natural Ganesh Rudraksha Nepali Bead")).toBe(true);
    expect(isRudrakshaBead("rudraksha", "Natural Gauri Shankar Rudraksha Nepali Bead")).toBe(true);
    expect(isRudrakshaBead("rudraksha", "Original Karungali Mala")).toBe(false);
    expect(isRudrakshaBead("rudraksha", "Natural 5 Mukhi Rudraksha Mala")).toBe(false);
    expect(isRudrakshaBead("bracelet", "Crystal Bracelet")).toBe(false);
  });

  it("detects pendant images if available in the gallery", () => {
    const findPendantImage = (galleryItems: { url: string; alt?: string }[]) => {
      return galleryItems.findIndex((item) => {
        const url = (item.url || "").toLowerCase();
        const alt = (item.alt || "").toLowerCase();
        return (
          url.includes("pendant") ||
          url.includes("capping") ||
          url.includes("silver") ||
          url.includes("locket") ||
          alt.includes("pendant") ||
          alt.includes("capping") ||
          alt.includes("silver") ||
          alt.includes("locket")
        );
      });
    };

    const galleryWithoutPendant = [
      { url: "https://example.com/bead_front.png" },
      { url: "https://example.com/certificate.png" },
      { url: "https://example.com/info.png" },
    ];
    expect(findPendantImage(galleryWithoutPendant)).toBe(-1);

    const galleryWithPendant = [
      { url: "https://example.com/bead_front.png" },
      { url: "https://example.com/bead_silver_capping_pendant.png" },
      { url: "https://example.com/certificate.png" },
    ];
    expect(findPendantImage(galleryWithPendant)).toBe(1);
  });

  it("formats line item attributes for Shopify order fulfillment", () => {
    const formatLineAttributes = (isWithPendant: boolean) => [
      {
        key: "Pendant",
        value: isWithPendant
          ? "With Pure Silver Pendant Capping (+₹700)"
          : "Without Pendant (Only Bead)",
      },
    ];

    expect(formatLineAttributes(true)).toEqual([
      { key: "Pendant", value: "With Pure Silver Pendant Capping (+₹700)" },
    ]);
    expect(formatLineAttributes(false)).toEqual([
      { key: "Pendant", value: "Without Pendant (Only Bead)" },
    ]);
  });
});
