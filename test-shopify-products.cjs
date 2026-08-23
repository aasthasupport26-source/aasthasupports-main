const { request, gql } = require("graphql-request");

const storefrontUrl = "https://08axwa-1x.myshopify.com/api/2024-01/graphql.json";
const token = "2192d0d604875350d58a7156a7b51456";

const query = gql`
  {
    products(first: 50) {
      edges {
        node {
          title
          productType
          tags
        }
      }
    }
  }
`;

request({
  url: storefrontUrl,
  document: query,
  requestHeaders: {
    "X-Shopify-Storefront-Access-Token": token,
  },
})
  .then((data) => {
    console.log(
      JSON.stringify(
        data.products.edges.map((e) => e.node),
        null,
        2,
      ),
    );
  })
  .catch(console.error);
