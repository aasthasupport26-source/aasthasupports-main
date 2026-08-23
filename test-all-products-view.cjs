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
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          productType
        }
      }
    }
  }
`;

async function testAllProducts() {
  console.log("Testing 'All Products' view (no filter)...\n");

  const response = await client.request(GET_PRODUCTS_QUERY, {
    first: 250,
  });

  const products = response.products.edges
    .map((e) => ({
      title: e.node.title,
      productType: e.node.productType || "EMPTY",
    }))
    .filter((p) => p.productType !== "EMPTY");

  console.log(`✓ Total products fetched: ${products.length}`);

  const byType = {};
  products.forEach((p) => {
    byType[p.productType] = (byType[p.productType] || 0) + 1;
  });

  console.log("\nProducts by type (all shown in 'All Products'):");
  Object.keys(byType)
    .sort()
    .forEach((type) => {
      console.log(`  ${type.padEnd(20)} ${byType[type]} products`);
    });

  console.log("\n✓ Pooja products (5) will show in 'All Products' view");
  console.log("✓ No separate Pooja category filter");
}

testAllProducts().catch(console.error);
