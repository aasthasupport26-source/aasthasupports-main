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
  const types = Array.from(new Set(json.data.products.edges.map(e => e.node.productType)));
  console.log("product_type:rudraksha =>", json.data.products.edges.length, "items");
  console.log("Unique product types returned:", types);

  const res2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: { first: 50, query: "product_type:mala" }
    })
  });
  const json2 = await res2.json();
  const types2 = Array.from(new Set(json2.data.products.edges.map(e => e.node.productType)));
  console.log("\nproduct_type:mala =>", json2.data.products.edges.length, "items");
  console.log("Unique product types returned:", types2);
  
}

run();
