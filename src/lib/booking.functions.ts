import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { uuidSchema } from "./uuid-validator";
import { getServerEnv } from "./env";

import { TEMPLES_CATALOG, PUJAS_CATALOG } from "@/data/pooja-catalog";

function generateUUID(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------
// FETCHERS (For Browsing Temples, Pujas, Packages)
// ---------------------------------------------------------

export const getTemples = createServerFn({ method: "GET" }).handler(async () => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
  try {
    const { data, error } = await supabaseAdmin
      .from("temples")
      .select("id, name, city, slug, image_url, active")
      .eq("active", true)
      .order("name");
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.debug("Failed to fetch temples from DB, using fallback", err);
  }
  return TEMPLES_CATALOG;
});

export const getPujasByTemple = createServerFn({ method: "GET" })
  .validator(z.object({ templeId: uuidSchema }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    try {
      const { data: pujas, error } = await supabaseAdmin
        .from("pujas")
        .select("*, packages(*)")
        .eq("temple_id", data.templeId)
        .eq("active", true)
        .order("name");
      if (!error && pujas && pujas.length > 0) return pujas;
    } catch (err) {
      console.debug("Failed to fetch pujas from DB, using fallback", err);
    }

    return PUJAS_CATALOG.filter((p) => p.temple_id === data.templeId);
  });

export const getPujaDetails = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    try {
      const { data: puja, error } = await supabaseAdmin
        .from("pujas")
        .select("*, temple:temples(*), packages(*)")
        .eq("slug", data.slug)
        .single();
      if (!error && puja) return puja;
    } catch (err) {
      console.debug("Failed to fetch puja details from DB, using fallback", err);
    }

    const found = PUJAS_CATALOG.find((p) => p.slug === data.slug);
    if (!found) return null;
    const temple = TEMPLES_CATALOG.find((t) => t.id === found.temple_id);
    return { ...found, temple };
  });

// ---------------------------------------------------------
// BOOKING CREATION & PAYMENT GENERATION
// ---------------------------------------------------------

const SankalpMemberSchema = z.object({
  name: z.string().min(1),
  relation: z.string().optional().or(z.literal("")),
});

const CreateBookingSchema = z.object({
  userId: z.string().optional(),
  templeId: uuidSchema,
  pujaId: uuidSchema,
  packageId: uuidSchema,

  customerName: z.string().min(1),
  phone: z.string().min(7),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  gotra: z.string().optional(),
  dob: z.string().optional(), // YYYY-MM-DD
  birthTime: z.string().optional(), // HH:MM
  birthPlace: z.string().optional(),
  rashi: z.string().optional(),
  nakshatra: z.string().optional(),

  bookingDate: z.string(),
  timeSlot: z.string().optional(),
  specialWish: z.string().optional(),

  videoRequired: z.boolean().default(false),
  photoRequired: z.boolean().default(false),
  liveRequired: z.boolean().default(false),
  prasadRequired: z.boolean().default(false),
  prasadAddress: z.string().optional(),

  members: z.array(SankalpMemberSchema).default([]),
});

