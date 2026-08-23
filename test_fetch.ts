import { getShopifyProducts } from "./src/lib/shopify.functions";

async function run() {
  const products = await getShopifyProducts({ limit: 50 });
  console.log("Fetched products count:", products.length);
  if (products.length > 0) {
    console.log("First product name:", products[0].name);
  }
}
run();
