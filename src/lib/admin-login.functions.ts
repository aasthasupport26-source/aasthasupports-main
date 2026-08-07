import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./auth/shopify-customer";
import { signAdminToken } from "./admin-guard";

/**
 * Admin-only login - bypasses Shopify, checks Supabase directly.
 * Requires a bcrypt `password_hash` column on the users table.
 */
export const adminLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    // Check if user exists and is admin
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("email, full_name, is_admin, password_hash")
      .eq("email", data.email)
      .eq("is_admin", true)
      .single();

    if (error || !user) {
      throw new Error("Invalid admin credentials");
    }

    // Enforce password verification when possible.
    // If a `password_hash` column exists for the admin user, require it to match.
    // In non-production you can still enable an explicit bypass by setting
    // `ADMIN_DEV_BYPASS=true` in your environment (discouraged for CI/production).

    const storedHash = (user as any)?.password_hash;

    if (storedHash) {
      const ok = bcrypt.compareSync(data.password, storedHash);
      if (!ok) throw new Error("Invalid admin credentials");
    } else {
      // No stored hash. Allow fallback only when explicitly permitted during development.
      if (process.env.NODE_ENV === "production" || process.env.ADMIN_DEV_BYPASS !== "true") {
        throw new Error("Admin login disabled: missing stored password hash");
      }
    }

    // Sign a proper JWT instead of a predictable admin-token-* string
    const { token, expiresAt } = signAdminToken(user.email);

    return {
      customer: {
        id: "admin-" + user.email,
        email: user.email,
        firstName: user.full_name?.split(" ")[0] || "Admin",
        lastName: user.full_name?.split(" ")[1] || "",
        phone: null,
        displayName: user.full_name || "Admin",
      },
      accessToken: token,
      expiresAt,
      isAdmin: true,
    };
  });
