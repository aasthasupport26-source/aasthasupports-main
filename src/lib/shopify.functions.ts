import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";

// Use TanStack Query's `staleTime` on the client side, but we also add a basic
// in-memory cache here to speed up development and consecutive requests on the same instance.
let productsCache: any = null;
let productsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function normalizeShopifyVideoUrl(url: string): string {
  if (!url) return "";
  // Shopify Storefront API uses the store's primary custom domain (e.g. www.aasthasupports.com/cdn/shop/videos/...)
  // But on headless deployments, that domain points to the frontend app, resulting in 404s.
  // The actual media CDN where videos are hosted is cdn.shopify.com.
  return url
    .replace(/^http:\/\//, "https://")
    .replace(/https:\/\/[^/]+\/cdn\/shop\/videos\//, "https://cdn.shopify.com/videos/");
}

export function formatShopifyProductName(node: {
  title?: string;
  productType?: string;
  tags?: string[];
  description?: string;
  handle?: string;
}): string {
  let title = node.title || "";
  const isGemstone =
    node.productType?.toLowerCase() === "gemstone" ||
    (node.tags || []).some((t: string) => {
      const tag = t.toLowerCase();
      return tag.includes("gemstone") || tag.includes("sapphire") || tag.includes("pukhraj");
    });

  if (isGemstone && !/ratti/i.test(title)) {
    const descMatch = (node.description || "").match(/(\d+(?:\.\d+)?)\s*ratti\b/i);
    const handleMatch = (node.handle || "").match(/(?:^|-)(\d+)[-_](\d+)[-_]ratti(?:-|$)/i);
    if (descMatch) {
      title = `${title} (${descMatch[1]} Ratti)`;
    } else if (handleMatch) {
      title = `${title} (${handleMatch[1]}.${handleMatch[2]} Ratti)`;
    }
  }
  return title;
}

export const getShopifyProducts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      category: z.string().optional(),
      limit: z.number().int().min(1).max(250).default(20),
      cursor: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { shopifyClient } = await import("./shopify/client");
    const {
      GET_PRODUCTS_QUERY,
      GET_PRODUCT_BY_HANDLE_QUERY,
      CREATE_CART_MUTATION,
      GET_CUSTOMER_ORDERS_QUERY,
    } = await import("./shopify/queries");
    try {
      let response: any;

      // Use cache if available and not paginating
      if (productsCache && Date.now() - productsCacheTime < CACHE_TTL && !data.cursor) {
        response = productsCache;
      } else {
        response = await shopifyClient.request(GET_PRODUCTS_QUERY, {
          first: 250, // Fetch all to filter in-memory due to dirty Shopify data
          after: data.cursor,
        });

        // Cache the full response if it's the first page
        if (!data.cursor) {
          productsCache = response;
          productsCacheTime = Date.now();
        }
      }

      const products = response.products.edges.map((edge: any) => {
        const node = edge.node;
        const metafieldsMap = new Map(node.metafields?.map((m: any) => [m?.key, m?.value]) || []);

        const mediaEdges = node.media?.edges || [];
        const videoNode = mediaEdges.find(
          (m: any) =>
            m.node.mediaContentType === "VIDEO" || m.node.mediaContentType === "EXTERNAL_VIDEO",
        )?.node;

        let videoData: { id: string; url: string; preview: string; mimeType: string } | null = null;
        if (videoNode && videoNode.mediaContentType === "VIDEO") {
          const bestSource =
            videoNode.sources?.find(
              (s: any) => s.mimeType === "video/mp4" && s.url.includes("1080p"),
            ) ||
            videoNode.sources?.find(
              (s: any) => s.mimeType === "video/mp4" && s.url.includes("720p"),
            ) ||
            videoNode.sources?.find((s: any) => s.mimeType === "video/mp4") ||
            videoNode.sources?.[0];

          videoData = {
            id: videoNode.id,
            url: normalizeShopifyVideoUrl(bestSource?.url || ""),
            preview: videoNode.previewImage?.url || "",
            mimeType: bestSource?.mimeType || "video/mp4",
          };
        } else if (videoNode && videoNode.mediaContentType === "EXTERNAL_VIDEO") {
          videoData = {
            id: videoNode.id,
            url: videoNode.embedUrl || "",
            preview: "",
            mimeType: "video/external",
          };
        }

        // Image fallback: if no image in images.edges, use video preview or media image
        let primaryImage = node.images?.edges?.[0]?.node?.url || "";
        if (!primaryImage && videoData?.preview) {
          primaryImage = videoData.preview;
        }

        return {
          slug: node.handle,
          name: formatShopifyProductName(node),
          price: parseFloat(node.priceRange.minVariantPrice.amount),
          mrp: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : null,
          image: primaryImage,
          video: videoData,
          description: node.description || "",
          shopifyId: node.id,
          variantId: node.variants.edges[0]?.node.id,
          stock: node.variants.edges[0]?.node.quantityAvailable || 0,
          available: node.variants.edges[0]?.node.availableForSale || false,
          category: metafieldsMap.get("category") || node.productType || "",
          productType: node.productType || "",
          benefits: metafieldsMap.get("benefits")
            ? JSON.parse(String(metafieldsMap.get("benefits")))
            : [],
          certified: metafieldsMap.get("certified") === "true",
          tags: node.tags || [],
        };
      });

      // Filter in-memory to fix dirty Shopify data where Malas are tagged as product_type:rudraksha
      let filteredProducts = products;
      if (data.category && data.category !== "all") {
        const target = data.category.toLowerCase();
        filteredProducts = products.filter((p: any) => {
          const name = p.name.toLowerCase();
          const cat = p.category.toLowerCase();
          const type = p.productType.toLowerCase();

          if (target === "rudraksha") {
            // Must be rudraksha but NOT a mala
            return (
              (name.includes("rudraksha") ||
                cat.includes("rudraksha") ||
                type.includes("rudraksha")) &&
              !name.includes("mala") &&
              !cat.includes("mala")
            );
          }
          if (target === "mala") {
            return name.includes("mala") || cat.includes("mala") || type.includes("mala");
          }
          if (target === "bracelet" || target === "bracelets") {
            return (
              name.includes("bracelet") || cat.includes("bracelet") || type.includes("bracelet")
            );
          }
          if (target === "gemstone" || target === "gemstones") {
            const tags = (p.tags || []).map((tag: string) => tag.toLowerCase()).join(" ");
            const gemstoneNames = [
              "ruby",
              "manik",
              "pearl",
              "moti",
              "coral",
              "moonga",
              "emerald",
              "panna",
              "sapphire",
              "neelam",
              "pukhraj",
              "topaz",
              "opal",
              "amethyst",
              "garnet",
              "navratna",
            ];
            const isBracelet =
              name.includes("bracelet") ||
              cat.includes("bracelet") ||
              type.includes("bracelet") ||
              tags.includes("bracelet");
            const isGemstone =
              name.includes("gemstone") ||
              cat.includes("gemstone") ||
              type.includes("gemstone") ||
              tags.includes("gemstone") ||
              gemstoneNames.some(
                (gemstoneName) => name.includes(gemstoneName) || tags.includes(gemstoneName),
              );

            return isGemstone && !isBracelet;
          }
          if (target === "yantra") {
            return name.includes("yantra") || cat.includes("yantra") || type.includes("yantra");
          }
          return false;
        });
      }

      return {
        products: filteredProducts,
        pageInfo: {
          hasNextPage: response.products.pageInfo.hasNextPage,
          endCursor: response.products.pageInfo.endCursor,
        },
      };
    } catch (error: any) {
      console.error("Shopify API error:", error);
      throw new Error(`Failed to fetch products from Shopify: ${error?.message || String(error)}`);
    }
  });

