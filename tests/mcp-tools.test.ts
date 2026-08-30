import { describe, it, expect, vi } from "vitest";
import { listProducts } from "@/lib/mcp/tools/list-products";
import { getProduct } from "@/lib/mcp/tools/get-product";
import { listCategories } from "@/lib/mcp/tools/list-categories";

vi.mock("@/lib/auth/shopify-customer", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            order: vi.fn(() => ({
              order: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            }))
          })),
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        order: vi.fn(() => ({
          order: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }
}));

describe("MCP tools", () => {
  describe("listProducts", () => {
    it("has correct schema", () => {
      expect(listProducts.name).toBe("list_products");
      expect(listProducts.inputSchema).toBeDefined();
    });

    it("returns products list", async () => {
      const result = await listProducts.handler({ limit: 10 });
      expect(result).toHaveProperty("content");
    });
  });

  describe("getProduct", () => {
    it("has correct schema", () => {
      expect(getProduct.name).toBe("get_product");
      expect(getProduct.inputSchema.slug).toBeDefined();
    });

    it("returns product by slug", async () => {
      const result = await getProduct.handler({ slug: "test-product" });
      expect(result).toHaveProperty("content");
    });
  });

  describe("listCategories", () => {
    it("has correct schema", () => {
      expect(listCategories.name).toBe("list_categories");
      expect(listCategories.inputSchema).toBeDefined();
    });

    it("returns categories list", async () => {
      const result = await listCategories.handler();
      expect(result).toHaveProperty("content");
    });
  });
});
