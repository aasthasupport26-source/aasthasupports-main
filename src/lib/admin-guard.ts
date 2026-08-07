import jwt from "jsonwebtoken";

// Use a dedicated admin JWT secret. Falls back to a combination of available secrets
// so that existing deployments don't break instantly, but operators should set
// ADMIN_JWT_SECRET to a strong random value ASAP.
const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "CHANGE_ME_BEFORE_PRODUCTION";

const JWT_ISSUER = "aastha-admin";
const JWT_EXPIRY = "24h";

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  iss: string;
  iat: number;
  exp: number;
}

/**
 * Sign a JWT for a verified admin user.
 */
export function signAdminToken(email: string): { token: string; expiresAt: string } {
  const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_EXPIRY,
  });

  // Decode to get exact expiry
  const decoded = jwt.decode(token) as AdminTokenPayload;
  const expiresAt = new Date(decoded.exp * 1000).toISOString();

  return { token, expiresAt };
}

/**
 * Verify an admin JWT and return the payload.
 * Throws if the token is invalid, expired, or not an admin token.
 */
export function verifyAdminToken(token: string): AdminTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as AdminTokenPayload;

    if (payload.role !== "admin") {
      throw new Error("Token is not an admin token");
    }

    return payload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Admin session expired. Please login again.");
    }
    throw new Error("Invalid admin credentials");
  }
}

/**
 * Check if a token string is an admin JWT (vs a Shopify customer token).
 * Does NOT verify validity — use verifyAdminToken() for that.
 */
export function isAdminToken(token: string): boolean {
  // Admin JWTs are standard JWT format (three dot-separated base64 segments).
  // Shopify tokens start with 'shcat_' or are shorter opaque strings.
  if (!token || token.length < 20) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload.role === "admin" && payload.iss === JWT_ISSUER;
  } catch {
    return false;
  }
}
