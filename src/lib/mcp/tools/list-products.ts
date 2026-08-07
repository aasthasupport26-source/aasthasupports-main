import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List active products in the Aastha Support catalog. Optionally filter by category slug, featured flag, or search text; results are paginated.",
  inputSchema: {
    category_slug: z
      .string()
      .optional()
      .describe("Filter by category slug (e.g. 'rudraksha', 'mala')."),
    featured: z.boolean().optional().describe("If true, only return featured products."),
    search: z.string().optional().describe("Case-insensitive substring match on product name."),
    limit: z.number().int().min(1).max(50).default(20),
    offset: z.number().int().min(0).default(0),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_slug, featured, search, limit, offset }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    let q = supabase
      .from("products")
      .select(
        "slug,name,category_slug,price,mrp,stock,short_description,image_url,is_featured,certified",
      )
      .eq("is_active", true);
    if (category_slug) q = q.eq("category_slug", category_slug);
    if (featured) q = q.eq("is_featured", true);
    if (search) q = q.ilike("name", `%${search}%`);
    q = q
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [], limit, offset },
    };
  },
});
