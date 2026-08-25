import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  message: z.string().min(10),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .validator(ContactFormSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "contact");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);

    const { supabaseAdmin } = await import("./auth/shopify-customer");

    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("Failed to save contact form:", error);
      throw new Error("Failed to submit form");
    }

    return { success: true };
  });
