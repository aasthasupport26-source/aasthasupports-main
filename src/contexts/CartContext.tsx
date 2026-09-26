import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useServerFn } from "@tanstack/react-start";
import { checkRecentOrderPlaced } from "@/lib/shopify.functions";
import { toast } from "sonner";

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

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const auth = useSafeAuth();
  const accessToken = auth?.accessToken;
  const checkRecentOrder = useServerFn(checkRecentOrderPlaced);

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

  const clear = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem("aastha_pending_checkout");
      } catch {}
    }
  }, []);

  // Check URL parameters for order completion signals (cleared=1, order, order_id, order_number)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isCleared = searchParams.get("cleared") === "1";
      const hasOrder =
        searchParams.has("order") ||
        searchParams.has("order_id") ||
        searchParams.has("order_number") ||
        searchParams.has("thank_you");
      const isOrderSuccessPath = window.location.pathname.startsWith("/order-success");

      if (isCleared || hasOrder || isOrderSuccessPath) {
        clear();
      }
    } catch (e) {
      console.warn("Failed checking order completion from URL", e);
    }
  }, [clear]);

  // Check if a pending checkout was completed successfully on Shopify
  const verifyPendingOrder = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const rawPending = localStorage.getItem("aastha_pending_checkout");
      if (!rawPending) return;

      const pending = JSON.parse(rawPending);
      const now = Date.now();
      // If older than 4 hours, clean up
      if (!pending.timestamp || now - pending.timestamp > 4 * 60 * 60 * 1000) {
        localStorage.removeItem("aastha_pending_checkout");
        return;
      }

      const res = await checkRecentOrder({
        data: {
          customerAccessToken: accessToken || undefined,
          sinceTimestamp: pending.timestamp,
        },
      });

      if (res?.orderPlaced) {
        clear();
        toast.success("Order confirmed! Your cart has been updated.");
      }
    } catch (err) {
      console.warn("Failed checking pending order:", err);
    }
  }, [accessToken, checkRecentOrder, clear]);

  useEffect(() => {
    verifyPendingOrder();

    const handleFocus = () => {
      verifyPendingOrder();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        verifyPendingOrder();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [verifyPendingOrder]);

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
