import { supabase } from "@/lib/auth/shopify-customer";
import { z } from "zod";
import { sanitizeSlug } from "@/lib/input-sanitizer";

export const listProducts = {
  name: "list_products",
  title: "List Products",
  description: "List all active products with optional category filter",
  inputSchema: {
    category: z.string().optional().describe("Filter by category slug"),
    limit: z.number().optional().describe("Maximum number of products to return"),
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
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [], limit: sanitizedLimit },
    };
  },
};

export default listProducts;