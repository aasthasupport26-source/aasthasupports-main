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
      // Table column is `details JSONB` (see supabase/migrations/20260818_add_admin_audit_log.sql);
      // cast needed because the generated Supabase types predate that column.
      details: (entry.changes ? entry.changes : null) as any,
    } as any);
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
