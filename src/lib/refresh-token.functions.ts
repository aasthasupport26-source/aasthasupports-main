import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";


export const refreshToken = createServerFn({ method: "POST" })
  .validator(z.object({ refreshToken: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const { checkRateLimit } = await import("./rate-limit");
    const rateCheck = checkRateLimit(request, "auth");
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.retryAfter} seconds.`);
    }

    try {
      const { refreshAdminToken } = await import("./admin-guard");
      const { accessToken, accessExpiresAt } = await refreshAdminToken(data.refreshToken);
      
      return {
        success: true,
        accessToken,
        expiresAt: accessExpiresAt,
      };
    } catch (error) {
      throw new Error("Failed to refresh token. Please login again.");
    }
  });
