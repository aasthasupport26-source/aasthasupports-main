import { shopifyClient } from "./src/lib/shopify/client.js";
import { GET_PRODUCTS_QUERY } from "./src/lib/shopify/queries.js";
import { config } from "dotenv";
config();
async function run() {
  const res = await shopifyClient.request(GET_PRODUCTS_QUERY, {
    first: 10,
    query: "product_type:rudraksha"
  });
  console.log("product_type:rudraksha =>", res.products.edges.length);

  const res2 = await shopifyClient.request(GET_PRODUCTS_QUERY, {
    first: 10,
    query: "productType:rudraksha"
  });
  console.log("productType:rudraksha =>", res2.products.edges.length);
}
run();
