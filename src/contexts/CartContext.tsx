import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  variantId: string;
  categoryName?: string;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  update: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "aastha_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.warn("Failed to read cart from local storage", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(items));
    }
  }, [items]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.quantity * i.price, 0),
      // Use variantId as the unique key so different variants of the same product
      // don't merge together (which happened when keying by slug).
      add: (item, qty = 1) =>
        setItems((prev) => {
          const ex = prev.find((p) => p.variantId === item.variantId);
          if (ex)
            return prev.map((p) =>
              p.variantId === item.variantId ? { ...p, quantity: p.quantity + qty } : p,
            );
          return [...prev, { ...item, quantity: qty }];
        }),
      update: (variantId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.variantId !== variantId)
            : prev.map((p) => (p.variantId === variantId ? { ...p, quantity: qty } : p)),
        ),
      remove: (variantId) => setItems((prev) => prev.filter((p) => p.variantId !== variantId)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
