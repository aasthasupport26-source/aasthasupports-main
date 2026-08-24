import fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key) acc[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const query = `
query Products($first: Int!) {
  products(first: $first) {
    edges {
      node {
        title
      }
    }
  }
}
`;

async function run() {
  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    },
    body: JSON.stringify({ query, variables: { first: 250 } })
  });
  const json = await res.json();
  console.log("Total products in store:", json.data.products.edges.length);
}

run();
