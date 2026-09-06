import { readFileSync, writeFileSync } from "fs";
const envFile = readFileSync(".env", "utf-8");
envFile.split("\n").forEach((line) => {
  const [key, val] = line.split("=");
  if (key && val) process.env[key.trim()] = val.trim().replace(/^"|"$/g, "");
});
import { shopifyClient } from "./src/lib/shopify/client";
import { GET_PRODUCTS_QUERY } from "./src/lib/shopify/queries";
async function main() {
  const res = await shopifyClient.request(GET_PRODUCTS_QUERY, { first: 250 });
  console.log("Has next page?", res.products.pageInfo.hasNextPage);
  console.log("Total products fetched:", res.products.edges.length);
}
main();
