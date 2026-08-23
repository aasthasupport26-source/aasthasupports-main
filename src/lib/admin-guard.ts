// All Node.js imports are done dynamically inside functions to prevent
// them from being bundled into the client-side JavaScript.

export interface AdminTokenPayload {
  email: string;
  role: "admin";
  type: "access" | "refresh";
  iss: string;
  iat: number;
  exp: number;
}

const JWT_ISSUER = "aastha-admin";
const JWT_ACCESS_EXPIRY = "15m";
const JWT_REFRESH_EXPIRY = "7d";

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET environment variable is required");
  }
  return secret;
}

/**
 * Sign access and refresh tokens for a verified admin user.
 */
export async function signAdminTokens(email: string): Promise<{
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
}> {
  const jwt = (await import("jsonwebtoken")).default;
  const secret = getJwtSecret();

  const accessToken = jwt.sign({ email, role: "admin", type: "access" }, secret, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign({ email, role: "admin", type: "refresh" }, secret, {
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
export async function signAdminToken(email: string): Promise<{ token: string; expiresAt: string }> {
  const { accessToken, accessExpiresAt } = await signAdminTokens(email);
  return { token: accessToken, expiresAt: accessExpiresAt };
}

/**
 * Verify an admin JWT and return the payload.
 * Throws if the token is invalid, expired, or not an admin token.
 */
export async function verifyAdminToken(
  token: string,
  expectedType: "access" | "refresh" = "access"
): Promise<AdminTokenPayload> {
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const crypto = await import("crypto");
    const { supabaseAdmin } = await import("./auth/shopify-customer");
    const secret = getJwtSecret();

    const payload = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
    }) as AdminTokenPayload;

    if (payload.role !== "admin") {
      throw new Error("Token is not an admin token");
    }

    if (payload.type !== expectedType) {
      throw new Error(`Expected ${expectedType} token, got ${payload.type}`);
    }

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
  const jwt = (await import("jsonwebtoken")).default;
  const secret = getJwtSecret();

  const accessToken = jwt.sign(
    { email: payload.email, role: "admin", type: "access" },
    secret,
    {
      issuer: JWT_ISSUER,
      expiresIn: JWT_ACCESS_EXPIRY,
    }
  );

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
    const jwt = (await import("jsonwebtoken")).default;
    const crypto = await import("crypto");
    const { supabaseAdmin } = await import("./auth/shopify-customer");

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
 * This function is safe to call on the client side.
 */
export function isAdminToken(token: string): boolean {
  if (!token || token.length < 20) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.role === "admin" && payload.iss === JWT_ISSUER;
  } catch (err) {
    return false;
  }
}
