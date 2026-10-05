import nodemailer from "nodemailer";

/**
 * Admin email notifications (contact leads, notify-me requests).
 *
 * Reads SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / ADMIN_EMAIL.
 * Fail-safe by design: a missing SMTP config or a failed send must never
 * break the user-facing action (the lead is already saved to the database).
 */

let cachedTransport: import("nodemailer").Transporter | null = null;
let configChecked = false;
let smtpConfigured = false;

function getTransport(): import("nodemailer").Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    if (!configChecked) {
      configChecked = true;
      smtpConfigured = false;
      console.warn(
        "[email] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD) — " +
          "admin email notifications disabled. Leads are still saved to the database.",
      );
    }
    return null;
  }

  if (!cachedTransport) {
    const port = Number(process.env.SMTP_PORT || "587");
    cachedTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
  }
  return cachedTransport;
}

export function isEmailConfigured(): boolean {
  getTransport();
  return smtpConfigured || Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

/**
 * Fire-and-forget notification to the site admin. Never throws.
 */
export async function notifyAdmin(options: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  try {
    const transport = getTransport();
    if (!transport) return false;

    const to = process.env.ADMIN_EMAIL || "hello@aasthasupports.com";
    await transport.sendMail({
      from: `"Aastha Supports Website" <${process.env.SMTP_USER}>`,
      to,
      subject: options.subject,
      text: options.text,
      replyTo: options.replyTo || undefined,
    });
    return true;
  } catch (err) {
    // Never let a notification failure surface to the customer
    console.error("[email] Failed to send admin notification:", err instanceof Error ? err.message : err);
    return false;
  }
}
