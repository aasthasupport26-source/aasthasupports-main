import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sanitizeLimit, sanitizeOffset } from "./db-validator";
import { uuidSchema } from "./uuid-validator";

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
  .validator(z.object({ 
    accessToken: z.string(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0)
  }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);

    const { data: bookings, error, count } = await (supabaseAdmin as any)
      .from("pooja_bookings")
      .select("*", { count: 'exact' })
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
  .validator(z.object({ 
    accessToken: z.string(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0)
  }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { data: customers, error, count } = await supabaseAdmin
      .from("users")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      throw new Error("Failed to fetch customers");
    }

    return { customers: customers || [], total: count || 0 };
  });



/**
 * Update booking status - admin only
 */
export const updateBookingStatus = createServerFn({ method: "POST" })
  .validator(z.object({ 
    bookingId: z.string(), 
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
    accessToken: z.string()
  }))
  .handler(async ({ data }) => {
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    
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
 * PUJAS MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminTemples = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string() }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    
    const { data: temples, error } = await supabaseAdmin
      .from("temples")
      .select("id, name, city, state, description, active, created_at, updated_at")
      .order("name");
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    
    const adminEmail = await requireAdmin(data.accessToken);
    const { image_url, ...insertData } = data;
    const { error } = await supabaseAdmin.from("temples").insert(insertData);
    if (error) {
      console.error("Failed to create temple:", error);
      throw new Error("Failed to create temple. Please try again.");
    }
    
    await logAdminAction({
      admin_email: adminEmail,
      action: "create",
      resource_type: "temple",
      details: { name: data.name, city: data.city },
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      user_agent: request.headers.get("user-agent") || undefined,
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { id, image_url, ...updateData } = data;
    const { error } = await supabaseAdmin.from("temples").update(updateData).eq("id", id);
    if (error) {
      console.error("Failed to update temple:", error);
      throw new Error("Failed to update temple. Please try again.");
    }
    
    await logAdminAction({
      admin_email: "admin",
      action: "update_temple",
      resource_type: "temple",
      resource_id: id,
      changes: updateData,
    });
    
    return { success: true };
  });

/**
 * ---------------------------------------------------------
 * PUJAS MANAGEMENT
 * ---------------------------------------------------------
 */
export const getAdminPujas = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), templeId: uuidSchema.optional() }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin.from("pujas").insert(data);
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { id, ...updateData } = data;
    const { error } = await supabaseAdmin.from("pujas").update(updateData).eq("id", id);
    if (error) {
      console.error("Failed to update puja:", error);
      throw new Error("Failed to update puja. Please try again.");
    }
    return { success: true };
  });

export const deletePuja = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin.from("packages").insert(data);
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
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    
    const { logAdminAction } = await import("./admin-audit");
    
    const { id, image_url, ...updateData } = data;
    const { error } = await supabaseAdmin.from("temples").update(updateData).eq("id", id);
    if (error) {
      console.error("Failed to update temple:", error);
      throw new Error("Failed to update temple. Please try again.");
    }
    
    await logAdminAction({
      adminEmail: "admin",
      action: "update_temple",
      resourceType: "temple",
      resourceId: id,
      changes: updateData,
    });
    
    return { success: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string(), id: uuidSchema }))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "admin");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }
    
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    requireAdmin(data.accessToken);
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) {
      console.error("Failed to delete package:", error);
      throw new Error("Failed to delete package. Please try again.");
    }
    return { success: true };
  });
