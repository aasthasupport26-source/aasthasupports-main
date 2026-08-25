import { supabase } from "@/lib/auth/shopify-customer";
import { z } from "zod";
import { sanitizeSlug } from "@/lib/input-sanitizer";

export const getProduct = {
  name: "get_product",
  title: "Get Product",
  description: "Get detailed information about a specific product by slug",
  inputSchema: {
    slug: z.string().describe("The product slug"),
  },
  handler: async ({ slug }: { slug: string }) => {
    const sanitizedSlug = sanitizeSlug(slug);
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", sanitizedSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    if (!data)
      return {
        content: [{ type: "text" as const, text: `No active product with slug '${sanitizedSlug}'.` }],
        isError: true,
      };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { product: data },
    };
  },
};