export const getShopifyProduct = createServerFn({ method: "GET" })
  .validator(z.object({ handle: z.string() }))
  .handler(async ({ data }) => {
    const { shopifyClient } = await import("./shopify/client");
    const {
      GET_PRODUCTS_QUERY,
      GET_PRODUCT_BY_HANDLE_QUERY,
      CREATE_CART_MUTATION,
      GET_CUSTOMER_ORDERS_QUERY,
    } = await import("./shopify/queries");
    try {
      const response: any = await shopifyClient.request(GET_PRODUCT_BY_HANDLE_QUERY, {
        handle: data.handle,
      });

      if (!response.product) {
        return null;
      }

      const node = response.product;
      const metafieldsMap = new Map(node.metafields?.map((m: any) => [m?.key, m?.value]) || []);

      const mediaItems = (node.media?.edges || [])
        .map((e: any) => {
          const m = e.node;
          if (m.mediaContentType === "VIDEO") {
            const bestSource =
              m.sources?.find((s: any) => s.mimeType === "video/mp4" && s.url.includes("1080p")) ||
              m.sources?.find((s: any) => s.mimeType === "video/mp4" && s.url.includes("720p")) ||
              m.sources?.find((s: any) => s.mimeType === "video/mp4") ||
              m.sources?.[0];

            return {
              type: "video" as const,
              id: m.id,
              url: normalizeShopifyVideoUrl(bestSource?.url || ""),
              sources: (m.sources || []).map((s: any) => ({
                ...s,
                url: normalizeShopifyVideoUrl(s.url),
              })),
              preview: m.previewImage?.url || "",
              mimeType: bestSource?.mimeType || "video/mp4",
            };
          } else if (m.mediaContentType === "EXTERNAL_VIDEO") {
            return {
              type: "external_video" as const,
              id: m.id,
              url: m.embedUrl || "",
              preview: "",
              mimeType: "video/external",
            };
          } else if (m.mediaContentType === "IMAGE") {
            return {
              type: "image" as const,
              id: m.id,
              url: m.image?.url || "",
              altText: m.image?.altText || "",
            };
          }
          return null;
        })
        .filter(Boolean);

      let imageUrls: string[] = node.images?.edges?.map((e: any) => e.node.url) || [];
      const videos = mediaItems.filter(
        (m: any) => m.type === "video" || m.type === "external_video",
      );

      if (imageUrls.length === 0 && videos.length > 0) {
        const videoPreviews = videos.map((v: any) => v.preview).filter(Boolean);
        if (videoPreviews.length > 0) {
          imageUrls = videoPreviews;
        }
      }

      const product = {
        slug: node.handle,
        name: formatShopifyProductName(node),
        description: node.description || "",
        descriptionHtml: node.descriptionHtml || "",
        price: parseFloat(node.priceRange.minVariantPrice.amount),
        mrp: node.compareAtPriceRange?.minVariantPrice?.amount
          ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
          : null,
        images: imageUrls,
        media: mediaItems,
        videos,
        shopifyId: node.id,
        variants: node.variants.edges.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          price: parseFloat(e.node.price.amount),
          compareAtPrice: e.node.compareAtPrice?.amount
            ? parseFloat(e.node.compareAtPrice.amount)
            : null,
          available: e.node.availableForSale,
          stock: e.node.quantityAvailable,
        })),
        benefits: metafieldsMap.get("benefits")
          ? JSON.parse(String(metafieldsMap.get("benefits")))
          : [],
        certified: metafieldsMap.get("certified") === "true",
        category: metafieldsMap.get("category") || "",
        tags: node.tags || [],
      };

      return product;
    } catch (error) {
      console.error("Shopify API error:", error);
      return null;
    }
  });

