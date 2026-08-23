// Authentication for monitoring endpoints
import { verifyAdminToken } from "./admin-guard";

export async function requireMonitoringAuth(request: Request): Promise<void> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Unauthorized: No authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Verify admin token
  await verifyAdminToken(token);
}
