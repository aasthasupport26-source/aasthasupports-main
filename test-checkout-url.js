// Quick test to see what checkout URL Shopify returns
import { GraphQLClient } from "graphql-request";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "08axwa-1x.myshopify.com";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const client = new GraphQLClient(`https://${SHOPIFY_STORE_DOMAIN}/api/2025-07/graphql.json`, {
  headers: {
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

const mutation = `
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Test with a dummy variant ID
const response = await client.request(mutation, {
  lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }],
});

console.log("Checkout URL:", response.cartCreate.cart.checkoutUrl);
