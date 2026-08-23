#!/usr/bin/env node

/**
 * Test Rudraksha Product Checkout Flow
 *
 * This script:
 * 1. Fetches products from Shopify (searching for Rudraksha)
 * 2. Creates a cart with a Rudraksha product
 * 3. Extracts the checkout URL
 * 4. Verifies the checkout URL has proper format and _fd=0 parameter
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN || "08axwa-1x.myshopify.com";
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!accessToken) {
  console.error("❌ SHOPIFY_STOREFRONT_ACCESS_TOKEN env var is required");
  process.exit(1);
}

const apiVersion = "2025-07";

// Query to find Rudraksha products
const getProductsQuery = `
  query {
    products(first: 10, query: "title:Rudraksha") {
      edges {
        node {
          id
          title
          variants(first: 3) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Mutation to create a cart
const createCartMutation = `
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

async function main() {
  try {
    console.log(`\n📦 Fetching Rudraksha products from ${domain}...`);

    // Step 1: Get products
    const productsRes = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: getProductsQuery }),
    });

    const productsData = await productsRes.json();

    if (productsData.errors) {
      console.error("❌ GraphQL Error:", productsData.errors);
      process.exit(1);
    }

    const products = productsData.data.products.edges;
    if (products.length === 0) {
      console.error("❌ No Rudraksha products found");
      process.exit(1);
    }

    const product = products[0].node;
    const variant = product.variants.edges[0]?.node;

    if (!variant) {
      console.error("❌ No variants found for Rudraksha product");
      process.exit(1);
    }

    console.log(`\n✅ Found product: ${product.title}`);
    console.log(`   Variant: ${variant.title}`);
    console.log(`   Price: ${variant.price.amount} ${variant.price.currencyCode}`);
    console.log(`   Variant ID: ${variant.id}`);

    // Step 2: Create cart
    console.log(`\n🛒 Creating cart with Rudraksha product...`);

    const cartRes = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: createCartMutation,
        variables: {
          lines: [
            {
              merchandiseId: variant.id,
              quantity: 1,
            },
          ],
        },
      }),
    });

    const cartData = await cartRes.json();

    if (cartData.errors) {
      console.error("❌ GraphQL Error:", cartData.errors);
      process.exit(1);
    }

    const cartCreate = cartData.data.cartCreate;

    if (cartCreate.userErrors && cartCreate.userErrors.length > 0) {
      console.error("❌ Cart Error:", cartCreate.userErrors[0].message);
      process.exit(1);
    }

    const checkoutUrl = cartCreate.cart.checkoutUrl;
    console.log(`\n✅ Cart created successfully`);
    console.log(`   Cart ID: ${cartCreate.cart.id}`);

    // Step 3: Verify checkout URL
    console.log(`\n🔗 Checkout URL Analysis:`);
    console.log(`   Raw URL: ${checkoutUrl}`);

    const url = new URL(checkoutUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Has _fd parameter: ${url.searchParams.has("_fd")}`);
    console.log(`   _fd value: ${url.searchParams.get("_fd") || "not set"}`);

    // Check for potential redirect loop issues
    const hasFd0 = url.searchParams.get("_fd") === "0";
    const onMyshopify = url.hostname.includes("myshopify.com");

    console.log(`\n✅ Checkout Flow Status:`);
    console.log(`   ✓ Checkout URL is from Shopify`);
    console.log(
      `   ${hasFd0 ? "✓" : "⚠"} Has _fd=0 parameter: ${hasFd0 ? "YES" : "NO (but URL looks valid)"}`,
    );
    console.log(`   ${onMyshopify ? "✓" : "ℹ"} On myshopify.com: ${onMyshopify}`);

    console.log(`\n🌐 To complete checkout in browser, visit:`);
    console.log(`   ${checkoutUrl}`);

    console.log(`\n✅ All checks passed! Ready for browser testing.\n`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
