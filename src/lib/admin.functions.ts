import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { sanitizeLimit, sanitizeOffset } from "./db-validator";
import { uuidSchema } from "./uuid-validator";
import { logAdminAction } from "./admin-audit";

const requireAdmin = async (token: string) => {
  const { verifyAdminToken, isAdminToken } = await import("./admin-guard");
  if (!isAdminToken(token)) throw new Error("Unauthorized");
  const payload = await verifyAdminToken(token);
  return payload.email;
};

/**
 * Get all bookings - admin only
 */
export const getAdminBookings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const {
      data: bookings,
      error,
      count,
    } = await (supabaseAdmin as any)
      .from("pooja_bookings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw new Error("Failed to fetch bookings");
    }

    return { bookings: bookings || [], total: count || 0 };
  });

/**
 * Get all customers - admin only
 */
export const getAdminCustomers = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    // Never select password_hash — only the fields the admin UI renders
    const {
      data: customers,
      error,
      count,
    } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, phone, role, is_admin, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw new Error("Failed to fetch customers");
    }

    return { customers: customers || [], total: count || 0 };
  });

/**
 * Get all users with roles - admin only
 */
export const getAdminUsers = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, phone, role, is_admin, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to fetch users");
    return users || [];
  });

/**
 * Update a user's role - admin only
 */
export const updateUserRole = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      userId: uuidSchema,
      role: z.enum(["admin", "staff", "customer"]),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    const adminEmail = await requireAdmin(data.accessToken);

    const { error } = await supabaseAdmin
      .from("users")
      .update({ role: data.role, is_admin: data.role === "admin" } as any)
      .eq("id", data.userId);
    if (error) throw new Error("Failed to update user role");

    const { logAdminAction } = await import("./admin-audit");
    await logAdminAction({
      admin_email: adminEmail,
      action: "update_user_role",
      resource_type: "user",
      resource_id: data.userId,
      changes: { role: data.role },
    });

    return { success: true };
  });

/**
 * Get contact submissions (leads) - admin only
 */
export const getAdminLeads = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const { data: leads, error } = await supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Failed to fetch leads");
    return leads || [];
  });

/**
 * Update a contact submission status - admin only
 */
export const updateLeadStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      id: uuidSchema,
      status: z.enum(["new", "contacted", "resolved"]),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const adminEmail = await requireAdmin(data.accessToken);

    const { error } = await supabaseAdmin
      .from("contact_submissions")
      .update({ status: data.status } as any)
      .eq("id", data.id);
    if (error) throw new Error("Failed to update lead status");

    const { logAdminAction } = await import("./admin-audit");
    await logAdminAction({
      admin_email: adminEmail,
      action: "update_lead_status",
      resource_type: "contact_submission",
      resource_id: data.id,
      changes: { status: data.status },
    });

    return { success: true };
  });

/**
 * Delete a contact submission - admin only
 */
export const deleteLead = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const adminEmail = await requireAdmin(data.accessToken);

    const { error } = await supabaseAdmin.from("contact_submissions").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete lead");

    const { logAdminAction } = await import("./admin-audit");
    await logAdminAction({
      admin_email: adminEmail,
      action: "delete_lead",
      resource_type: "contact_submission",
      resource_id: data.id,
    });

    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * CATEGORIES MANAGEMENT (admin only)
 * ---------------------------------------------------------
 */
const CategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase kebab-case"),
  name: z.string().min(1).max(120),
  parent_slug: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  image_url: z.string().max(500).optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(9999),
  is_active: z.boolean(),
});

export const getAdminCategories = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw new Error("Failed to fetch categories");
    return categories || [];
  });

export const saveCategory = createServerFn({ method: "POST" })
  .validator(CategorySchema.extend({ accessToken: z.string(), id: uuidSchema.optional() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    const adminEmail = await requireAdmin(data.accessToken);

    const { accessToken, id, ...rest } = data;
    const payload = {
      ...rest,
      parent_slug: rest.parent_slug || null,
      description: rest.description || null,
      image_url: rest.image_url || null,
    };

    let error;
    if (id) {
      ({ error } = await supabaseAdmin.from("categories").update(payload).eq("id", id));
    } else {
      ({ error } = await supabaseAdmin.from("categories").insert(payload));
    }
    if (error) {
      console.error("Failed to save category:", error);
      throw new Error("Failed to save category. Please try again.");
    }

    const { logAdminAction } = await import("./admin-audit");
    await logAdminAction({
      admin_email: adminEmail,
      action: id ? "update_category" : "create_category",
      resource_type: "category",
      resource_id: id || payload.slug,
      changes: payload,
    });

    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const adminEmail = await requireAdmin(data.accessToken);

    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error("Failed to delete category");

    const { logAdminAction } = await import("./admin-audit");
    await logAdminAction({
      admin_email: adminEmail,
      action: "delete_category",
      resource_type: "category",
      resource_id: data.id,
    });

    return { success: true };
  });

/**
 * Update booking status - admin only
 */
export const updateBookingStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      bookingId: z.string(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
      accessToken: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const adminEmail = await requireAdmin(data.accessToken);

    const { logAdminAction } = await import("./admin-audit");

    const { data: booking, error } = await supabaseAdmin
      .from("pooja_bookings")
      .update({ status: data.status })
      .eq("id", data.bookingId)
      .select()
      .single();

    if (error) throw new Error("Failed to update booking status");

    await logAdminAction({
      admin_email: adminEmail,
      action: "update_booking_status",
      resource_type: "pooja_booking",
      resource_id: data.bookingId,
      changes: { status: data.status },
    });

    return { success: true };
  });

