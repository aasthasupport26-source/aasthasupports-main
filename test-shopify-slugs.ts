import { getShopifyProducts } from "./src/lib/shopify.functions";
async function main() {
  const result = await getShopifyProducts({ data: { category: "yantra", limit: 5 } });
  console.log(
    result.products.map((p: any) => ({ name: p.name, slug: p.slug, type: p.productType })),
  );
}
main();
