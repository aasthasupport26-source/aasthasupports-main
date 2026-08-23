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

const TOTAL_COUNT_QUERY = `
  query GetProductCount {
    products(first: 1) {
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          productType
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function getAllProducts() {
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;

  console.log("Fetching ALL products from Shopify...\n");

  while (hasNextPage) {
    pageCount++;
    console.log(`Fetching page ${pageCount}...`);

    const response = await client.request(GET_ALL_PRODUCTS_QUERY, {
      first: 250,
      after: cursor,
    });

    const products = response.products.edges.map((e) => ({
      id: e.node.id,
      title: e.node.title,
      productType: e.node.productType || "EMPTY",
    }));

    allProducts = allProducts.concat(products);
    hasNextPage = response.products.pageInfo.hasNextPage;
    cursor = response.products.pageInfo.endCursor;

    console.log(`  → Got ${products.length} products (Total so far: ${allProducts.length})`);
  }

  return allProducts;
}

async function main() {
  try {
    const allProducts = await getAllProducts();

    console.log("\n" + "=".repeat(60));
    console.log("SHOPIFY PRODUCT COUNT VERIFICATION");
    console.log("=".repeat(60));
    console.log(`\nTotal products in Shopify: ${allProducts.length}`);

    // Group by productType
    const byType = {};
    allProducts.forEach((p) => {
      byType[p.productType] = (byType[p.productType] || 0) + 1;
    });

    console.log("\nBreakdown by productType:");
    Object.keys(byType)
      .sort()
      .forEach((type) => {
        console.log(`  ${type.padEnd(20)} ${byType[type]} products`);
      });

    // Check for products without productType
    const emptyType = allProducts.filter((p) => p.productType === "EMPTY");
    if (emptyType.length > 0) {
      console.log(`\n⚠️  WARNING: ${emptyType.length} product(s) without productType:`);
      emptyType.forEach((p) => {
        console.log(`  - ${p.title}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✓ TOTAL: ${allProducts.length} products in Shopify`);
    console.log(`✓ With productType: ${allProducts.length - emptyType.length}`);
    console.log(`✓ Without productType: ${emptyType.length} (will be filtered)`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
}

main();
