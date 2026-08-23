import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "./auth/shopify-customer";
import { revokeAllUserTokens } from "./token-refresh";

export const revokeUserSessions = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string(), accessToken: z.string() }))
  .handler(async ({ data }) => {
    const { verifyAdminToken, isAdminToken } = await import("./admin-guard");
    
    if (!isAdminToken(data.accessToken)) {
      throw new Error("Unauthorized");
    }
    verifyAdminToken(data.accessToken);

    await revokeAllUserTokens(data.userId);

    return { success: true };
  });
