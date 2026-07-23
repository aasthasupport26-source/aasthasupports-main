import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CartItemSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  price: z.number().int().min(1).max(10_000_000),
  quantity: z.number().int().min(1).max(50),
});

const AddressSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().min(7).max(20),
  address: z.string().min(5).max(500),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  pincode: z.string().min(4).max(12),
  notes: z.string().max(500).optional().or(z.literal("")),
});

const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(50),
  shipping: z.number().int().min(0).max(100000),
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => CreateOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + data.shipping;
    const amountPaise = Math.round(total * 100);

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return {
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      keyId,
      subtotal,
      shipping: data.shipping,
      total,
    };
  });

const VerifySchema = z.object({
  razorpay_order_id: z.string().min(1).max(120),
  razorpay_payment_id: z.string().min(1).max(120),
  razorpay_signature: z.string().min(1).max(256),
  items: z.array(CartItemSchema).min(1).max(50),
  shipping: z.number().int().min(0).max(100000),
  address: AddressSchema,
});

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => VerifySchema.parse(input))
  .handler(async ({ data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");

    const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Invalid payment signature");
    }

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + data.shipping;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.address.name,
        customer_email: data.address.email || null,
        customer_phone: data.address.phone,
        shipping_address: data.address.address,
        city: data.address.city,
        state: data.address.state,
        pincode: data.address.pincode,
        notes: data.address.notes || null,
        subtotal,
        shipping: data.shipping,
        total,
        status: "confirmed",
        payment_status: "paid",
        payment_method: `razorpay:${data.razorpay_payment_id}`,
      })
      .select("id, order_number")
      .single();

    if (error || !order) throw new Error(error?.message || "Failed to create order");

    const itemsRows = data.items.map((i) => ({
      order_id: order.id,
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.price,
      subtotal: i.price * i.quantity,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(itemsRows);
    if (itemsErr) throw new Error(itemsErr.message);

    return { orderNumber: order.order_number };
  });
