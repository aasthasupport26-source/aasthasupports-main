import crypto from "crypto";
import { supabaseAdmin } from "@/lib/auth/shopify-customer";
import { captureError, captureMessage } from "@/lib/sentry";

/**
 * Razorpay webhook handler for Puja bookings.
 *
 * Register this webhook URL in Razorpay Dashboard → Webhooks:
 *   POST https://www.aasthasupports.com/api/webhooks/razorpay-puja
 *
 * Events to subscribe: payment.captured, payment.failed
 */
export async function handleRazorpayPujaWebhook(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  // Verify HMAC-SHA256 signature
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    console.error("[Razorpay Webhook] Invalid signature - potential security issue");
    captureMessage("[Razorpay Webhook] Invalid signature attempt", "warning");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('[Razorpay Webhook] Invalid JSON:', err instanceof Error ? err.message : 'Parse error');
    return new Response("Invalid JSON", { status: 400 });
  }

  // Validate webhook payload structure
  if (!event.event || typeof event.event !== 'string') {
    return new Response("Invalid event structure", { status: 400 });
  }

  if (!event.payload?.payment?.entity) {
    return new Response("Invalid payload structure", { status: 400 });
  }

  // Database-backed replay protection
  const eventId = event.id || `${event.event}-${Date.now()}`;
  
  const { data: existing } = await supabaseAdmin
    .from("webhook_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    console.info("[Razorpay Webhook] Duplicate event ignored:", eventId);
    return new Response("OK", { status: 200 });
  }

  // Insert event atomically
  const { error: insertError } = await supabaseAdmin
    .from("webhook_events")
    .insert({ 
      event_id: eventId, 
      event_type: event.event,
      processed_at: new Date().toISOString() 
    });

  if (insertError?.code === '23505') {
    console.info("[Razorpay Webhook] Duplicate event (race condition):", eventId);
    return new Response("OK", { status: 200 });
  }

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const orderId: string = payment?.order_id;
      const paymentId: string = payment?.id;

      if (orderId && paymentId) {
        const { data: rows } = await (supabaseAdmin as any)
          .from("booking_payments")
          .select("id, booking_id")
          .eq("gateway_order_id", orderId)
          .limit(1);

        const row = rows?.[0] as any;
        if (row) {
          await (supabaseAdmin as any)
            .from("booking_payments")
            .update({
              gateway_payment_id: paymentId,
              status: "Captured",
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);

          await (supabaseAdmin as any)
            .from("pooja_bookings")
            .update({
              status: "Confirmed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.booking_id)
            .in("status", ["Draft", "Pending Payment"]);
        }
      }
    }

    if (event.event === "payment.failed") {
      const orderId = event.payload?.payment?.entity?.order_id;
      if (orderId) {
        console.error("[Razorpay Webhook] Payment failed for order:", orderId.substring(0, 8) + "...");
        captureMessage(`Payment failed for order`, "error");
        await (supabaseAdmin as any)
          .from("booking_payments")
          .update({ status: "Failed", updated_at: new Date().toISOString() })
          .eq("gateway_order_id", orderId);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[Razorpay Webhook] Processing error");
    captureError(error as Error, { context: "razorpay_webhook", eventType: event?.event });
    return new Response("Processing failed", { status: 500 });
  }
}
