import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const SessionSchema = z.object({
  customerId: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  displayName: z.string(),
  accessToken: z.string(),
  isAdmin: z.boolean(),
  expiresAt: z.string(),
});

type Session = z.infer<typeof SessionSchema>;

const COOKIE_NAME = "aastha_session";
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours

function getSessionCookieOptions(_isProd: boolean) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

export const setSession = createServerFn({ method: "POST" })
  .validator(SessionSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const { validateCSRF } = await import("./csrf-protection");
    validateCSRF(request);
    const isNode = typeof process !== "undefined";
    const isProd = isNode ? process.env.NODE_ENV === "production" : false;
    setCookie(COOKIE_NAME, JSON.stringify(data), getSessionCookieOptions(isProd));
    return { success: true };
  });

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const sessionStr = getCookie(COOKIE_NAME);
  if (!sessionStr) return null;

  try {
    const session = SessionSchema.parse(JSON.parse(sessionStr));
    const expiryDate = new Date(session.expiresAt);
    if (expiryDate.getTime() < Date.now()) {
      deleteCookie(COOKIE_NAME);
      return null;
    }
    return session;
  } catch (err) {
    console.error('Session parsing failed:', err instanceof Error ? err.message : 'Invalid session data');
    deleteCookie(COOKIE_NAME);
    return null;
  }
});

export const clearSession = createServerFn({ method: "POST" }).handler(async () => {
  const request = getRequest();
  const { validateCSRF } = await import("./csrf-protection");
  validateCSRF(request);
  deleteCookie(COOKIE_NAME);
  return { success: true };
});