export const deleteTemple = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const { logAdminAction } = await import("./admin-audit");

    const { error } = await supabaseAdmin.from("temples").delete().eq("id", data.id);
    if (error) {
      console.error("Failed to delete temple:", error);
      throw new Error("Failed to delete temple. Please try again.");
    }

    await logAdminAction({
      admin_email: "admin",
      action: "delete_temple",
      resource_type: "temple",
      resource_id: data.id,
    });

    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * TEMPLES MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminTemples = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);

    const { data: temples, error } = await supabaseAdmin.from("temples").select("*").order("name");
    if (error) throw new Error("Failed to fetch temples");
    return temples || [];
  });

export const createTemple = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      name: z.string(),
      city: z.string(),
      state: z.string().optional(),
      description: z.string().optional(),
      image_url: z.string().url().optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    const adminEmail = await requireAdmin(data.accessToken);
    const { accessToken, ...insertData } = data;
    const { error } = await supabaseAdmin.from("temples").insert(insertData);
    if (error) {
      console.error("Failed to create temple:", error);
      throw new Error("Failed to create temple. Please try again.");
    }

    await logAdminAction({
      admin_email: adminEmail,
      action: "create",
      resource_type: "temple",
      resource_id: insertData.name,
      changes: insertData,
    });

    return { success: true };
  });

export const updateTemple = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      id: uuidSchema,
      name: z.string(),
      city: z.string(),
      state: z.string().optional(),
      description: z.string().optional(),
      image_url: z.string().url().optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { id, accessToken, ...updateData } = data;
    const { error } = await supabaseAdmin.from("temples").update(updateData).eq("id", id);
    if (error) {
      console.error("Failed to update temple:", error);
      throw new Error("Failed to update temple. Please try again.");
    }
    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * PUJAS MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminPujas = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), templeId: uuidSchema.optional() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    let query = supabaseAdmin.from("pujas").select("*, temple:temples(name)").order("name");
    if (data.templeId) query = query.eq("temple_id", data.templeId);

    const { data: pujas, error } = await query;
    if (error) throw new Error("Failed to fetch pujas");
    return pujas || [];
  });

export const createPuja = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      temple_id: uuidSchema,
      slug: z.string(),
      name: z.string(),
      description: z.string().optional(),
      image_url: z.string().url().optional(),
      duration_minutes: z.number().int().min(1).max(1440).optional(),
      benefits: z.array(z.string().max(500)).max(20).optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { accessToken, benefits, ...rest } = data;
    const insertData = {
      ...rest,
      benefits: benefits || null,
      base_price: 0,
    };
    const { error } = await supabaseAdmin.from("pujas").insert(insertData as any);
    if (error) {
      console.error("Failed to create puja:", error);
      throw new Error("Failed to create puja. Please try again.");
    }
    return { success: true };
  });

export const updatePuja = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      id: uuidSchema,
      temple_id: uuidSchema,
      slug: z.string(),
      name: z.string(),
      description: z.string().optional(),
      image_url: z.string().url().optional(),
      duration_minutes: z.number().int().min(1).max(1440).optional(),
      benefits: z.array(z.string().max(500)).max(20).optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { id, accessToken, benefits, ...rest } = data;
    const updateData = {
      ...rest,
      benefits: benefits || null,
    };
    const { error } = await supabaseAdmin
      .from("pujas")
      .update(updateData as any)
      .eq("id", id);
    if (error) {
      console.error("Failed to update puja:", error);
      throw new Error("Failed to update puja. Please try again.");
    }
    return { success: true };
  });

export const deletePuja = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin.from("pujas").delete().eq("id", data.id);
    if (error) {
      console.error("Failed to delete puja:", error);
      throw new Error("Failed to delete puja. Please try again.");
    }
    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * PACKAGES MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminPackages = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), pujaId: uuidSchema.optional() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    let query = supabaseAdmin.from("packages").select("*, puja:pujas(name)").order("price");
    if (data.pujaId) query = query.eq("puja_id", data.pujaId);

    const { data: packages, error } = await query;
    if (error) throw new Error("Failed to fetch packages");
    return packages || [];
  });

export const createPackage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      puja_id: uuidSchema,
      name: z.string(),
      description: z.string().optional(),
      price: z.number().positive().max(1000000),
      includes: z.array(z.string().max(200)).max(50).optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { accessToken, ...insertData } = data;
    const { error } = await supabaseAdmin.from("packages").insert(insertData);
    if (error) {
      console.error("Failed to create package:", error);
      throw new Error("Failed to create package. Please try again.");
    }
    return { success: true };
  });

export const updatePackage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      accessToken: z.string(),
      id: uuidSchema,
      puja_id: uuidSchema,
      name: z.string(),
      description: z.string().optional(),
      price: z.number().positive().max(1000000),
      includes: z.array(z.string().max(200)).max(50).optional(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    const adminEmail = await requireAdmin(data.accessToken);

    const { logAdminAction } = await import("./admin-audit");

    const { id, accessToken, ...updateData } = data;
    const { error } = await supabaseAdmin.from("packages").update(updateData).eq("id", id);
    if (error) {
      console.error("Failed to update package:", error);
      throw new Error("Failed to update package. Please try again.");
    }

    await logAdminAction({
      admin_email: adminEmail,
      action: "update",
      resource_type: "package",
      resource_id: id,
      changes: updateData,
    });

    return { success: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    await requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) {
      console.error("Failed to delete package:", error);
      throw new Error("Failed to delete package. Please try again.");
    }
    return { success: true };
  });
