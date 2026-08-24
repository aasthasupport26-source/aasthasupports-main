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
      variables: { first: 15, query: "product_type:rudraksha" }
    })
  });
  const json = await res.json();
  console.log("product_type:rudraksha =>", json.data.products.edges.length, "items");
  console.log(json.data.products.edges.map(e => e.node.productType).join(", "));
  
  const res2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: { first: 15, query: "product_type:Rudraksha" }
    })
  });
  const json2 = await res2.json();
  console.log("product_type:Rudraksha =>", json2.data.products.edges.length, "items");

  // What about no product type?
  const res3 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: { first: 15, query: "product_type:rudraksh" } // partial?
    })
  });
  const json3 = await res3.json();
  console.log("product_type:rudraksh =>", json3.data.products.edges.length, "items");
}

run();
