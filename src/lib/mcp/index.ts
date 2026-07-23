import { defineMcp } from "@lovable.dev/mcp-js";
import listCategoriesTool from "./tools/list-categories";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";

export default defineMcp({
  name: "aastha-support-mcp",
  title: "Aastha Support MCP",
  version: "0.1.0",
  instructions:
    "Public read-only tools for the Aastha Support spiritual store (rudraksha, malas, bracelets, gemstones, yantras, online pooja). Use `list_categories` to see product categories, `list_products` to browse or search the catalog, and `get_product` to fetch full details for a specific product by slug.",
  tools: [listCategoriesTool, listProductsTool, getProductTool],
});
