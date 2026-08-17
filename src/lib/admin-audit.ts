import { supabaseAdmin } from "./auth/shopify-customer";

interface AuditLogEntry {
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_email: entry.admin_email,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
