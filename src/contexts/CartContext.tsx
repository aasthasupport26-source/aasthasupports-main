import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";

export type CartItem = {
  cartItemId?: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  variantId: string;
  categoryName?: string;
  attributes?: { key: string; value: string }[];
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  update: (idOrSlug: string, qty: number) => void;
  remove: (idOrSlug: string) => void;
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

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    if (qty <= 0) return;
    setItems((prev) => {
      const isMatch = (p: CartItem) => {
        if (item.cartItemId || p.cartItemId) {
          return item.cartItemId === p.cartItemId;
        }
        return (item.variantId && p.variantId === item.variantId) || (p.slug && p.slug === item.slug);
      };

      const ex = prev.find(isMatch);
      if (ex) {
        return prev.map((p) =>
          isMatch(p) ? { ...p, quantity: p.quantity + qty } : p,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const update = useCallback((idOrSlug: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.cartItemId !== idOrSlug && p.variantId !== idOrSlug && p.slug !== idOrSlug)
        : prev.map((p) =>
            p.cartItemId === idOrSlug || p.variantId === idOrSlug || p.slug === idOrSlug
              ? { ...p, quantity: qty }
              : p,
          ),
    );
  }, []);

  const remove = useCallback((idOrSlug: string) => {
    setItems((prev) =>
      prev.filter((p) => p.cartItemId !== idOrSlug && p.variantId !== idOrSlug && p.slug !== idOrSlug),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + (Number(i.quantity) || 0), 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0),
    [items],
  );

  const value = useMemo<CartCtx>(
    () => ({ items, count, subtotal, add, update, remove, clear }),
    [items, count, subtotal, add, update, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
