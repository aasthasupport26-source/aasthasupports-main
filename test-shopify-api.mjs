import "dotenv/config";
import { GraphQLClient } from "graphql-request";

const shopifyClient = new GraphQLClient(
  `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  },
);

const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          productType
          tags
        }
      }
    }
  }
`;

async function run() {
  try {
    const res = await shopifyClient.request(GET_PRODUCTS_QUERY, { first: 50, query: undefined });
    console.log("All products:");
    res.products.edges.forEach((e) => {
      console.log(
        `- ${e.node.title} | Type: '${e.node.productType}' | Tags: ${JSON.stringify(e.node.tags)}`,
      );
    });
  } catch (e) {
    console.error(e);
  }
}
run();
