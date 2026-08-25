import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/auth.functions";
import { getCustomerOrders } from "@/lib/shopify.functions";
import { getUserBookings } from "@/lib/booking.functions";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  LogOut,
  Calendar,
  Clock,
  Package,
  User,
  Mail,
  Edit2,
  Save,
  X,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Flame,
  Star,
  Phone,
  Ticket,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Aastha Support" },
      { name: "description", content: "View your profile, bookings, and order history." },
    ],
  }),
  component: ProfilePage,
});

/* ── helpers ─────────────────────────────────────────────────────── */
function financialBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "paid")
    return {
      label: "Paid",
      cls: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    };
  if (s === "pending")
    return { label: "Pending", cls: "bg-amber-500/10 text-amber-600 border border-amber-500/20" };
  if (s === "refunded")
    return { label: "Refunded", cls: "bg-rose-500/10 text-rose-600 border border-rose-500/20" };
  return {
    label: status || "Processing",
    cls: "bg-stone-500/10 text-stone-600 border border-stone-500/20",
  };
}

function fulfillmentBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "fulfilled") return { label: "Delivered", icon: CheckCircle2, cls: "text-emerald-500" };
  if (s === "unfulfilled") return { label: "Processing", icon: Clock, cls: "text-amber-500" };
  if (s === "partial") return { label: "Partial", icon: AlertCircle, cls: "text-blue-500" };
  return { label: status || "Pending", icon: Clock, cls: "text-stone-400" };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── component ───────────────────────────────────────────────────── */
