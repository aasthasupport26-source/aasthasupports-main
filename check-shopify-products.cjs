#!/usr/bin/env node
/**
 * Shopify Product Health Check
 * Verifies product data quality: images, pricing, inventory, categorization
 */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
  console.error("❌ Missing env vars: SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  process.exit(1);
}

const QUERY = `
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          handle
          title
          productType
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                quantityAvailable
                availableForSale
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchProducts(query = null) {
  const products = [];
  let cursor = null;
  let hasNext = true;

  while (hasNext) {
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { first: 250, after: cursor, query },
      }),
    });

    const json = await res.json();
    const edges = json.data?.products?.edges || [];
    products.push(...edges.map((e) => e.node));

    hasNext = json.data?.products?.pageInfo?.hasNextPage || false;
    cursor = json.data?.products?.pageInfo?.endCursor || null;
  }

  return products;
}

async function main() {
  console.log("🔍 Fetching all products from Shopify...\n");

  const allProducts = await fetchProducts();
  console.log(`✅ Fetched ${allProducts.length} total products\n`);

  // Check by category
  const categories = ["rudraksha", "mala", "bracelet", "gemstone", "yantra"];
  const issues = {
    missingImages: [],
    missingPrice: [],
    outOfStock: [],
    missingType: [],
    nepaliRudraksha: [],
    indonesianRudraksha: [],
  };

  for (const cat of categories) {
    const products = allProducts.filter((p) => p.productType?.toLowerCase() === cat);
    console.log(`\n📦 ${cat.toUpperCase()}: ${products.length} products`);

    products.forEach((p) => {
      const hasImage = p.images?.edges?.length > 0;
      const price = parseFloat(p.priceRange?.minVariantPrice?.amount || 0);
      const stock = p.variants?.edges?.[0]?.node?.quantityAvailable || 0;
      const available = p.variants?.edges?.[0]?.node?.availableForSale || false;

      if (!hasImage) issues.missingImages.push({ name: p.title, type: cat, handle: p.handle });
      if (price === 0) issues.missingPrice.push({ name: p.title, type: cat, handle: p.handle });
      if (!available || stock === 0)
        issues.outOfStock.push({ name: p.title, type: cat, stock, handle: p.handle });
      if (!p.productType) issues.missingType.push({ name: p.title, handle: p.handle });

      // Track Rudraksha splits
      if (cat === "rudraksha") {
        if (p.title.toLowerCase().includes("nepal")) {
          issues.nepaliRudraksha.push(p.title);
        }
        if (p.title.toLowerCase().includes("indonesian")) {
          issues.indonesianRudraksha.push(p.title);
        }
      }
    });
  }

  // Report issues
  console.log("\n\n🚨 ISSUES FOUND:\n");

  if (issues.missingImages.length > 0) {
    console.log(`❌ Missing Images (${issues.missingImages.length}):`);
    issues.missingImages.forEach((p) => console.log(`   - ${p.name} (${p.type}) [${p.handle}]`));
  }

  if (issues.missingPrice.length > 0) {
    console.log(`\n❌ Missing/Zero Price (${issues.missingPrice.length}):`);
    issues.missingPrice.forEach((p) => console.log(`   - ${p.name} (${p.type}) [${p.handle}]`));
  }

  if (issues.outOfStock.length > 0) {
    console.log(`\n⚠️  Out of Stock (${issues.outOfStock.length}):`);
    issues.outOfStock.forEach((p) =>
      console.log(`   - ${p.name} (${p.type}) [stock: ${p.stock}] [${p.handle}]`),
    );
  }

  if (issues.missingType.length > 0) {
    console.log(`\n❌ Missing Product Type (${issues.missingType.length}):`);
    issues.missingType.forEach((p) => console.log(`   - ${p.name} [${p.handle}]`));
  }

  console.log(`\n\n📊 RUDRAKSHA BREAKDOWN:`);
  console.log(`   Nepali: ${issues.nepaliRudraksha.length}`);
  console.log(`   Indonesian: ${issues.indonesianRudraksha.length}`);

  if (issues.nepaliRudraksha.length > 0) {
    console.log(`\n🇳🇵 Nepali Rudraksha:`);
    issues.nepaliRudraksha.forEach((name) => console.log(`   - ${name}`));
  }

  if (issues.indonesianRudraksha.length > 0) {
    console.log(`\n🇮🇩 Indonesian Rudraksha:`);
    issues.indonesianRudraksha.forEach((name) => console.log(`   - ${name}`));
  }

  console.log("\n✅ Check complete!\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
