import { supabase } from "@/lib/auth/shopify-customer";

export const listCategories = {
  name: "list_categories",
  description: "List all active product categories",
  inputSchema: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("slug,name,description,image_url,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { categories: data ?? [] },
    };
  },
};
