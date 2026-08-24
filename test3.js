import fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key) acc[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const query = `
query Products($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node {
        title
        productType
        metafields(identifiers: [{namespace: "custom", key: "category"}]) {
          value
        }
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
    body: JSON.stringify({
      query,
      variables: { first: 50, query: "product_type:rudraksha" }
    })
  });
  const json = await res.json();
  const cats = Array.from(new Set(json.data.products.edges.map(e => e.node.metafields[0]?.value || 'NONE')));
  console.log("Categories for rudraksha:", cats);
}

run();
