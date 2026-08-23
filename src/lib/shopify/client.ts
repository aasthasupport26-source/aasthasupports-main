import { GraphQLClient } from "graphql-request";
import { validateQueryDepth, validateQueryComplexity, validateBatchQuery } from "../graphql-security";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-07";

if (!SHOPIFY_STORE_DOMAIN) throw new Error("SHOPIFY_STORE_DOMAIN is required");
if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is required");

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const baseClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const shopifyClient = {
  request: async (query: string, variables?: any) => {
    validateQueryDepth(query, 10);
    validateQueryComplexity(query, 1000);
    validateBatchQuery(query, 10);
    return baseClient.request(query, variables);
  }
};

const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!SHOPIFY_ADMIN_ACCESS_TOKEN) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is required");

const adminEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

const baseAdminClient = new GraphQLClient(adminEndpoint, {
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const shopifyAdminClient = {
  request: async (query: string, variables?: any) => {
    validateQueryDepth(query, 10);
    validateQueryComplexity(query, 1000);
    validateBatchQuery(query, 10);
    return baseAdminClient.request(query, variables);
  }
};