export const createPujaBooking = createServerFn({ method: "POST" })
  .validator(CreateBookingSchema)
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "payment");
    if (!rateCheck.allowed) {
      throw new Error(`Too many booking attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    try {
      // 1. Fetch package pricing from database ONLY
      const { data: pkg, error: pkgError } = await (supabaseAdmin as any)
        .from("packages")
        .select("price")
        .eq("id", data.packageId)
        .single();
      
      if (pkgError || !pkg?.price) {
        throw new Error("Package not found or price unavailable");
      }
      
      const baseAmount = parseFloat(pkg.price);
      if (!baseAmount || baseAmount <= 0) throw new Error("Invalid package price");

      // 2. Fetch processing fee (fallback 2% silently)
      let feePercent = 2.0;
      try {
        const { data: setting } = await (supabaseAdmin as any)
          .from("settings")
          .select("value")
          .eq("key", "processing_fee_percent")
          .single();
        if (setting?.value) feePercent = parseFloat(setting.value);
      } catch (_) {
        // settings table may not exist; use default 2%
      }

      const processingFee = Math.round((baseAmount * feePercent) / 100);
      const totalAmount = baseAmount + processingFee;

      // 3. Check availability before creating booking
      const preferredDate = new Date(data.preferredDate);
      const { data: existingBookings, error: availError } = await (supabaseAdmin as any)
        .from("pooja_bookings")
        .select("id")
        .eq("temple_id", data.templeId)
        .eq("preferred_date", preferredDate.toISOString().split('T')[0])
        .eq("preferred_time", data.preferredTime)
        .in("status", ["pending", "confirmed"]);
      
      if (availError) throw new Error("Failed to check availability");
      
      if (existingBookings && existingBookings.length >= 5) {
        throw new Error("This time slot is fully booked. Please select another time.");
      }

      // 4. Generate Booking Number using UUID
      const bookingNumber = `PUJ-${generateUUID()}`;

      // Build sankalp notes combining devotee details
      const sankalpNotes = [
        data.gotra ? `Gotra: ${data.gotra}` : null,
        data.dob ? `DOB: ${data.dob}` : null,
        data.birthTime ? `Birth Time: ${data.birthTime}` : null,
        data.birthPlace ? `Birth Place: ${data.birthPlace}` : null,
        data.rashi ? `Rashi: ${data.rashi}` : null,
        data.nakshatra ? `Nakshatra: ${data.nakshatra}` : null,
        data.members
          ?.filter((m) => m.name)
          .map((m) => `${m.name}${m.relation ? ` (${m.relation})` : ""}`)
          .join(", "),
      ]
        .filter(Boolean)
        .join(" | ");

      const fullNotes = [
        data.specialWish,
        data.address,
        data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      // 4. Create Razorpay Order with booking details encoded in notes
      const env = getServerEnv();
      const rzp = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
      const order = await rzp.orders.create({
        amount: Math.round(totalAmount * 100), // in paise
        currency: "INR",
        receipt: bookingNumber,
        notes: {
          bookingNumber,
          userId: data.userId || "",
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || "",
          gotra: data.gotra || "",
          pujaId: data.pujaId,
          bookingDate: data.bookingDate || "",
          sankalpNotes: sankalpNotes || "",
          fullNotes: fullNotes || "",
          totalAmount: totalAmount.toString(),
        },
      });

      // Return details needed for the frontend Razorpay Checkout
      return {
        success: true,
        bookingPayload: {
          booking_number: bookingNumber,
          user_id: data.userId || null,
          devotee_name: data.customerName,
          phone: data.phone,
          email: data.email || null,
          gotra: data.gotra || null,
          pooja_type: data.pujaId,
          preferred_date: data.bookingDate || null,
          sankalp: sankalpNotes || null,
          notes: fullNotes || null,
          amount: totalAmount,
        },
        bookingNumber,
        razorpayOrderId: order.id,
        amountPaise: Math.round(totalAmount * 100),
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID,
        totalAmount,
        processingFee,
      };
    } catch (error: any) {
      const { captureError } = await import("./sentry");
      captureError(error, { context: "createPujaBooking", userId: data.userId });
      console.error("Booking draft creation failed:", error);
      throw new Error(error.message || "Failed to create booking");
    }
  });

const CreateDirectBookingSchema = z.object({
  userId: z.string().optional(),
  sevaId: uuidSchema,
  customerName: z.string().min(1),
  phone: z.string().min(7),
  sankalpNotes: z.string().optional(),
});

export const createDirectPujaBooking = createServerFn({ method: "POST" })
  .validator(CreateDirectBookingSchema)
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "payment");
    if (!rateCheck.allowed) {
      throw new Error(`Too many booking attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    try {
      // Fetch seva pricing from database ONLY
      const { data: seva, error: sevaError } = await (supabaseAdmin as any)
        .from("sevas")
        .select("name, price")
        .eq("id", data.sevaId)
        .single();
      
      if (sevaError || !seva?.price) {
        throw new Error("Seva not found or price unavailable");
      }
      
      const baseAmount = parseFloat(seva.price);
      if (!baseAmount || baseAmount <= 0) throw new Error("Invalid seva price");

      // Fetch processing fee (fallback 2% silently)
      let feePercent = 2.0;
      try {
        const { data: setting } = await (supabaseAdmin as any)
          .from("settings")
          .select("value")
          .eq("key", "processing_fee_percent")
          .single();
        if (setting?.value) feePercent = parseFloat(setting.value);
      } catch (_) {
        // ignore fallback silently
      }

      const processingFee = Math.round((baseAmount * feePercent) / 100);
      const totalAmount = baseAmount + processingFee;

      const bookingNumber = `DIR-${generateUUID()}`;

      const env = getServerEnv();
      const rzp = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
      const order = await rzp.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: bookingNumber,
        notes: {
          bookingNumber,
          userId: data.userId || "",
          customerName: data.customerName,
          phone: data.phone,
          pooja_type: seva.name,
          sankalpNotes: data.sankalpNotes || "",
          totalAmount: totalAmount.toString(),
        },
      });

      return {
        success: true,
        bookingPayload: {
          booking_number: bookingNumber,
          user_id: data.userId || null,
          devotee_name: data.customerName,
          phone: data.phone,
          pooja_type: seva.name,
          sankalp: data.sankalpNotes || null,
          amount: totalAmount,
        },
        bookingNumber,
        razorpayOrderId: order.id,
        amountPaise: Math.round(totalAmount * 100),
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID,
        totalAmount,
        processingFee,
      };
    } catch (error: any) {
      const { captureError } = await import("./sentry");
      captureError(error, { context: "createDirectPujaBooking", userId: data.userId });
      console.error("Direct booking creation failed:", error);
      throw new Error(error.message || "Failed to create direct booking");
    }
  });

