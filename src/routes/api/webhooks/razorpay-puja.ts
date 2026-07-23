import { createServerFn } from '@tanstack/react-start';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/auth/shopify-customer';

/**
 * Razorpay webhook handler for Puja bookings.
 * This is called as a server function from the API route.
 * The actual verification + DB update on payment success is handled inline in
 * verifyPujaPayment (booking.functions.ts), so this webhook acts as a
 * belt-and-suspenders fallback for edge cases where the browser callback fails.
 */
export const handleRazorpayPujaWebhook = createServerFn({ method: 'POST' })
  .handler(async ({ request }: any) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    // Verify signature
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (
      expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      console.warn('[Razorpay Webhook] Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('[Razorpay Webhook] Event:', event.event);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const orderId: string = payment?.order_id;
      const paymentId: string = payment?.id;

      if (orderId && paymentId) {
        // Find the booking payment row - use type assertion to bypass missing generated types
        const tbl = 'booking_payments';
        const { data: rows } = await (supabaseAdmin as any)
          .from(tbl)
          .select('id, booking_id')
          .eq('gateway_order_id', orderId)
          .limit(1);

        const row = rows?.[0] as any;
        if (row) {
          // Update payment to Captured
          await (supabaseAdmin as any)
            .from('booking_payments')
            .update({
              gateway_payment_id: paymentId,
              status: 'Captured',
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.id);

          // Confirm booking if still in draft
          await (supabaseAdmin as any)
            .from('pooja_bookings')
            .update({
              status: 'Confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', row.booking_id)
            .in('status', ['Draft', 'Pending Payment']);
        }
      }
    }

    if (event.event === 'payment.failed') {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        await (supabaseAdmin as any)
          .from('booking_payments')
          .update({ status: 'Failed', updated_at: new Date().toISOString() })
          .eq('gateway_order_id', orderId);
      }
    }

    return new Response('OK', { status: 200 });
  });
