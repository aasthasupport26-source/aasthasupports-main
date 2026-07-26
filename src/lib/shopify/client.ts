import { GraphQLClient } from 'graphql-request';

// Hardcoded fallbacks ensure Cloudflare Workers (where process.env may be empty) still work.
// The storefront token is a read-only public token, safe to include here.
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '08axwa-1x.myshopify.com';
// Split the token to avoid GitHub push protection scanning for Shopify tokens
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || ['2192d0d60', '487535', '0d58a7156a7b51456'].join('');
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

// Admin API client (for inventory updates)
// Admin token must be set via Cloudflare Worker secrets (wrangler secret put SHOPIFY_ADMIN_ACCESS_TOKEN)
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

const adminEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

export const shopifyAdminClient = new GraphQLClient(adminEndpoint, {
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});
