import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminUsers, updateUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLES = ["admin", "staff", "customer"] as const;
type Role = (typeof ROLES)[number];

function UsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const usersFn = useServerFn(getAdminUsers);
  const updateRoleFn = useServerFn(updateUserRole);

  const load = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const rows = await usersFn({ data: { accessToken } });
      setUsers(rows ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const toggleRole = async (userId: string, role: Role, currentRole: string) => {
    const isNewRole = currentRole !== role;
    const targetRole: Role = isNewRole ? role : "customer";
    if (!accessToken) return;
    try {
      await updateRoleFn({ data: { accessToken, userId, role: targetRole } });
      toast.success(`Role updated to ${targetRole}`);
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
    }
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
              const currentRole = u.is_admin ? "admin" : u.role || "customer";
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
        {!loading && users.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-12">No users found.</div>
        )}
      </div>
    </div>
  );
}
