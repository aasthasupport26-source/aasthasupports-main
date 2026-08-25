import { supabaseAdmin } from "./auth/shopify-customer";

interface AuditLogEntry {
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_email: entry.admin_email,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      changes: entry.changes ? JSON.stringify(entry.changes) : null,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
