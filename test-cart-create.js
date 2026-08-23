const domain = "08axwa-1x.myshopify.com";
const accessToken = "2192d0d604875350d58a7156a7b51456";
const apiVersion = "2024-01";

const query = `
  query {
    products(first: 1) {
      edges {
        node {
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

async function run() {
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  const variantId = data.data.products.edges[0].node.variants.edges[0].node.id;
  console.log("Variant ID:", variantId);

  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 5) {
            edges {
              node {
                quantity
              }
            }
          }
        }
        userErrors {
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: [
        {
          merchandiseId: variantId,
          quantity: 1,
        },
      ],
    },
  };

  const mutRes = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const mutData = await mutRes.json();
  console.log(JSON.stringify(mutData, null, 2));
}

run();
