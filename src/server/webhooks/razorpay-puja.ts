import crypto from "crypto";
import { supabaseAdmin } from "@/lib/auth/shopify-customer";

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
    console.warn("[Razorpay Webhook] Invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
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
        await (supabaseAdmin as any)
          .from("booking_payments")
          .update({ status: "Failed", updated_at: new Date().toISOString() })
          .eq("gateway_order_id", orderId);
      }
    }
  } catch (error) {
    console.error("[Razorpay Webhook] Processing error:", error);
    // Return 200 to avoid infinite retries
    return new Response("Processed with errors", { status: 200 });
  }

  return new Response("OK", { status: 200 });
}
