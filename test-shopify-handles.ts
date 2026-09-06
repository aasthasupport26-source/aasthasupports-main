import { shopifyClient } from "./src/lib/shopify/client";
import { GET_PRODUCTS_QUERY } from "./src/lib/shopify/queries";
async function main() {
  const res = await shopifyClient.request(GET_PRODUCTS_QUERY, { first: 50 });
  const products = res.products.edges.map((e: any) => ({
    title: e.node.title,
    handle: e.node.handle,
    type: e.node.productType,
  }));
  console.log(
    "Yantra products:",
    products.filter(
      (p: any) =>
        p.type.toLowerCase().includes("yantra") || p.title.toLowerCase().includes("yantra"),
    ),
  );
}
main();
