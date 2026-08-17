import { defineMcp } from "@lovable.dev/mcp-js";
import { listCategories } from "./tools/list-categories";
import { listProducts } from "./tools/list-products";
import { getProduct } from "./tools/get-product";

export default defineMcp({
  name: "aastha-support-mcp",
  title: "Aastha Support MCP",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the Aastha Support spiritual store (rudraksha, malas, bracelets, gemstones, yantras, online pooja). Use `list_categories` to see product categories, `list_products` to browse or search the catalog, and `get_product` to fetch full details for a specific product by slug.",
  tools: [listCategories, listProducts, getProduct],
});
