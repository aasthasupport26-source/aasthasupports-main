import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getShopifyProducts } from "@/lib/shopify.functions";
import type { Category } from "@/data/catalog";

export function MegaDropdown({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const fetchProducts = useServerFn(getShopifyProducts);

  const { data, isLoading } = useQuery({
    queryKey: ["dropdown-products", cat.slug],
    queryFn: () =>
      fetchProducts({
        data: {
          category: cat.slug,
          limit: cat.slug === "rudraksha" ? 250 : 8,
        },
      }),
    staleTime: 5 * 60 * 1000,
    enabled: cat.slug !== "online-pooja",
  });

  const products = data?.products || [];

  // Prefetch images
  if (!isLoading && products.length > 0) {
    products.forEach((p: any) => {
      if (p.image) {
        const img = new Image();
        img.src = p.image;
      }
    });
  }

  // For Rudraksha: split into Nepali and Indonesian, then sort by mukhi number
  const sortByMukhi = (a: any, b: any) => {
    const aMatch = a.name.match(/(\d+)\s*mukhi/i);
    const bMatch = b.name.match(/(\d+)\s*mukhi/i);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.name.localeCompare(b.name);
  };

  const nepaliProducts =
    cat.slug === "rudraksha"
      ? products
          .filter((p: any) => p.productType.toLowerCase() === "rudraksha" && p.name.toLowerCase().includes("nepal"))
          .sort(sortByMukhi)
          .slice(0, 4)
      : [];
  const indonesianProducts =
    cat.slug === "rudraksha"
      ? products
          .filter((p: any) => p.productType.toLowerCase() === "rudraksha" && p.name.toLowerCase().includes("indonesian"))
          .sort(sortByMukhi)
          .slice(0, 4)
      : [];

  // Fallback: if not enough products in either category, show first 8 products
  const showFallback =
    cat.slug === "rudraksha" && nepaliProducts.length + indonesianProducts.length < 4;

  return (
    <div
      className="absolute top-full left-0 right-0 bg-cream border-t-2 border-gold shadow-2xl z-50"
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 border-r border-gold/30 pr-8 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] text-gold uppercase mb-2">Category</p>
              <h3 className="font-display text-3xl text-maroon-deep mb-3">{cat.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{cat.tagline}</p>

              <div className="space-y-2 mb-6 text-xs text-maroon-deep font-medium bg-white/60 p-3 rounded-xl border border-gold/20">
                <div className="flex items-center gap-2">
                  <span>🛡️</span> <span>100% Certified &amp; Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕉️</span> <span>Vedic Pandit Energised</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚚</span> <span>Free Express Shipping</span>
                </div>
              </div>
            </div>

            <Link
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="inline-flex items-center justify-center gap-2 bg-maroon-deep text-cream px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase hover:bg-maroon transition shadow-md"
            >
              View all {cat.name} →
            </Link>
          </div>

          {cat.slug === "online-pooja" ? (
            <div className={`col-span-9 grid gap-8 grid-cols-2`}>
              {cat.sections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.name}
                        to="/book-pooja"
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                            {item.name}
                          </p>
                          {item.desc && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : cat.slug === "rudraksha" ? (
            showFallback ? (
              <div className="col-span-9">
                <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                  All Rudraksha Products
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {products.filter((p: any) => p.productType.toLowerCase() === "rudraksha").slice(0, 8).map((product: any) => (
                    <Link
                      key={product.slug}
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-9 grid gap-8 grid-cols-2">
                <div>
                  <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                    Nepali Rudraksha (Collector Beads)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {nepaliProducts.map((product: any) => (
                      <Link
                        key={product.slug}
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                    Indonesian Rudraksha (1-14 Mukhi)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {indonesianProducts.map((product: any) => (
                      <Link
                        key={product.slug}
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            ₹{product.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="col-span-9">
              <h4 className="text-xs tracking-[0.25em] text-gold uppercase mb-4 pb-2 border-b border-gold/20 font-bold">
                {cat.sections[0]?.title || "Products"}
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {products.slice(0, 8).map((product: any) => (
                  <Link
                    key={product.slug}
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gold/30 shadow-none hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover border border-gold/40 group-hover:border-gold group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-maroon-deep group-hover:text-maroon truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
