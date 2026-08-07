import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

const ROLES = ["admin", "staff", "customer"] as const;
type Role = (typeof ROLES)[number];

function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, Role[]>>({});

  const load = async () => {
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const map: Record<string, Role[]> = {};
    (roles ?? []).forEach((r: any) => {
      map[r.user_id] = [...(map[r.user_id] ?? []), r.role];
    });
    setRolesMap(map);
    setUsers(profs ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (userId: string, role: Role, has: boolean) => {
    if (has) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated");
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
              const userRoles = rolesMap[u.id] ?? [];
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3 text-xs">{u.email}</td>
                  <td className="p-3 text-xs">{u.phone || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {ROLES.map((r) => {
                        const has = userRoles.includes(r);
                        return (
                          <button
                            key={r}
                            onClick={() => toggleRole(u.id, r, has)}
                            className={`text-xs px-2 py-1 rounded-full border ${has ? "bg-maroon text-cream border-maroon" : "border-gold/40 text-muted-foreground"}`}
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
