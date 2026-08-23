const { request, gql } = require("graphql-request");

const storefrontUrl = "https://08axwa-1x.myshopify.com/api/2024-01/graphql.json";
const token = "2192d0d604875350d58a7156a7b51456";

const query = gql`
  query GetProducts($query: String!) {
    products(first: 50, query: $query) {
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
  const q = "product_type:bracelet OR tag:bracelet OR title:bracelet*";
  const data = await request({
    url: storefrontUrl,
    document: query,
    variables: { query: q },
    requestHeaders: { "X-Shopify-Storefront-Access-Token": token },
  });
  console.log(data.products.edges.map((e) => e.node.title));
}
run().catch(console.error);
