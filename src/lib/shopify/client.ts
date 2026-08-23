import { GraphQLClient } from "graphql-request";
import { validateQueryDepth, validateQueryComplexity, validateBatchQuery } from "../graphql-security";

// Lazy-initialize clients so this module never throws at import time in the browser.
// All values are read inside getters that are only called on the server.

function getStorefrontClient(): GraphQLClient {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2025-07";

  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is required");
  if (!token) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is required");

  return new GraphQLClient(`https://${domain}/api/${version}/graphql.json`, {
    headers: {
      "X-Shopify-Storefront-Access-Token": token,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
}

function getAdminClient(): GraphQLClient {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2025-07";

  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is required");
  if (!token) throw new Error("SHOPIFY_ADMIN_ACCESS_TOKEN is required");

  return new GraphQLClient(`https://${domain}/admin/api/${version}/graphql.json`, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });
}

let _storefrontClient: GraphQLClient | null = null;
let _adminClient: GraphQLClient | null = null;

export const shopifyClient = {
  request: async (query: string, variables?: any) => {
    if (!_storefrontClient) _storefrontClient = getStorefrontClient();
    validateQueryDepth(query, 10);
    validateQueryComplexity(query, 1000);
    validateBatchQuery(query, 100);
    return _storefrontClient.request(query, variables);
  }
};

export const shopifyAdminClient = {
  request: async (query: string, variables?: any) => {
    if (!_adminClient) _adminClient = getAdminClient();
    validateQueryDepth(query, 10);
    validateQueryComplexity(query, 1000);
    validateBatchQuery(query, 100);
    return _adminClient.request(query, variables);
  }
};
