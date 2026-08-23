import { supabase } from "@/lib/auth/shopify-customer";
import { sanitizeSlug } from "@/lib/input-sanitizer";

export const getProduct = {
  name: "get_product",
  description: "Get detailed information about a specific product by slug",
  inputSchema: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        description: "Product slug (URL-friendly identifier)",
      },
    },
    required: ["slug"],
  },
  handler: async ({ slug }: { slug: string }) => {
    const sanitizedSlug = sanitizeSlug(slug);
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", sanitizedSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data)
      return {
        content: [{ type: "text", text: `No active product with slug '${sanitizedSlug}'.` }],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
};
