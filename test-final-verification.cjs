const { GraphQLClient } = require("graphql-request");

const SHOPIFY_STORE_DOMAIN = "08axwa-1x.myshopify.com";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = "2192d0d604875350d58a7156a7b51456";
const SHOPIFY_API_VERSION = "2024-10";

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const client = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          handle
          title
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                quantityAvailable
              }
            }
          }
          metafields(
            identifiers: [
              { namespace: "custom", key: "category" }
              { namespace: "custom", key: "benefits" }
              { namespace: "custom", key: "certified" }
            ]
          ) {
            key
            value
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

async function testCategory(category, limit = 250) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${category.toUpperCase()}`);
  console.log("=".repeat(60));

  let queryFilter = undefined;
  if (category && category !== "all") {
    let productType = category;
    if (productType === "bracelets") productType = "bracelet";
    if (productType === "gemstones") productType = "gemstone";
    if (productType === "poojas") productType = "pooja";
    queryFilter = `product_type:${productType}`;
  }

  console.log(`Query filter: ${queryFilter || "none (all products)"}`);

  try {
    const response = await client.request(GET_PRODUCTS_QUERY, {
      first: limit,
      after: null,
      query: queryFilter,
    });

    const products = response.products.edges
      .map((edge) => {
        const node = edge.node;
        const categoryMeta = node.metafields?.find((m) => m?.key === "category");
        const certifiedMeta = node.metafields?.find((m) => m?.key === "certified");

        return {
          slug: node.handle,
          name: node.title,
          price: parseFloat(node.priceRange.minVariantPrice.amount),
          image: node.images.edges[0]?.node.url || "",
          shopifyId: node.id,
          variantId: node.variants.edges[0]?.node.id,
          stock: node.variants.edges[0]?.node.quantityAvailable || 0,
          available: node.variants.edges[0]?.node.availableForSale || false,
          category: node.productType || categoryMeta?.value || "",
          productType: node.productType || "",
          tags: node.tags || [],
          certified: certifiedMeta?.value === "true",
        };
      })
      .filter((p) => p.productType) // Filter out products without productType
      .sort((a, b) => {
        // Sort by category first, then by name
        if (a.productType !== b.productType) {
          return a.productType.localeCompare(b.productType);
        }
        return a.name.localeCompare(b.name);
      });

    console.log(`✓ Found ${products.length} products`);

    // Group by productType
    const grouped = {};
    products.forEach((p) => {
      if (!grouped[p.productType]) {
        grouped[p.productType] = [];
      }
      grouped[p.productType].push(p);
    });

    console.log("\nProducts by type:");
    Object.keys(grouped)
      .sort()
      .forEach((type) => {
        console.log(`  ${type}: ${grouped[type].length} products`);
      });

    console.log("\nFirst 3 products:");
    products.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     Type: ${p.productType} | Price: ₹${p.price} | Available: ${p.available}`);
    });

    return { success: true, count: products.length, products };
  } catch (error) {
    console.error("✗ ERROR:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.errors, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log("SHOPIFY PRODUCT FETCH VERIFICATION");
  console.log("API Version:", SHOPIFY_API_VERSION);
  console.log("Store:", SHOPIFY_STORE_DOMAIN);

  const categories = ["all", "rudraksha", "mala", "bracelet", "gemstone", "yantra", "pooja"];

  const results = {};

  for (const cat of categories) {
    const result = await testCategory(cat);
    results[cat] = result;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Rate limit
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  let allSuccess = true;
  Object.keys(results).forEach((cat) => {
    const result = results[cat];
    const status = result.success ? "✓" : "✗";
    const count = result.success ? `${result.count} products` : result.error;
    console.log(`${status} ${cat.padEnd(15)} ${count}`);
    if (!result.success) allSuccess = false;
  });

  console.log("\n" + (allSuccess ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED"));
  process.exit(allSuccess ? 0 : 1);
}

main();
