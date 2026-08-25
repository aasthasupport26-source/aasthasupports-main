// Admin audit logging
import { supabaseAdmin } from "./auth/shopify-customer";

interface AuditLogEntry {
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
}

export async function logAdminAction(
  email: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  changes?: any,
  request?: Request
): Promise<void> {
  try {
    const ip = request?.headers.get('x-forwarded-for')?.split(',')[0] || 
               request?.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_email: email,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      changes: changes ? JSON.stringify(changes) : null,
    });
  } catch (error) {
    // Don't fail the operation if audit logging fails
    console.error('Failed to log admin action:', error);
  }
}
