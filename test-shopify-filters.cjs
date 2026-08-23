const { request, gql } = require("graphql-request");

const storefrontUrl = "https://08axwa-1x.myshopify.com/api/2024-01/graphql.json";
const token = "2192d0d604875350d58a7156a7b51456";

const query = gql`
  query GetProducts($query: String!) {
    products(first: 10, query: $query) {
      edges {
        node {
          title
          productType
        }
      }
    }
  }
`;

async function run() {
  const types = ["bracelet", "yantra", "mala", "rudraksha"];
  for (const t of types) {
    const data = await request({
      url: storefrontUrl,
      document: query,
      variables: { query: `product_type:${t}` },
      requestHeaders: { "X-Shopify-Storefront-Access-Token": token },
    });
    console.log(`\n--- ${t} ---`);
    console.log(data.products.edges.map((e) => e.node.title));
  }
}
run().catch(console.error);