// ---------------------------------------------------------
// PAYMENT VERIFICATION
// ---------------------------------------------------------

const VerifyPaymentSchema = z.object({
  bookingPayload: z.object({
    booking_number: z.string(),
    user_id: z.string().nullable().optional(),
    devotee_name: z.string(),
    phone: z.string(),
    email: z.string().nullable().optional(),
    gotra: z.string().nullable().optional(),
    pooja_type: z.string(),
    preferred_date: z.string().nullable().optional(),
    sankalp: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    amount: z.number(),
  }),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const verifyPujaPayment = createServerFn({ method: "POST" })
  .validator(VerifyPaymentSchema)
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "payment");
    if (!rateCheck.allowed) {
      throw new Error(`Too many verification attempts. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    const env = getServerEnv();

    // Check idempotency - prevent duplicate bookings for same payment
    const { data: existingPayment } = await supabaseAdmin
      .from("booking_payments")
      .select("id, booking_id")
      .eq("gateway_payment_id", data.razorpay_payment_id)
      .single();

    if (existingPayment) {
      return { success: true, bookingId: existingPayment.booking_id };
    }

    // 1. Verify Signature
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      const { logSecurityEvent } = await import("./security-monitor");
      logSecurityEvent({
        type: "invalid_signature",
        severity: "high",
        endpoint: "/api/payment/verify",
        details: { order_id: data.razorpay_order_id, payment_id: data.razorpay_payment_id },
      });
      throw new Error("Invalid payment signature");
    }

    // 2. Fetch payment details from Razorpay to verify amount
    const rzp = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
    const payment = await rzp.payments.fetch(data.razorpay_payment_id);
    
    if (payment.status !== "captured" && payment.status !== "authorized") {
      throw new Error("Payment not successful");
    }
    
    const paidAmount = payment.amount / 100;
    if (Math.abs(paidAmount - data.bookingPayload.amount) > 0.01) {
      throw new Error("Payment amount mismatch");
    }
    
    if (payment.currency !== "INR") {
      throw new Error("Invalid payment currency");
    }

    // 3. Save booking with payment
    const { data: booking, error: bookingErr } = await (supabaseAdmin as any)
      .rpc('create_booking_with_payment', {
        booking_data: {
          ...data.bookingPayload,
          status: "Confirmed",
        },
        payment_data: {
          amount: data.bookingPayload.amount,
          currency: "INR",
          gateway: "razorpay",
          gateway_order_id: data.razorpay_order_id,
          gateway_payment_id: data.razorpay_payment_id,
          gateway_signature: data.razorpay_signature,
          status: "Captured",
        }
      });

    if (bookingErr) {
      console.error("Error inserting confirmed booking:", bookingErr);
      throw new Error("Failed to save booking. Please contact support.");
    }

    return { success: true, bookingId: booking.booking_id };
  });

// ---------------------------------------------------------
// USER BOOKINGS MANAGEMENT
// ---------------------------------------------------------

export const getUserBookings = createServerFn({ method: "GET" })
  .validator(z.object({ 
    accessToken: z.string(),
    limit: z.number().int().min(1).max(50).default(20),
    offset: z.number().int().min(0).default(0)
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    // Verify token and extract userId from authenticated session
    const { verifyAccessToken } = await import("./auth/shopify-customer");
    const customer = await verifyAccessToken({ accessToken: data.accessToken });
    const userId = customer.customer.id;
    
    const { data: bookings, error, count } = await supabaseAdmin
      .from("pooja_bookings")
      .select("id, booking_number, pooja_type, amount, status, created_at, devotee_name, preferred_date", { count: 'exact' })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error("Failed to fetch bookings");
    
    return { bookings: bookings || [], total: count || 0 };
  });
