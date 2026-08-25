import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Use TanStack Query's `staleTime` on the client side, but we also add a basic
// in-memory cache here to speed up development and consecutive requests on the same instance.
let productsCache: any = null;
let productsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    const { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, CREATE_CART_MUTATION, GET_CUSTOMER_ORDERS_QUERY } = await import("./shopify/queries");
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
        const metafieldsMap = new Map(
          node.metafields?.map((m: any) => [m?.key, m?.value]) || []
        );

        return {
          slug: node.handle,
          name: node.title,
          price: parseFloat(node.priceRange.minVariantPrice.amount),
          mrp: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : null,
          image: node.images.edges[0]?.node.url || "",
          description: node.description || "",
          shopifyId: node.id,
          variantId: node.variants.edges[0]?.node.id,
          stock: node.variants.edges[0]?.node.quantityAvailable || 0,
          available: node.variants.edges[0]?.node.availableForSale || false,
          category: metafieldsMap.get("category") || node.productType || "",
          productType: node.productType || "",
          benefits: metafieldsMap.get("benefits") ? JSON.parse(String(metafieldsMap.get("benefits"))) : [],
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
            return (name.includes("rudraksha") || cat.includes("rudraksha") || type.includes("rudraksha")) && !name.includes("mala") && !cat.includes("mala");
          }
          if (target === "mala") {
            return name.includes("mala") || cat.includes("mala") || type.includes("mala");
          }
          if (target === "bracelet" || target === "bracelets") {
            return name.includes("bracelet") || cat.includes("bracelet") || type.includes("bracelet");
          }
          if (target === "gemstone" || target === "gemstones") {
            return name.includes("gemstone") || cat.includes("gemstone") || type.includes("gemstone");
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
    const { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, CREATE_CART_MUTATION, GET_CUSTOMER_ORDERS_QUERY } = await import("./shopify/queries");
    try {
      const response: any = await shopifyClient.request(GET_PRODUCT_BY_HANDLE_QUERY, {
        handle: data.handle,
      });

      if (!response.product) {
        return null;
      }

      const node = response.product;
      const metafieldsMap = new Map(
        node.metafields?.map((m: any) => [m?.key, m?.value]) || []
      );

      const product = {
        slug: node.handle,
        name: node.title,
        description: node.description || "",
        descriptionHtml: node.descriptionHtml || "",
        price: parseFloat(node.priceRange.minVariantPrice.amount),
        mrp: node.compareAtPriceRange?.minVariantPrice?.amount
          ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
          : null,
        images: node.images.edges.map((e: any) => e.node.url),
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
        benefits: metafieldsMap.get("benefits") ? JSON.parse(String(metafieldsMap.get("benefits"))) : [],
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
    const { shopifyClient } = await import("./shopify/client");
    const { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, CREATE_CART_MUTATION, GET_CUSTOMER_ORDERS_QUERY } = await import("./shopify/queries");
    const maxRetries = 3;
    let lastError: any;
    
    // Fetch actual prices from Shopify to prevent price manipulation
    const { GET_PRODUCT_BY_VARIANT } = await import("./shopify/queries");
    const variantIds = data.items.map(item => item.variantId);
    
    // Validate prices server-side
    for (const item of data.items) {
      try {
        const result: any = await shopifyClient.request(GET_PRODUCT_BY_VARIANT, {
          id: item.variantId
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
    const { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY, CREATE_CART_MUTATION, GET_CUSTOMER_ORDERS_QUERY } = await import("./shopify/queries");
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
