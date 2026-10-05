import { useEffect, useDeferredValue, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Clock, Loader2, Search, Sparkles, TrendingUp, X } from "lucide-react";
import { getShopifyProducts } from "@/lib/shopify.functions";
import { categories } from "@/data/catalog";
import {
  buildSearchIndex,
  highlightMatches,
  normalizeSearchText,
  parseQuery,
  searchProductsDetailed,
  stem,
} from "@/lib/product-search";

const POPULAR_SEARCHES = ["Rudraksha", "7 Mukhi", "Pukhraj", "Mala", "For wealth", "Under 1000"];
const RECENT_KEY = "aastha_recent_searches";
const MAX_RESULTS = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const q = query.trim();
  if (!q || typeof window === "undefined") return;
  try {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightMatches(text, query).map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-gold/25 text-maroon-deep rounded-sm px-0.5 font-semibold">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const fetchProducts = useServerFn(getShopifyProducts);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);

  // Shares the cache with the /shop page (same query key + params).
  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts({ data: { category: "all", limit: 250 } }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: open,
  });

  const products = useMemo(() => (data?.products || []) as any[], [data]);
  const index = useMemo(() => buildSearchIndex(products), [products]);
  const hasQuery = deferredQuery.trim().length > 0;

  const search = useMemo(
    () => (hasQuery ? searchProductsDetailed(index, deferredQuery) : null),
    [index, deferredQuery, hasQuery],
  );
  const topResults = search?.results.slice(0, MAX_RESULTS) ?? [];

  const matchedCategories = useMemo(() => {
    if (!hasQuery) return [];
    const tokens = parseQuery(deferredQuery).tokens.map(stem);
    return categories
      .filter((c) => c.slug !== "online-pooja")
      .filter((c) => {
        const name = normalizeSearchText(c.name);
        return tokens.some((t) => t.length >= 2 && name.split(" ").some((w) => w.startsWith(t) || t.startsWith(w)));
      })
      .slice(0, 3);
  }, [deferredQuery, hasQuery]);

  // Reset when opened; lock page scroll; focus input.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(-1);
    setRecent(readRecent());
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => setActive(-1), [deferredQuery]);

  useEffect(() => {
    if (active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const goToShop = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    onClose();
    navigate({ to: "/shop", search: { search: trimmed, category: undefined } });
  };

  const openProduct = (p: any) => {
    saveRecent(query);
    onClose();
    navigate({ to: "/product/$slug", params: { slug: p.slug } });
  };

  // Keyboard: results are indices 0..n-1, "view all" is index n.
  const optionCount = hasQuery && search && search.total > 0 ? topResults.length + 1 : 0;
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" && optionCount) {
      e.preventDefault();
      setActive((i) => (i + 1) % optionCount);
    } else if (e.key === "ArrowUp" && optionCount) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? optionCount - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && active < topResults.length) openProduct(topResults[active]);
      else goToShop(query);
    }
  };

  const clearRecent = () => {
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
    setRecent([]);
  };

  const priceLabel =
    search && (search.minPrice !== undefined || search.maxPrice !== undefined)
      ? search.minPrice !== undefined && search.maxPrice !== undefined
        ? `${formatINR(search.minPrice)} – ${formatINR(search.maxPrice)}`
        : search.maxPrice !== undefined
          ? `Under ${formatINR(search.maxPrice)}`
          : `Above ${formatINR(search.minPrice!)}`
      : null;

  const chip =
    "px-3 py-1.5 text-xs text-maroon-deep border border-gold/30 rounded-full hover:bg-cream hover:border-gold transition";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-start justify-center pt-16 sm:pt-20 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Input */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            goToShop(query);
          }}
          className="flex items-center gap-3 px-5 py-4 border-b border-gold/15"
        >
          {isLoading && hasQuery ? (
            <Loader2 className="w-5 h-5 text-gold animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            role="combobox"
            aria-expanded={optionCount > 0}
            aria-controls="header-search-results"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `search-opt-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Search rudraksha, gemstones, 'for wealth', 'under 1000'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none bg-transparent placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-xs text-muted-foreground hover:text-maroon-deep px-2"
            >
              Clear
            </button>
          )}
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded" aria-label="Close search">
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain">
          {!hasQuery ? (
            /* Empty state: recent + popular */
            <div className="p-5 space-y-5">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> Recent
                    </span>
                    <button type="button" onClick={clearRecent} className="text-xs text-muted-foreground hover:text-maroon-deep">
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button key={r} type="button" onClick={() => setQuery(r)} className={chip}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Popular
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((q) => (
                    <button key={q} type="button" onClick={() => setQuery(q)} className={chip}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Tip: try "shani stone", "panch mukhi", "protection bracelet" or "pukhraj under 5000".
              </p>
            </div>
          ) : isLoading && products.length === 0 ? (
            <ul className="p-3 space-y-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-14 h-14 rounded-lg bg-cream" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-maroon-deep/10 rounded" />
                    <div className="h-3 w-1/4 bg-gold/20 rounded" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-2">
              {/* Smart hints */}
              {(search?.suggestion || priceLabel || matchedCategories.length > 0) && (
                <div className="px-5 pt-2 pb-3 flex flex-wrap items-center gap-2 text-sm">
                  {search?.suggestion && (
                    <span className="text-muted-foreground">
                      Did you mean{" "}
                      <button
                        type="button"
                        onClick={() => setQuery(search.suggestion!)}
                        className="text-maroon-deep font-semibold underline decoration-gold underline-offset-2 hover:text-maroon"
                      >
                        {search.suggestion}
                      </button>
                      ?
                    </span>
                  )}
                  {priceLabel && (
                    <span className="px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                      {priceLabel}
                    </span>
                  )}
                  {matchedCategories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      onClick={onClose}
                      className="px-2.5 py-1 text-xs rounded-full bg-maroon-deep/5 text-maroon-deep border border-maroon-deep/15 hover:bg-maroon-deep hover:text-white transition"
                    >
                      Browse {c.name} →
                    </Link>
                  ))}
                </div>
              )}

              {search && search.total > 0 ? (
                <>
                  <div className="px-5 pb-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {search.partial ? "Closest matches" : "Products"}
                  </div>
                  <ul id="header-search-results" role="listbox" ref={listRef} className="px-2">
                    {topResults.map((p: any, i: number) => (
                      <li
                        key={p.shopifyId || p.slug}
                        id={`search-opt-${i}`}
                        data-idx={i}
                        role="option"
                        aria-selected={active === i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => openProduct(p)}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition ${
                          active === i ? "bg-cream" : "hover:bg-cream/60"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0 border border-gold/10">
                          {p.image ? (
                            <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-maroon-deep line-clamp-2 leading-snug">
                            <Highlighted text={p.name} query={deferredQuery} />
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-maroon-deep">{formatINR(p.price)}</span>
                            {p.mrp && p.mrp > p.price && (
                              <span className="text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</span>
                            )}
                            {p.available === false && (
                              <span className="text-[10px] uppercase tracking-wider text-red-600">Out of stock</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 text-gold flex-shrink-0 transition ${active === i ? "opacity-100" : "opacity-0"}`}
                        />
                      </li>
                    ))}
                    <li
                      id={`search-opt-${topResults.length}`}
                      data-idx={topResults.length}
                      role="option"
                      aria-selected={active === topResults.length}
                      onMouseEnter={() => setActive(topResults.length)}
                      onClick={() => goToShop(query)}
                      className={`mt-1 mb-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer text-sm font-medium transition ${
                        active === topResults.length
                          ? "bg-maroon-deep text-white"
                          : "text-maroon-deep hover:bg-maroon-deep hover:text-white"
                      }`}
                    >
                      View all {search.total} result{search.total !== 1 ? "s" : ""} for "{query.trim()}"
                      <ArrowRight className="w-4 h-4" />
                    </li>
                  </ul>
                </>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-muted-foreground mb-4">No products found for "{query.trim()}"</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_SEARCHES.slice(0, 4).map((q) => (
                      <button key={q} type="button" onClick={() => setQuery(q)} className={chip}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-t border-gold/15 bg-cream/40 text-[11px] text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 rounded border bg-white">↑</kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded border bg-white">↓</kbd> navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border bg-white">Enter</kbd> open
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border bg-white">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
