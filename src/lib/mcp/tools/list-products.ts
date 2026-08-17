import { supabase } from "@/lib/auth/shopify-customer";
import { sanitizeSlug } from "@/lib/input-sanitizer";

export const listProducts = {
  name: "list_products",
  description: "List all active products with optional category filter",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "Filter by category slug (optional)",
      },
      limit: {
        type: "number",
        description: "Maximum number of products to return (default: 50)",
      },
    },
  },
  handler: async ({ category, limit = 50 }: { category?: string; limit?: number }) => {
    const sanitizedLimit = Math.min(Math.max(1, limit), 100);
    
    let q = supabase
      .from("products")
      .select(
        "slug,name,category_slug,price,mrp,stock,short_description,image_url,is_featured,certified",
      )
      .eq("is_active", true);
    
    if (category) {
      const sanitizedCategory = sanitizeSlug(category);
      q = q.eq("category_slug", sanitizedCategory);
    }
    
    q = q
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true })
      .range(0, sanitizedLimit - 1);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [], limit: sanitizedLimit },
    };
  },
};

export default listProducts;