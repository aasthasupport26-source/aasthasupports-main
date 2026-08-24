const { shopifyClient } = require("./src/lib/shopify/client");
const { GET_PRODUCTS_QUERY } = require("./src/lib/shopify/queries");

async function run() {
  try {
    const res = await shopifyClient.request(GET_PRODUCTS_QUERY, {
      first: 5,
      query: "product_type:rudraksha"
    });
    console.log("product_type:", res.products.edges.length);
  } catch(e) {
    console.error("product_type error:", e.message);
  }

  try {
    const res2 = await shopifyClient.request(GET_PRODUCTS_QUERY, {
      first: 5,
      query: "productType:rudraksha"
    });
    console.log("productType:", res2.products.edges.length);
  } catch(e) {
    console.error("productType error:", e.message);
  }
}
run();
