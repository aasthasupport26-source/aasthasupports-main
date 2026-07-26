import { createServerFn } from '@tanstack/react-start';
import { shopifyClient } from './shopify/client';
import { GET_PRODUCTS_QUERY, GET_PRODUCT_BY_HANDLE_QUERY } from './shopify/queries';
import { z } from 'zod';

// In-memory cache (5 minutes TTL)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getShopifyProducts = createServerFn({ method: 'GET' })
  .validator(z.object({
    category: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(50),
  }))
  .handler(async ({ data }) => {
    const cacheKey = `products_${data.category || 'all'}_${data.limit}`;
    const cached = cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const response: any = await shopifyClient.request(GET_PRODUCTS_QUERY, {
        first: data.limit,
      });

      const products = response.products.edges.map((edge: any) => {
        const node = edge.node;
        const categoryMeta = node.metafields?.find((m: any) => m?.key === 'category');
        const benefitsMeta = node.metafields?.find((m: any) => m?.key === 'benefits');
        const certifiedMeta = node.metafields?.find((m: any) => m?.key === 'certified');

        return {
          slug: node.handle,
          name: node.title,
          price: parseFloat(node.priceRange.minVariantPrice.amount),
          mrp: node.compareAtPriceRange?.minVariantPrice?.amount
            ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount)
            : null,
          image: node.images.edges[0]?.node.url || '',
          description: node.description || '',
          shopifyId: node.id,
          variantId: node.variants.edges[0]?.node.id,
          stock: node.variants.edges[0]?.node.quantityAvailable || 0,
          available: node.variants.edges[0]?.node.availableForSale || false,
          category: categoryMeta?.value || '',
          benefits: benefitsMeta?.value ? JSON.parse(benefitsMeta.value) : [],
          certified: certifiedMeta?.value === 'true',
        };
      });

      const result = data.category
        ? products.filter((p: any) => p.category.toLowerCase().trim() === (data.category ?? '').toLowerCase().trim())
        : products;

      cache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });
      return result;
    } catch (error) {
      console.error('Shopify API error:', error);
      throw new Error('Failed to fetch products from Shopify');
    }
  });

export const getShopifyProduct = createServerFn({ method: 'GET' })
  .validator(z.object({ handle: z.string() }))
  .handler(async ({ data }) => {
    const cacheKey = `product_${data.handle}`;
    const cached = cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const response: any = await shopifyClient.request(GET_PRODUCT_BY_HANDLE_QUERY, {
        handle: data.handle,
      });

      if (!response.product) {
        return null;
      }

      const node = response.product;
      const categoryMeta = node.metafields?.find((m: any) => m?.key === 'category');
      const benefitsMeta = node.metafields?.find((m: any) => m?.key === 'benefits');
      const certifiedMeta = node.metafields?.find((m: any) => m?.key === 'certified');

      const product = {
        slug: node.handle,
        name: node.title,
        description: node.description || '',
        descriptionHtml: node.descriptionHtml || '',
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
        benefits: benefitsMeta?.value ? JSON.parse(benefitsMeta.value) : [],
        certified: certifiedMeta?.value === 'true',
        category: categoryMeta?.value || '',
      };

      cache.set(cacheKey, { data: product, expiry: Date.now() + CACHE_TTL });
      return product;
    } catch (error) {
      console.error('Shopify API error:', error);
      return null;
    }
  });

// Clear cache function (call after order completion)
export const clearShopifyCache = () => {
  cache.clear();
};

import { CREATE_CART_MUTATION, GET_CUSTOMER_ORDERS_QUERY } from './shopify/queries';

export const createShopifyCheckout = createServerFn({ method: 'POST' })
  .validator(z.object({
    items: z.array(z.object({
      variantId: z.string().optional(),
      quantity: z.number().int().min(1),
      attributes: z.array(z.object({
        key: z.string(),
        value: z.string()
      })).optional(),
    }))
  }))
  .handler(async ({ data }) => {
    try {
      const validItems = data.items.filter(item => item.variantId && item.variantId.trim().length > 0);

      if (validItems.length === 0) {
        throw new Error('No valid product variants found for Shopify checkout.');
      }

      const lines = validItems.map(item => {
        let varId = item.variantId!.trim();
        if (!varId.startsWith('gid://')) {
          varId = `gid://shopify/ProductVariant/${varId}`;
        }
        return {
          merchandiseId: varId,
          quantity: item.quantity,
          attributes: item.attributes || []
        };
      });

      const response: any = await shopifyClient.request(CREATE_CART_MUTATION, {
        lines,
      });

      const cartCreate = response.cartCreate;
      if (cartCreate.userErrors && cartCreate.userErrors.length > 0) {
        throw new Error(cartCreate.userErrors[0].message);
      }

      let checkoutUrl = cartCreate.cart.checkoutUrl;
      if (checkoutUrl) {
        // Shopify returns our custom domain (aasthasupports.com) in checkout URLs.
        // Always rewrite to the actual myshopify.com checkout domain so it works.
        checkoutUrl = checkoutUrl
          .replace(/^https:\/\/(www\.)?aasthasupports\.com/i, 'https://08axwa-1x.myshopify.com')
          .replace(/^http:\/\/(www\.)?aasthasupports\.com/i, 'https://08axwa-1x.myshopify.com');
      }

      return {
        checkoutUrl
      };
    } catch (error: any) {
      console.error('Shopify checkout creation error:', error);
      throw new Error(error.message || 'Failed to create Shopify checkout');
    }
  });

export const getCustomerOrders = createServerFn({ method: 'GET' })
  .validator(z.object({
    customerAccessToken: z.string(),
    limit: z.number().int().min(1).max(50).default(20),
  }))
  .handler(async ({ data }) => {
    try {
      if (data.customerAccessToken.startsWith('shcat_')) {
        const SHOP_ID = process.env.SHOPIFY_SHOP_ID || process.env.SHOPIFY_STORE_ID;
        const url = `https://shopify.com/${SHOP_ID}/account/customer/api/2024-07/graphql`;

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
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.customerAccessToken}`,
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
              price: parseFloat(le.price?.amount || '0'),
              image: le.variant?.image?.url || null,
            })),
            tracking: tracking ? {
              number: tracking.number || null,
              url: tracking.url || null,
            } : null,
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
            tracking: tracking ? {
              number: tracking.trackingInfo?.[0]?.number || null,
              url: tracking.trackingInfo?.[0]?.url || null,
            } : null,
          };
        });

        return { orders };
      }
    } catch (error: any) {
      console.error('Shopify customer orders error:', error);
      return { orders: [] };
    }
  });

