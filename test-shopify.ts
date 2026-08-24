import { config } from "dotenv";
config({ path: ".env" });
import { shopifyClient } from "./src/lib/shopify/client";
import { GET_PRODUCTS_QUERY } from "./src/lib/shopify/queries";

async function run() {
  try {
    const res = await shopifyClient.request(GET_PRODUCTS_QUERY, {
      first: 5,
      query: "productType:rudraksha"
    });
    console.log("productType:", res.products.edges.length, "items found.");
    if (res.products.edges.length > 0) {
      console.log("First item:", res.products.edges[0].node.title);
    }
  } catch(e) {
    console.error("productType error:", e.message);
  }
}
run();
