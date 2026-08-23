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
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
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
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function testFetch(category) {
  console.log(`\n=== Testing category: ${category} ===`);

  let queryFilter = undefined;
  if (category && category !== "all") {
    let productType = category;
    if (productType === "bracelets") productType = "bracelet";
    if (productType === "gemstones") productType = "gemstone";
    queryFilter = `product_type:${productType}`;
  }

  console.log(`Query filter: ${queryFilter || "none (all products)"}`);

  try {
    const response = await client.request(GET_PRODUCTS_QUERY, {
      first: 250,
      after: null,
      query: queryFilter,
    });

    const products = response.products.edges.map((edge) => ({
      title: edge.node.title,
      productType: edge.node.productType,
      tags: edge.node.tags,
      handle: edge.node.handle,
    }));

    console.log(`Found ${products.length} products`);
    console.log("\nProduct types found:");
    const types = {};
    products.forEach((p) => {
      types[p.productType || "EMPTY"] = (types[p.productType || "EMPTY"] || 0) + 1;
    });
    console.log(JSON.stringify(types, null, 2));

    console.log("\nFirst 5 products:");
    products.slice(0, 5).forEach((p) => {
      console.log(`  - ${p.title} (type: ${p.productType || "EMPTY"})`);
    });

    return products;
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

async function main() {
  try {
    // Test all products
    await testFetch("all");

    // Test each category
    await testFetch("rudraksha");
    await testFetch("mala");
    await testFetch("bracelet");
    await testFetch("gemstone");
    await testFetch("yantra");
  } catch (error) {
    console.error("\nFATAL ERROR:", error);
    process.exit(1);
  }
}

main();
