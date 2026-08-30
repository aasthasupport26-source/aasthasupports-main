import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLES = ["admin", "staff", "customer"] as const;
type Role = (typeof ROLES)[number];

function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data: profs, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load users: " + error.message);
      } else {
        setUsers(profs ?? []);
      }
    } catch (err: any) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (userId: string, role: Role, currentRole: string) => {
    const isNewRole = currentRole !== role;
    const targetRole = isNewRole ? role : "customer";
    const isAdmin = targetRole === "admin";

    const { error } = await supabase
      .from("users")
      .update({ role: targetRole, is_admin: isAdmin })
      .eq("id", userId);

    if (error) return toast.error(error.message);
    toast.success(`Role updated to ${targetRole}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-maroon-deep">Users & Roles</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} users • Toggle admin/staff/customer roles
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gold/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-xs uppercase tracking-widest text-maroon-deep">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const currentRole = u.is_admin ? "admin" : (u.role || "customer");
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.full_name || "—"}</td>
                  <td className="p-3 text-xs">{u.email}</td>
                  <td className="p-3 text-xs">{u.phone || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {ROLES.map((r) => {
                        const isCurrent = currentRole === r;
                        return (
                          <button
                            key={r}
                            onClick={() => toggleRole(u.id, r, currentRole)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition ${
                              isCurrent
                                ? "bg-maroon-deep text-cream border-maroon-deep font-semibold"
                                : "border-gold/40 text-muted-foreground hover:bg-cream"
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
