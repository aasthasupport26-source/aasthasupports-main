import { shopifyClient } from "./src/lib/shopify/client.js";
import { GET_PRODUCTS_QUERY } from "./src/lib/shopify/queries.js";

async function run() {
  const res = await shopifyClient.request(GET_PRODUCTS_QUERY, {
    first: 250,
    query: "productType:rudraksha"
  });
  
  const groups = {};
  res.products.edges.forEach(edge => {
    const node = edge.node;
    const metafieldsMap = new Map(
      node.metafields?.map((m: any) => [m?.key, m?.value]) || []
    );
    const cat = node.productType || metafieldsMap.get("category") || "Uncategorized";
    if (!groups[cat]) groups[cat] = 0;
    groups[cat]++;
  });
  console.log("Groups:", groups);
}
run();