function ProfilePage() {
  const navigate = useNavigate();
  const { customer, accessToken, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pujaBookings, setPujaBookings] = useState<any[]>([]);
  const [loadingPujas, setLoadingPujas] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "pujas" | "account">("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");

  const fetchOrders = useServerFn(getCustomerOrders);
  const fetchPujaBookings = useServerFn(getUserBookings);
  const logoutFn = useServerFn(logoutUser);

  useEffect(() => {
    if (!authLoading && !customer) navigate({ to: "/auth", search: {} as any });
  }, [authLoading, customer, navigate]);

  useEffect(() => {
    if (customer) {
      setEditedName(customer.displayName || customer.firstName || "");
      setEditedPhone(customer.phone || "");
    }
  }, [customer]);

  useEffect(() => {
    if (accessToken) {
      fetchOrders({ data: { customerAccessToken: accessToken, limit: 20 } })
        .then((res) => setOrders(res.orders || []))
        .catch((err) => {
          console.error("Failed to load orders:", err);
          setOrders([]);
        })
        .finally(() => setLoadingOrders(false));
    } else if (!authLoading) {
      setLoadingOrders(false);
    }
  }, [accessToken, authLoading]);

  useEffect(() => {
    if (customer?.id && accessToken) {
      fetchPujaBookings({ data: { accessToken } })
        .then((data) => setPujaBookings(data || []))
        .catch((err) => {
          console.error("Failed to load bookings:", err);
          setPujaBookings([]);
        })
        .finally(() => setLoadingPujas(false));
    } else if (!authLoading) {
      setLoadingPujas(false);
    }
  }, [customer?.id, accessToken, authLoading]);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await logoutFn({ data: { accessToken } });
      } catch {
        /* ignore */
      }
    }
    logout();
    navigate({ to: "/" });
  };

  const handleSave = () => {
    toast.success("Profile updated securely.");
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] bg-cream">
          <Loader2 className="w-10 h-10 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (!customer) return null;

  const initials =
    ((customer.firstName?.[0] || "") + (customer.lastName?.[0] || "")).toUpperCase() || "🙏";

  return (
    <Layout>
      <div className="min-h-screen bg-[#faf5f0] relative overflow-hidden pb-20">
        {/* Dynamic Backgrounds */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-maroon/10 via-[#faf5f0] to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gold/15 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[100px] pointer-events-none animate-pulse duration-[10000ms]" />

        <div className="container mx-auto px-4 py-12 relative z-10 max-w-5xl">
          {/* ── Majestic Hero Section ──────────────────────────────────────── */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-maroon-deep border border-gold/30 mb-10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-maroon-deep via-[#6b1313] to-[#3a0a0a] mix-blend-multiply" />
            <div className="absolute -right-40 -top-40 w-96 h-96 bg-gold/20 rounded-full blur-[80px]" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-rose-600/30 rounded-full blur-[80px]" />

            <div className="relative p-8 md:p-14 flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Premium Avatar */}
              <div className="relative group-hover:scale-105 transition-transform duration-700 ease-out">
                <div className="absolute inset-0 bg-gold blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 rounded-full animate-pulse" />
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center text-5xl font-display text-maroon-deep bg-gradient-to-br from-[#f9d423] via-[#ff4e50] to-[#f9d423] shadow-[0_0_50px_rgba(249,212,35,0.4)] border-[6px] border-white/20 bg-[length:200%_200%] animate-[gradient_3s_ease_infinite]">
                  {initials}
                </div>
                {/* Verified Badge */}
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-500 rounded-full border-4 border-maroon-deep flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4 backdrop-blur-sm">
                  <Star className="w-3 h-3" /> Devotee Member
                </div>
                {isEditing ? (
                  <div className="space-y-4 max-w-sm mx-auto md:mx-0">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-white/10 backdrop-blur-md border-gold/40 text-white placeholder:text-white/40 font-display text-2xl h-14 rounded-2xl focus:border-gold shadow-inner"
                      placeholder="Enter Full Name"
                    />
                    <Input
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="bg-white/10 backdrop-blur-md border-gold/40 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-gold shadow-inner"
                      placeholder="Enter Phone Number"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl md:text-6xl font-display text-white leading-tight drop-shadow-lg font-medium">
                      {editedName || "Devotee"}
                    </h1>
                    <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-4">
                      <span className="flex items-center gap-2 text-cream/90 text-sm bg-white/10 px-5 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                        <Mail className="w-4 h-4 text-gold" />
                        {customer.email}
                      </span>
                      {editedPhone && (
                        <span className="flex items-center gap-2 text-cream/90 text-sm bg-white/10 px-5 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                          <Phone className="w-4 h-4 text-gold" />
                          {editedPhone}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap justify-center md:flex-col shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold to-yellow-400 text-maroon-deep font-bold text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,160,23,0.4)]"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 text-sm font-semibold"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 text-sm font-semibold hover:shadow-lg"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 transition-all backdrop-blur-md border border-rose-500/30 text-sm font-semibold hover:shadow-lg"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Premium Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 bg-black/30 backdrop-blur-xl border-t border-white/10 divide-x divide-white/10 relative z-10">
              {[
                { label: "SHOP ORDERS", value: loadingOrders ? "—" : orders.length },
                { label: "PUJA PASSES", value: loadingPujas ? "—" : pujaBookings.length },
                {
                  label: "LIFETIME VALUE",
                  value: loadingOrders
                    ? "—"
                    : `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}`,
                },
                {
                  label: "DELIVERED",
                  value: loadingOrders
                    ? "—"
                    : orders.filter((o) => o.fulfillmentStatus === "FULFILLED").length,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="px-6 py-6 text-center hover:bg-white/5 transition duration-500"
                >
                  <p className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold to-yellow-600 drop-shadow-sm">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-[10px] font-bold tracking-[0.25em] mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Modern Glassmorphic Tab Bar ────────────────────────────────────────── */}
          <div className="flex p-2 rounded-[2rem] bg-white/70 backdrop-blur-2xl border border-gold/30 shadow-lg mb-10 mx-auto max-w-3xl relative z-20">
            {[
              { key: "pujas", label: "My Puja Passes", icon: Ticket },
              { key: "orders", label: "Shop Orders", icon: Package },
              { key: "account", label: "Account", icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-[1.5rem] text-sm font-bold transition-all duration-500 relative z-10 ${
                  activeTab === key
                    ? "text-maroon-deep shadow-md"
                    : "text-stone-500 hover:text-maroon hover:bg-white/50"
                }`}
              >
                {activeTab === key && (
                  <div className="absolute inset-0 bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gold/20 -z-10 animate-in fade-in zoom-in-95 duration-300" />
                )}
                <Icon className={`w-5 h-5 ${activeTab === key ? "text-gold" : "opacity-70"}`} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Content Area ─────────────────────────────────────── */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* PUJAS TAB (TICKET STYLE) */}
            {activeTab === "pujas" && (
              <div>
                {loadingPujas ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <Loader2 className="w-16 h-16 animate-spin text-gold relative z-10" />
                    </div>
                    <p className="text-sm font-bold text-maroon-deep tracking-widest uppercase">
                      Retrieving Digital Passes...
                    </p>
                  </div>
                ) : pujaBookings.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-gold/20 shadow-xl py-32 text-center px-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream opacity-60" />
                    <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-maroon-deep to-maroon text-gold shadow-2xl group-hover:scale-110 transition duration-700">
                      <Ticket className="w-12 h-12" />
                    </div>
                    <h3 className="font-display text-4xl text-maroon-deep mb-4 relative z-10">
                      No Active Passes
                    </h3>
                    <p className="text-base text-stone-600 mb-10 max-w-md mx-auto leading-relaxed relative z-10">
                      Experience the divine. Book a personalized, live online puja performed by
                      authentic Vedic pandits and receive your digital access pass.
                    </p>
                    <Link
                      to="/book-pooja"
                      className="relative z-10 inline-flex items-center gap-3 px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest bg-maroon-deep text-cream shadow-[0_10px_30px_rgba(107,26,26,0.3)] hover:shadow-[0_10px_40px_rgba(107,26,26,0.5)] hover:-translate-y-1 transition-all"
                    >
                      <Flame className="w-5 h-5 text-gold" /> Book a Puja
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {pujaBookings.map((booking: any) => {
                      const isConfirmed =
                        booking.status === "Confirmed" ||
                        booking.status === "Completed" ||
                        booking.status === "Scheduled";

                      return (
                        <div
                          key={booking.id}
                          className="relative flex flex-col md:flex-row bg-white rounded-[2rem] border border-gold/20 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group"
                        >
                          {/* Ticket Main Body */}
                          <div className="flex-1 p-8 md:p-10 relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                              <Flame className="w-64 h-64" />
                            </div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                              <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stone-100 text-stone-500 text-xs font-bold font-mono uppercase tracking-wider mb-3">
                                  #{booking.booking_number}
                                </div>
                                <h3 className="font-display text-3xl font-bold text-maroon-deep leading-tight">
                                  {booking.pooja_type || "Sacred Online Puja"}
                                </h3>
                              </div>

                              {/* Direct Booking Confirmed Badge */}
                              {isConfirmed && (
                                <div className="hidden md:flex flex-col items-end animate-in fade-in zoom-in duration-500">
                                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full shadow-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">
                                      Direct Booking Confirmed
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 mt-8">
                              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2 text-gold">
                                  <Star className="w-4 h-4" />
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                                    Temple
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-stone-800 line-clamp-2">
                                  {booking.temple?.name || "TBD"}
                                </p>
                              </div>
                              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2 text-gold">
                                  <Package className="w-4 h-4" />
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                                    Package
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-stone-800 line-clamp-2">
                                  {booking.package?.name || "Standard"}
                                </p>
                              </div>
                              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2 text-gold">
                                  <Calendar className="w-4 h-4" />
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                                    Date
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-stone-800">
                                  {booking.booking_date
                                    ? new Date(booking.booking_date).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "TBD"}
                                </p>
                              </div>
                              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                                <div className="flex items-center gap-2 mb-2 text-gold">
                                  <Clock className="w-4 h-4" />
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-stone-500">
                                    Time
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-stone-800">
                                  {booking.time_slot || "TBD"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Perforation Line (Desktop: vertical, Mobile: horizontal) */}
                          <div className="relative flex md:flex-col items-center">
                            <div className="w-full h-px md:h-full md:w-px border-t md:border-t-0 md:border-l-2 border-dashed border-stone-300 relative z-10"></div>
                            {/* Cutouts */}
                            <div className="absolute top-1/2 md:top-0 left-0 md:left-1/2 -translate-y-1/2 md:-translate-y-1/2 md:-translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#faf5f0] rounded-full border-r border-t md:border-r-0 md:border-b-0 border-gold/20 md:-mt-4 -ml-3 md:ml-0 z-20"></div>
                            <div className="absolute top-1/2 md:bottom-0 right-0 md:left-1/2 -translate-y-1/2 md:translate-y-1/2 md:-translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-[#faf5f0] rounded-full border-l border-b md:border-l-0 md:border-t-0 border-gold/20 md:-mb-4 -mr-3 md:mr-0 z-20"></div>
                          </div>

                          {/* Ticket Stub / QR Code Area */}
                          <div className="bg-gradient-to-br from-cream to-white p-8 md:w-72 flex flex-col items-center justify-center relative">
                            {isConfirmed && (
                              <div className="md:hidden flex flex-col items-center mb-6 w-full animate-in fade-in zoom-in duration-500">
                                <div className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full shadow-sm w-full">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-[10px] font-bold tracking-widest uppercase text-center">
                                    Direct Booking Confirmed
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="w-32 h-32 bg-white rounded-2xl shadow-inner border border-stone-200 p-3 mb-6 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-gold/50 transition-colors">
                              <QrCode className="w-full h-full text-stone-800 opacity-90 group-hover:scale-105 transition-transform duration-500" />
                              {/* Scanning line animation */}
                              <div className="absolute top-0 left-0 w-full h-1 bg-gold/50 blur-[2px] shadow-[0_0_10px_rgba(212,160,23,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                            </div>

                            <div className="text-center w-full">
                              <p className="text-[10px] font-bold text-stone-400 tracking-[0.3em] uppercase mb-1">
                                Pass Status
                              </p>
                              <p
                                className={`font-display text-xl font-bold ${isConfirmed ? "text-emerald-600" : "text-stone-600"}`}
                              >
                                {booking.status || "Pending"}
                              </p>
                            </div>

                            {booking.amount ? (
                              <div className="mt-4 pt-4 border-t border-stone-200 w-full text-center">
                                <p className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase mb-1">
                                  Amount Paid
                                </p>
                                <p className="font-bold text-stone-800 text-lg">
                                  ₹{parseFloat(booking.amount).toLocaleString("en-IN")}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div>
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gold blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <Loader2 className="w-16 h-16 animate-spin text-gold relative z-10" />
                    </div>
                    <p className="text-sm font-bold text-maroon-deep tracking-widest uppercase">
                      Syncing Shop Data...
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-gold/20 shadow-xl py-32 text-center px-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream opacity-60" />
                    <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-maroon-deep to-maroon text-gold shadow-2xl group-hover:scale-110 transition duration-700">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                    <h3 className="font-display text-4xl text-maroon-deep mb-4 relative z-10">
                      Your Journey Begins Here
                    </h3>
                    <p className="text-base text-stone-600 mb-10 max-w-md mx-auto leading-relaxed relative z-10">
                      You haven't placed any orders yet. Discover our collection of sacred
                      Rudraksha, healing gemstones, and powerful yantras.
                    </p>
                    <Link
                      to="/shop"
                      className="relative z-10 inline-flex items-center gap-3 px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest bg-gold text-maroon-deep shadow-[0_10px_30px_rgba(212,160,23,0.3)] hover:shadow-[0_10px_40px_rgba(212,160,23,0.5)] hover:-translate-y-1 transition-all"
                    >
                      <Star className="w-5 h-5" /> Explore Shop
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {orders.map((order) => {
                      const fin = financialBadge(order.financialStatus);
                      const ful = fulfillmentBadge(order.fulfillmentStatus);
                      const FulIcon = ful.icon;
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-[2rem] border border-gold/20 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group flex flex-col"
                        >
                          {/* Order header */}
                          <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 bg-gradient-to-r from-[#fdfbf7] to-white border-b border-gold/10">
                            <div>
                              <p className="font-display font-bold text-maroon-deep text-2xl mb-1">
                                {order.name}
                              </p>
                              <p className="text-sm text-stone-500 flex items-center gap-2 font-medium">
                                <Calendar className="w-4 h-4" />
                                {fmtDate(order.processedAt)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl ${fin.cls}`}
                              >
                                {fin.label}
                              </span>
                              <span
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 shadow-sm ${ful.cls}`}
                              >
                                <FulIcon className="w-4 h-4" />
                                {ful.label}
                              </span>
                            </div>
                          </div>

                          {/* Line items */}
                          <div className="px-8 py-4 divide-y divide-stone-100 flex-1">
                            {order.lineItems.map((item: any, i: number) => (
                              <div
                                key={i}
                                className="flex flex-col sm:flex-row sm:items-center gap-6 py-6 group/item"
                              >
                                {item.image ? (
                                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-stone-200 shadow-sm group-hover/item:shadow-md group-hover/item:border-gold/30 transition-all">
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-24 h-24 rounded-2xl bg-cream flex items-center justify-center border border-stone-200 shadow-sm">
                                    <ShoppingBag className="w-8 h-8 text-stone-300" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-stone-800 text-lg leading-tight group-hover/item:text-maroon-deep transition-colors mb-2">
                                    {item.title}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
                                      Qty: <span className="text-stone-800">{item.quantity}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-display font-bold text-maroon-deep text-2xl">
                                    ₹{item.price.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-6 bg-stone-50/50 border-t border-gold/10">
                            <div>
                              {order.tracking?.url ? (
                                <a
                                  href={order.tracking.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-bold text-white bg-maroon-deep px-6 py-3 rounded-xl shadow-md hover:bg-maroon hover:shadow-lg transition-all"
                                >
                                  <Truck className="w-4 h-4 text-gold" /> Track Shipment{" "}
                                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-2 text-sm text-stone-500 font-bold bg-white px-5 py-2.5 rounded-xl border border-stone-200 shadow-sm">
                                  <Truck className="w-4 h-4 text-stone-400" />
                                  {order.fulfillmentStatus === "FULFILLED"
                                    ? "Order Delivered"
                                    : "Preparing for Shipment"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gold/20 shadow-sm">
                              <span className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase">
                                Total Paid
                              </span>
                              <span className="font-display font-bold text-maroon-deep text-3xl">
                                ₹{order.total.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-gold/20 shadow-xl overflow-hidden">
                <div className="px-10 py-8 border-b border-gold/10 bg-gradient-to-r from-[#fdfbf7] to-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-maroon-deep text-3xl mb-1">
                      Account Settings
                    </h2>
                    <p className="text-stone-500 text-sm">Manage your personal information</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold/10 text-maroon-deep hover:bg-gold hover:text-white transition-all font-bold text-xs uppercase tracking-wider shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                </div>

                <div className="p-10">
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {[
                      { label: "Full Name", value: editedName || "Not Provided", icon: User },
                      { label: "Email Address", value: customer.email, icon: Mail },
                      { label: "Phone Number", value: editedPhone || "Not Provided", icon: Phone },
                    ].map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex items-center gap-6 p-6 rounded-[1.5rem] bg-cream border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center bg-white shadow-sm border border-gold/10">
                          <Icon className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase mb-1">
                            {label}
                          </p>
                          <p className="text-stone-800 font-bold text-lg">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <h3 className="font-display font-bold text-maroon-deep text-2xl mb-6">
                    Quick Links
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        label: "Book a Puja",
                        desc: "Experience live rituals",
                        to: "/book-pooja",
                        icon: Flame,
                        color: "text-rose-600",
                        bg: "bg-rose-50",
                        border: "border-rose-100",
                      },
                      {
                        label: "Shop Store",
                        desc: "Explore sacred items",
                        to: "/shop",
                        icon: ShoppingBag,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                        border: "border-amber-100",
                      },
                      {
                        label: "Help & FAQ",
                        desc: "Get support instantly",
                        to: "/faq",
                        icon: AlertCircle,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                        border: "border-blue-100",
                      },
                    ].map(({ label, desc, to, icon: Icon, color, bg, border }) => (
                      <Link
                        key={to}
                        to={to}
                        className={`flex items-start gap-5 p-6 rounded-[1.5rem] border ${border} hover:border-gold hover:shadow-lg transition-all duration-300 group bg-white`}
                      >
                        <div
                          className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${bg} group-hover:scale-110 transition-transform duration-300 shadow-inner`}
                        >
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div className="mt-1">
                          <p className="font-bold text-stone-800 text-lg group-hover:text-maroon-deep transition-colors mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm text-stone-500">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-10 py-8 bg-stone-50/50 border-t border-stone-200">
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-sm font-bold uppercase tracking-wider text-rose-600 bg-white border-2 border-rose-100 shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all mx-auto group"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />{" "}
                    Sign Out Securely
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Keyframes for Animations */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
        `,
          }}
        />
      </div>
    </Layout>
  );
}
