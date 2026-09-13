import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("Cart Subsystem & Context", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with an empty cart and zero counts", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adds an item to the cart and calculates subtotal and count", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "1-mukhi-rudraksha",
        name: "1 Mukhi Rudraksha (Nepal)",
        image: "https://example.com/1-mukhi.jpg",
        price: 2500,
        mrp: 3500,
        variantId: "gid://shopify/ProductVariant/101",
      }, 1);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.count).toBe(1);
    expect(result.current.subtotal).toBe(2500);
  });

  it("increments quantity when adding an existing item again", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "1-mukhi-rudraksha",
        name: "1 Mukhi Rudraksha (Nepal)",
        image: "https://example.com/1-mukhi.jpg",
        price: 2500,
        mrp: 3500,
        variantId: "gid://shopify/ProductVariant/101",
      }, 1);
    });

    act(() => {
      result.current.add({
        slug: "1-mukhi-rudraksha",
        name: "1 Mukhi Rudraksha (Nepal)",
        image: "https://example.com/1-mukhi.jpg",
        price: 2500,
        mrp: 3500,
        variantId: "gid://shopify/ProductVariant/101",
      }, 2);
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(7500);
  });

  it("updates quantity by variantId or slug", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "5-mukhi-mala",
        name: "5 Mukhi Rudraksha Mala",
        image: "https://example.com/5-mukhi.jpg",
        price: 1200,
        mrp: 1800,
        variantId: "gid://shopify/ProductVariant/102",
      }, 2);
    });

    // Update by variantId
    act(() => {
      result.current.update("gid://shopify/ProductVariant/102", 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.count).toBe(5);
    expect(result.current.subtotal).toBe(6000);

    // Update by slug (resilience fallback)
    act(() => {
      result.current.update("5-mukhi-mala", 3);
    });
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(3600);
  });

  it("removes item when quantity is updated to 0 or less", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "navgrah-yantra",
        name: "Shri Navgrah Yantra",
        image: "https://example.com/yantra.jpg",
        price: 850,
        mrp: 1200,
        variantId: "gid://shopify/ProductVariant/103",
      }, 1);
    });

    act(() => {
      result.current.update("gid://shopify/ProductVariant/103", 0);
    });

    expect(result.current.items.length).toBe(0);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("removes item explicitly via remove()", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "emerald-ring",
        name: "Panna Emerald Gemstone",
        image: "https://example.com/emerald.jpg",
        price: 15000,
        mrp: 20000,
        variantId: "gid://shopify/ProductVariant/104",
      }, 1);
    });

    act(() => {
      result.current.remove("gid://shopify/ProductVariant/104");
    });

    expect(result.current.items.length).toBe(0);
  });

  it("clears all items via clear()", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.add({
        slug: "item-1",
        name: "Item 1",
        image: "",
        price: 100,
        mrp: 150,
        variantId: "v1",
      }, 2);
      result.current.add({
        slug: "item-2",
        name: "Item 2",
        image: "",
        price: 200,
        mrp: 300,
        variantId: "v2",
      }, 1);
    });

    expect(result.current.count).toBe(3);

    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("handles Rudraksha bead with pendant and without pendant as distinct line items", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // 1. Add Rudraksha Without Pendant
    act(() => {
      result.current.add({
        cartItemId: "rudraksha-101",
        slug: "natural-5-mukhi-rudraksha",
        name: "Natural 5 Mukhi Nepali Rudraksha Bead",
        image: "https://example.com/5-mukhi.jpg",
        price: 799,
        mrp: 1499,
        variantId: "gid://shopify/ProductVariant/101",
        attributes: [{ key: "Pendant", value: "Without Pendant (Only Bead)" }],
      }, 1);
    });

    // 2. Add Same Rudraksha With Pure Silver Pendant (+₹700)
    act(() => {
      result.current.add({
        cartItemId: "rudraksha-101-pendant",
        slug: "natural-5-mukhi-rudraksha",
        name: "Natural 5 Mukhi Nepali Rudraksha Bead (With Pure Silver Pendant Capping)",
        image: "https://example.com/5-mukhi-pendant.jpg",
        price: 1499,
        mrp: 2199,
        variantId: "gid://shopify/ProductVariant/101",
        attributes: [{ key: "Pendant", value: "With Pure Silver Pendant Capping (+₹700)" }],
      }, 1);
    });

    expect(result.current.items.length).toBe(2);
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(799 + 1499);

    // Verify attributes
    expect(result.current.items[0].attributes?.[0].value).toBe("Without Pendant (Only Bead)");
    expect(result.current.items[1].attributes?.[0].value).toBe("With Pure Silver Pendant Capping (+₹700)");

    // Update the pendant item quantity
    act(() => {
      result.current.update("rudraksha-101-pendant", 2);
    });

    expect(result.current.items[1].quantity).toBe(2);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(799 + 1499 * 2);
  });
});