export const createShopifyCheckout = createServerFn({ method: "POST" })
  .validator(
    z.object({
      items: z.array(
        z.object({
          variantId: z.string(),
          quantity: z.number().int().min(1),
          attributes: z
            .array(
              z.object({
                key: z.string(),
                value: z.string(),
              }),
            )
            .optional(),
        }),
      ),
    }),
  )
  .handler(async ({ data }) => {
    const sessionCookie = getCookie("aastha_session");
    if (!sessionCookie) {
      throw new Error("Please sign in before checkout");
    }

    try {
      const session = JSON.parse(sessionCookie) as { expiresAt?: string };
      if (!session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
        throw new Error("Please sign in before checkout");
      }
    } catch {
      throw new Error("Please sign in before checkout");
    }

    const { shopifyClient } = await import("./shopify/client");
    const {
      GET_PRODUCTS_QUERY,
      GET_PRODUCT_BY_HANDLE_QUERY,
      CREATE_CART_MUTATION,
      GET_CUSTOMER_ORDERS_QUERY,
    } = await import("./shopify/queries");
    const maxRetries = 3;
    let lastError: any;

    // Fetch actual prices from Shopify to prevent price manipulation
    const { GET_PRODUCT_BY_VARIANT } = await import("./shopify/queries");
    const variantIds = data.items.map((item) => item.variantId);

    // Validate prices server-side
    for (const item of data.items) {
      try {
        const result: any = await shopifyClient.request(GET_PRODUCT_BY_VARIANT, {
          id: item.variantId,
        });

        if (!result?.node?.price) {
          throw new Error(`Invalid variant: ${item.variantId}`);
        }

        // Price validation happens server-side, client prices are ignored
      } catch (err) {
        throw new Error(`Failed to validate product: ${item.variantId}`);
      }
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const lines = data.items.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
          attributes: item.attributes || [],
        }));

        const response: any = await shopifyClient.request(CREATE_CART_MUTATION, {
          lines,
        });

        const cartCreate = response.cartCreate;
        if (cartCreate.userErrors && cartCreate.userErrors.length > 0) {
          throw new Error(cartCreate.userErrors[0].message);
        }

        let checkoutUrl: string = cartCreate.cart.checkoutUrl;
        console.log("[Shopify] Original checkout URL:", checkoutUrl);

        // Do not force-rewrite the host. Use Shopify's returned checkout URL
        // and append `_fd=0` to bypass Shopify's automatic primary-domain
        // redirect when necessary. Only add the flag if it's not already present.
        if (!checkoutUrl.includes("_fd=0")) {
          checkoutUrl += (checkoutUrl.includes("?") ? "&" : "?") + "_fd=0";
        }
        console.log("[Shopify] Checkout URL with _fd=0:", checkoutUrl);

        return { checkoutUrl };
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries - 1 && error.message?.includes("throttled")) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    console.error("Shopify checkout creation error:", lastError);
    throw new Error(lastError?.message || "Failed to create Shopify checkout");
  });

