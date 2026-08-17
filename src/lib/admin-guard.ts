import jwt from "jsonwebtoken";
import crypto from "crypto";
import { supabaseAdmin } from "./auth/shopify-customer";

// CRITICAL: ADMIN_JWT_SECRET must be set in production
// Generate with: openssl rand -base64 32
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("ADMIN_JWT_SECRET environment variable is required");
}

const JWT_ISSUER = "aastha-admin";
const JWT_ACCESS_EXPIRY = "15m"; // Short-lived access tokens
const JWT_REFRESH_EXPIRY = "7d"; // Longer-lived refresh tokens

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  type: "access" | "refresh";
  iss: string;
  iat: number;
  exp: number;
}

/**
 * Sign access and refresh tokens for a verified admin user.
 */
export function signAdminTokens(email: string): { 
  accessToken: string; 
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
} {
  const accessToken = jwt.sign({ email, role: "admin", type: "access" }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign({ email, role: "admin", type: "refresh" }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  const accessDecoded = jwt.decode(accessToken) as AdminTokenPayload;
  const refreshDecoded = jwt.decode(refreshToken) as AdminTokenPayload;

  return { 
    accessToken,
    refreshToken,
    accessExpiresAt: new Date(accessDecoded.exp * 1000).toISOString(),
    refreshExpiresAt: new Date(refreshDecoded.exp * 1000).toISOString(),
  };
}

/**
 * Sign a JWT for a verified admin user (legacy - use signAdminTokens instead).
 */
export function signAdminToken(email: string): { token: string; expiresAt: string } {
  const { accessToken, accessExpiresAt } = signAdminTokens(email);
  return { token: accessToken, expiresAt: accessExpiresAt };
}

/**
 * Verify an admin JWT and return the payload.
 * Throws if the token is invalid, expired, or not an admin token.
 */
export async function verifyAdminToken(token: string, expectedType: "access" | "refresh" = "access"): Promise<AdminTokenPayload> {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    }) as AdminTokenPayload;

    if (payload.role !== "admin") {
      throw new Error("Token is not an admin token");
    }

    if (payload.type !== expectedType) {
      throw new Error(`Expected ${expectedType} token, got ${payload.type}`);
    }

    // Check if token is revoked
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const { data: revoked } = await supabaseAdmin
      .from("revoked_tokens")
      .select("id")
      .eq("token_hash", tokenHash)
      .single();

    if (revoked) {
      throw new Error("Token has been revoked");
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
 * Refresh an admin access token using a valid refresh token.
 */
export async function refreshAdminToken(refreshToken: string): Promise<{ 
  accessToken: string; 
  accessExpiresAt: string;
}> {
  const payload = await verifyAdminToken(refreshToken, "refresh");
  
  const accessToken = jwt.sign({ email: payload.email, role: "admin", type: "access" }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  const decoded = jwt.decode(accessToken) as AdminTokenPayload;
  
  return {
    accessToken,
    accessExpiresAt: new Date(decoded.exp * 1000).toISOString(),
  };
}

/**
 * Revoke an admin JWT
 */
export async function revokeAdminToken(token: string): Promise<void> {
  try {
    const payload = jwt.decode(token) as AdminTokenPayload;
    if (!payload?.exp) return;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(payload.exp * 1000).toISOString();

    await supabaseAdmin.from("revoked_tokens").insert({
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("Failed to revoke token:", error);
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
  } catch (err) {
    console.error('Admin token decode failed:', err instanceof Error ? err.message : 'Invalid token format');
    return false;
  }
}
