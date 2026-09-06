import { readFileSync } from "fs";
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
  const gemProducts = products.filter(
    (p: any) =>
      p.title.toLowerCase().includes("gem") ||
      p.type.toLowerCase().includes("gem") ||
      p.title.toLowerCase().includes("sapphire") ||
      p.title.toLowerCase().includes("ruby") ||
      p.title.toLowerCase().includes("ratna") ||
      p.title.toLowerCase().includes("pukhraj") ||
      p.title.toLowerCase().includes("neelam"),
  );
  console.log("Found gem-like products:", gemProducts);
}
main();
