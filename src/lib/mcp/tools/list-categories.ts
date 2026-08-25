import { supabase } from "@/lib/auth/shopify-customer";

export const listCategories = {
  name: "list_categories",
  title: "List Categories",
  description: "List all active product categories",
  inputSchema: {},
  handler: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("slug,name,description,image_url,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) return { content: [{ type: "text" as const, text: error.message }], isError: true };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      structuredContent: { categories: data ?? [] },
    };
  },
};
