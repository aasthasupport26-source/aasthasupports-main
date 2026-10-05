import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string().min(2),
  // Optional so "notify me" leads (email-only) can reuse this pipeline
  phone: z.string().min(7).optional().or(z.literal("")),
  email: z.string().email(),
  message: z.string().min(10),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .validator(ContactFormSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = await checkRateLimit(request, "contact");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    const { supabaseAdmin } = await import("./auth/shopify-customer");

    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name: data.name,
      phone: data.phone || null,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("Failed to save contact form:", error);
      throw new Error("Failed to submit form");
    }

    // Fire-and-forget admin alert — the lead is already saved; a failed
    // email must never fail the customer's submission.
    const { notifyAdmin } = await import("./email");
    void notifyAdmin({
      subject: `New website lead: ${data.name}`,
      text:
        `New contact submission from the website:\n\n` +
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        (data.phone ? `Phone: ${data.phone}\n` : "") +
        `\nMessage:\n${data.message}\n\n` +
        `View all leads: https://www.aasthasupports.com/admin/leads`,
      replyTo: data.email,
    }).catch(() => {});

    return { success: true };
  });