export const getCustomerOrders = createServerFn({ method: "GET" })
  .validator(
    z.object({
      customerAccessToken: z.string(),
      limit: z.number().int().min(1).max(50).default(20),
    }),
  )
  .handler(async ({ data }) => {
    const { shopifyClient } = await import("./shopify/client");
    const {
      GET_PRODUCTS_QUERY,
      GET_PRODUCT_BY_HANDLE_QUERY,
      CREATE_CART_MUTATION,
      GET_CUSTOMER_ORDERS_QUERY,
    } = await import("./shopify/queries");
    try {
      if (data.customerAccessToken.startsWith("shcat_")) {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID || process.env.SHOPIFY_STORE_ID;
        const url = `https://shopify.com/${SHOP_ID}/account/customer/api/2025-07/graphql`;

        const query = `
          query GetCustomerOrders($first: Int!) {
            customer {
              orders(first: $first) {
                nodes {
                  id
                  name
                  processedAt
                  financialStatus
                  fulfillmentStatus
                  totalPrice {
                    amount
                    currencyCode
                  }
                  lineItems(first: 10) {
                    nodes {
                      title
                      quantity
                      price {
                        amount
                      }
                      variant {
                        image {
                          url
                        }
                      }
                    }
                  }
                  fulfillments(first: 1) {
                    nodes {
                      trackingInfo(first: 1) {
                        number
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.customerAccessToken}`,
          },
          body: JSON.stringify({
            query,
            variables: {
              first: data.limit,
            },
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Shopify Customer Account API error: ${res.status} ${errorText}`);
        }

        const response: any = await res.json();
        const customerNode = response.data?.customer;

        if (!customerNode) {
          return { orders: [] };
        }

        const orders = customerNode.orders.nodes.map((node: any) => {
          const fulfillment = node.fulfillments?.nodes?.[0];
          const tracking = fulfillment?.trackingInfo?.[0];
          return {
            id: node.id,
            name: node.name,
            processedAt: node.processedAt,
            financialStatus: node.financialStatus,
            fulfillmentStatus: node.fulfillmentStatus,
            total: parseFloat(node.totalPrice.amount),
            currency: node.totalPrice.currencyCode,
            lineItems: node.lineItems.nodes.map((le: any) => ({
              title: le.title,
              quantity: le.quantity,
              price: parseFloat(le.price?.amount || "0"),
              image: le.variant?.image?.url || null,
            })),
            tracking: tracking
              ? {
                  number: tracking.number || null,
                  url: tracking.url || null,
                }
              : null,
          };
        });

        return { orders };
      } else {
        // Fallback to Storefront API for legacy/email-login customer tokens
        const response: any = await shopifyClient.request(GET_CUSTOMER_ORDERS_QUERY, {
          customerAccessToken: data.customerAccessToken,
          first: data.limit,
        });

        if (!response.customer) {
          return { orders: [] };
        }

        const orders = response.customer.orders.edges.map((edge: any) => {
          const node = edge.node;
          const tracking = node.successfulFulfillments?.[0];
          return {
            id: node.id,
            name: node.name,
            processedAt: node.processedAt,
            financialStatus: node.financialStatus,
            fulfillmentStatus: node.fulfillmentStatus,
            total: parseFloat(node.totalPriceV2.amount),
            currency: node.totalPriceV2.currencyCode,
            lineItems: node.lineItems.edges.map((le: any) => ({
              title: le.node.title,
              quantity: le.node.quantity,
              price: parseFloat(le.node.originalTotalPrice.amount),
              image: le.node.variant?.image?.url || null,
            })),
            tracking: tracking
              ? {
                  number: tracking.trackingInfo?.[0]?.number || null,
                  url: tracking.trackingInfo?.[0]?.url || null,
                }
              : null,
          };
        });

        return { orders };
      }
    } catch (error: any) {
      console.error("Shopify customer orders error:", error);
      return { orders: [] };
    }
  });
