import { verifyAdminToken } from "./admin-guard";

/**
 * Middleware to verify admin authorization for server functions.
 * Extracts and validates admin JWT token from request.
 */
export async function requireAdmin(accessToken: string): Promise<void> {
  if (!accessToken) {
    throw new Error("Unauthorized: No access token provided");
  }

  try {
    const payload = await verifyAdminToken(accessToken);
    
    if (payload.role !== "admin") {
      throw new Error("Forbidden: Admin access required");
    }
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}
