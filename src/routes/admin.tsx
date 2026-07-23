import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Flame,
  MessageSquare, Users, Settings, LogOut, Loader2,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Aastha Support" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/bookings", label: "Pooja Bookings", icon: Flame },
  { to: "/admin/temples", label: "Temples", icon: FolderTree },
  { to: "/admin/pujas", label: "Pujas", icon: Flame },
  { to: "/admin/leads", label: "Contact Leads", icon: MessageSquare },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { customer, isAdmin, loading, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading) {
      if (!customer) navigate({ to: "/auth", replace: true });
      else if (!isAdmin) navigate({ to: "/", replace: true });
    }
  }, [customer, isAdmin, loading, navigate]);

  if (loading || !customer || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-64 bg-maroon-deep text-cream flex flex-col">
        <div className="p-5 border-b border-gold/20">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="light" compact />
            <div>
              <div className="font-display text-lg leading-tight text-gold">Aastha Support</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-cream/60">Admin Panel</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            if (item.to === "/admin/users" && !isAdmin) return null;
            if (item.to === "/admin/settings" && !isAdmin) return null;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${
                  active ? "bg-gold text-maroon-deep font-medium" : "text-cream/80 hover:bg-maroon hover:text-cream"
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold/20">
          <div className="px-3 py-2 text-xs text-cream/60 truncate">{customer.email}</div>
          <button onClick={async () => { await logout(); navigate({ to: "/" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cream/80 hover:bg-maroon rounded-md transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
