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
});
