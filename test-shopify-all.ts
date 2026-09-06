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
  const products = res.products.edges.map((e: any) => ({
    title: e.node.title,
    handle: e.node.handle,
    type: e.node.productType,
    cat: e.node.metafields?.find((m: any) => m && m.key === "category")?.value,
  }));
  writeFileSync("all-products.json", JSON.stringify(products, null, 2));
}
main();
