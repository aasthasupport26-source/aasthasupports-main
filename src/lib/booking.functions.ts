import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { supabaseAdmin } from './auth/shopify-customer';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ---------------------------------------------------------
// FETCHERS (For Browsing Temples, Pujas, Packages)
// ---------------------------------------------------------

export const getTemples = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('temples')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  });

export const getPujasByTemple = createServerFn({ method: 'GET' })
  .validator(z.object({ templeId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { data: pujas, error } = await supabaseAdmin
      .from('pujas')
      .select('*, packages(*)')
      .eq('temple_id', data.templeId)
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return pujas || [];
  });

export const getPujaDetails = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const { data: puja, error } = await supabaseAdmin
      .from('pujas')
      .select('*, temple:temples(*), packages(*)')
      .eq('slug', data.slug)
      .single();
    if (error) throw error;
    return puja;
  });

// ---------------------------------------------------------
// BOOKING CREATION & PAYMENT GENERATION
// ---------------------------------------------------------

const SankalpMemberSchema = z.object({
  name: z.string().min(1),
  relation: z.string().optional().or(z.literal('')),
});

const CreateBookingSchema = z.object({
  userId: z.string().optional(),
  templeId: z.string().uuid(),
  pujaId: z.string().uuid(),
  packageId: z.string().uuid(),
  packageAmount: z.number().optional(), // frontend passes price as fallback
  
  customerName: z.string().min(1),
  phone: z.string().min(7),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
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

export const createPujaBooking = createServerFn({ method: 'POST' })
  .validator(CreateBookingSchema)
  .handler(async ({ data }) => {
    try {
      // 1. Fetch package pricing (fallback to frontend-passed amount if packages table fails)
      let baseAmount = data.packageAmount || 0;
      try {
        const { data: pkg } = await (supabaseAdmin as any)
          .from('packages')
          .select('price')
          .eq('id', data.packageId)
          .single();
        if (pkg?.price) baseAmount = parseFloat(pkg.price);
      } catch (_) {
        // packages table may not exist yet; use packageAmount from frontend
      }

      if (!baseAmount) throw new Error('Could not determine package price. Please try again.');

      // 2. Fetch processing fee (fallback 2% silently)
      let feePercent = 2.0;
      try {
        const { data: setting } = await (supabaseAdmin as any)
          .from('settings')
          .select('value')
          .eq('key', 'processing_fee_percent')
          .single();
        if (setting?.value) feePercent = parseFloat(setting.value);
      } catch (_) {
        // settings table may not exist; use default 2%
      }
      
      const processingFee = Math.round((baseAmount * feePercent) / 100);
      const totalAmount = baseAmount + processingFee;

      // 3. Generate Booking Number
      const year = new Date().getFullYear();
      const bookingTs = Date.now().toString().slice(-6);
      const bookingNumber = `PUJ-${year}-${bookingTs}`;

      // Build sankalp notes combining devotee details
      const sankalpNotes = [
        data.gotra ? `Gotra: ${data.gotra}` : null,
        data.dob ? `DOB: ${data.dob}` : null,
        data.birthTime ? `Birth Time: ${data.birthTime}` : null,
        data.birthPlace ? `Birth Place: ${data.birthPlace}` : null,
        data.rashi ? `Rashi: ${data.rashi}` : null,
        data.nakshatra ? `Nakshatra: ${data.nakshatra}` : null,
        data.members?.filter(m => m.name).map(m => `${m.name}${m.relation ? ` (${m.relation})` : ''}`).join(', '),
      ].filter(Boolean).join(' | ');

      const fullNotes = [data.specialWish, data.address, data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null]
        .filter(Boolean).join(' | ');

      // 4. Create Razorpay Order with booking details encoded in notes
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");

      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rzp.orders.create({
        amount: Math.round(totalAmount * 100), // in paise
        currency: "INR",
        receipt: bookingNumber,
        notes: {
          bookingNumber,
          userId: data.userId || '',
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || '',
          gotra: data.gotra || '',
          pujaId: data.pujaId,
          bookingDate: data.bookingDate || '',
          sankalpNotes: sankalpNotes || '',
          fullNotes: fullNotes || '',
          totalAmount: totalAmount.toString(),
        }
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
        keyId,
        totalAmount,
        processingFee
      };

    } catch (error: any) {
      console.error('Booking draft creation failed:', error);
      throw new Error(error.message || 'Failed to create booking');
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

export const verifyPujaPayment = createServerFn({ method: 'POST' })
  .validator(VerifyPaymentSchema)
  .handler(async ({ data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");

    // 1. Verify Signature
    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Invalid payment signature");
    }

    // 2. Signature valid -> SAVE DETAILS IN SUPABASE POST-PAYMENT CONFIRMATION ONLY
    const { data: booking, error: bookingErr } = await (supabaseAdmin as any)
      .from('pooja_bookings')
      .insert({
        ...data.bookingPayload,
        status: 'Confirmed',
      })
      .select()
      .single();

    if (bookingErr) {
      console.error('Error inserting confirmed booking:', bookingErr);
      throw new Error('Payment verified, but failed to save booking record: ' + bookingErr.message);
    }

    // 3. Try to record payment in booking_payments table
    try {
      await (supabaseAdmin as any)
        .from('booking_payments')
        .insert({
          booking_id: booking.id,
          amount: data.bookingPayload.amount,
          currency: 'INR',
          gateway: 'razorpay',
          gateway_order_id: data.razorpay_order_id,
          gateway_payment_id: data.razorpay_payment_id,
          gateway_signature: data.razorpay_signature,
          status: 'Captured',
        });
    } catch (_) {
      console.warn('booking_payments record skipped');
    }

    return { success: true, bookingId: booking.id };
  });

// ---------------------------------------------------------
// USER BOOKINGS MANAGEMENT
// ---------------------------------------------------------

export const getUserBookings = createServerFn({ method: 'GET' })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { data: bookings, error } = await (supabaseAdmin as any)
      .from('pooja_bookings')
      .select('*')
      .eq('user_id', data.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return bookings || [];
  });
