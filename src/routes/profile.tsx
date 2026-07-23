import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/lib/auth.functions';
import { getCustomerOrders } from '@/lib/shopify.functions';
import { getUserBookings } from '@/lib/booking.functions';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import {
  Loader2, LogOut, Calendar, Clock, Package, User, Mail,
  Edit2, Save, X, Truck, CheckCircle2, AlertCircle, ShoppingBag,
  ExternalLink, ChevronRight, Flame, Star, Phone, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [
      { title: 'My Profile — Aastha Support' },
      { name: 'description', content: 'View your profile, bookings, and order history.' },
    ],
  }),
  component: ProfilePage,
});

/* ── helpers ─────────────────────────────────────────────────────── */
function financialBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === 'paid') return { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  if (s === 'pending') return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  if (s === 'refunded') return { label: 'Refunded', cls: 'bg-rose-50 text-rose-700 border border-rose-200' };
  return { label: status, cls: 'bg-stone-100 text-stone-600 border border-stone-200' };
}

function fulfillmentBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === 'fulfilled') return { label: 'Fulfilled', icon: CheckCircle2, cls: 'text-emerald-600' };
  if (s === 'unfulfilled') return { label: 'Unfulfilled', icon: Clock, cls: 'text-amber-500' };
  if (s === 'partial') return { label: 'Partial', icon: AlertCircle, cls: 'text-blue-500' };
  return { label: status || 'Processing', icon: Clock, cls: 'text-stone-400' };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── component ───────────────────────────────────────────────────── */
function ProfilePage() {
  const navigate = useNavigate();
  const { customer, accessToken, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pujaBookings, setPujaBookings] = useState<any[]>([]);
  const [loadingPujas, setLoadingPujas] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'pujas' | 'account'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  const fetchOrders = useServerFn(getCustomerOrders);
  const fetchPujaBookings = useServerFn(getUserBookings);
  const logoutFn = useServerFn(logoutUser);

  useEffect(() => {
    if (!authLoading && !customer) navigate({ to: '/auth', search: {} as any });
  }, [authLoading, customer, navigate]);

  useEffect(() => {
    if (customer) {
      setEditedName(customer.displayName || customer.firstName || '');
      setEditedPhone(customer.phone || '');
    }
  }, [customer]);

  useEffect(() => {
    if (accessToken) {
      fetchOrders({ data: { customerAccessToken: accessToken, limit: 20 } })
        .then(res => setOrders(res.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    } else if (!authLoading) {
      setLoadingOrders(false);
    }
  }, [accessToken, authLoading]);

  useEffect(() => {
    // Fetch puja bookings using Shopify customer ID as user_id proxy via Supabase
    if (customer?.id) {
      fetchPujaBookings({ data: { userId: customer.id } })
        .then(data => setPujaBookings(data || []))
        .catch(() => setPujaBookings([]))
        .finally(() => setLoadingPujas(false));
    } else if (!authLoading) {
      setLoadingPujas(false);
    }
  }, [customer?.id, authLoading]);

  const handleLogout = async () => {
    if (accessToken) {
      try { await logoutFn({ data: { accessToken } }); } catch { /* ignore */ }
    }
    logout();
    navigate({ to: '/' });
  };

  const handleSave = () => {
    toast.success('Profile updated');
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B1A1A]" />
        </div>
      </Layout>
    );
  }

  if (!customer) return null;

  const initials = ((customer.firstName?.[0] || '') + (customer.lastName?.[0] || '')).toUpperCase() || '🙏';

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fdf6ee 0%, #faf4ef 40%, #f5ede3 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

          {/* ── Hero Card ──────────────────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6b1a1a 0%, #8B2020 50%, #5a1010 100%)' }}>
            {/* decorative glows */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #D4A017 0%, transparent 70%)' }} />
            <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #D4A017 0%, transparent 70%)' }} />

            <div className="relative p-8 md:p-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#8B2020] shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #f5d78e 0%, #e8b84b 100%)' }}>
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#e8b84b] text-xs tracking-[0.35em] font-medium mb-1">✦ NAMASTE ✦</p>
                  {isEditing ? (
                    <div className="space-y-2 mt-1">
                      <Input value={editedName} onChange={e => setEditedName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xl font-semibold h-10 rounded-lg" placeholder="Full Name" />
                      <Input value={editedPhone} onChange={e => setEditedPhone(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9 rounded-lg text-sm" placeholder="Phone number" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{editedName || 'Welcome'}</h1>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-white/75 text-sm">
                          <Mail className="w-3.5 h-3.5 text-[#e8b84b]" />{customer.email}
                        </span>
                        {editedPhone && (
                          <span className="flex items-center gap-1.5 text-white/75 text-sm">
                            <Phone className="w-3.5 h-3.5 text-[#e8b84b]" />{editedPhone}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 self-start">
                  {isEditing ? (
                    <>
                      <button onClick={handleSave}
                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#e8b84b] text-[#6b1a1a] hover:bg-[#d4a030] transition">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition border border-white/20">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={handleLogout}
                        className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition border border-white/20">
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-4 divide-x divide-white/10">
                <div className="pr-4 text-center">
                  <p className="text-2xl font-bold text-[#e8b84b]">{loadingOrders ? '—' : orders.length}</p>
                  <p className="text-white/60 text-xs mt-0.5 tracking-wide">ORDERS</p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-2xl font-bold text-[#e8b84b]">
                    {loadingPujas ? '—' : pujaBookings.length}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5 tracking-wide">PUJAS</p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-2xl font-bold text-[#e8b84b]">
                    {loadingOrders ? '—' : `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}`}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5 tracking-wide">SPENT</p>
                </div>
                <div className="pl-4 text-center">
                  <p className="text-2xl font-bold text-[#e8b84b]">
                    {loadingOrders ? '—' : orders.filter(o => o.fulfillmentStatus === 'FULFILLED').length}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5 tracking-wide">DELIVERED</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab bar ────────────────────────────────────────── */}
          <div className="flex rounded-2xl overflow-hidden border border-[#e8d5c0]/60 bg-white/70 backdrop-blur-sm shadow-sm">
            {[
              { key: 'orders', label: 'Shop Orders', icon: Package },
              { key: 'pujas', label: 'Puja Bookings', icon: Flame },
              { key: 'account', label: 'Account', icon: User },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold tracking-wide transition-all ${
                  activeTab === key
                    ? 'bg-[#6b1a1a] text-white shadow-inner'
                    : 'text-[#8B2020]/60 hover:text-[#8B2020] hover:bg-[#fdf6ee]'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* ── Orders Tab ─────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#8B2020] mx-auto" />
                    <p className="text-sm text-[#8B2020]/50">Fetching your orders…</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#e8d5c0]/50 shadow-sm py-20 text-center px-8">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #f5e0c0 100%)' }}>
                    <ShoppingBag className="w-10 h-10 text-[#c49a3c]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#6b1a1a] mb-2">No Orders Yet</h3>
                  <p className="text-sm text-stone-400 mb-7 max-w-xs mx-auto leading-relaxed">
                    Explore our collection of sacred Rudraksha, gemstones, yantras and online pujas.
                  </p>
                  <Link to="/shop"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition"
                    style={{ background: 'linear-gradient(135deg, #8B2020 0%, #6b1a1a 100%)' }}>
                    <Star className="w-4 h-4" /> Browse Sacred Items
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const fin = financialBadge(order.financialStatus);
                    const ful = fulfillmentBadge(order.fulfillmentStatus);
                    const FulIcon = ful.icon;
                    return (
                      <div key={order.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#e8d5c0]/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#f0e4d4]/80"
                          style={{ background: 'linear-gradient(90deg, #fdf8f3 0%, #faf4ec 100%)' }}>
                          <div>
                            <p className="font-bold text-[#6b1a1a] text-lg">{order.name}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              <Calendar className="inline w-3 h-3 mr-1" />{fmtDate(order.processedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${fin.cls}`}>{fin.label}</span>
                            <span className={`flex items-center gap-1 text-xs font-semibold ${ful.cls}`}>
                              <FulIcon className="w-3.5 h-3.5" />{ful.label}
                            </span>
                          </div>
                        </div>

                        {/* Line items */}
                        <div className="divide-y divide-[#f5ece0]/70">
                          {order.lineItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4">
                              {item.image ? (
                                <img src={item.image} alt={item.title}
                                  className="w-14 h-14 rounded-xl object-cover border border-[#e8d5c0]/50 flex-shrink-0" />
                              ) : (
                                <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                                  style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #f5e0c0 100%)' }}>
                                  <Flame className="w-6 h-6 text-[#c49a3c]" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[#3d1a0a] text-sm leading-snug">{item.title}</p>
                                <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-[#6b1a1a] text-sm whitespace-nowrap">
                                ₹{item.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#fdf8f3] border-t border-[#f0e4d4]/80">
                          <div className="flex items-center gap-4">
                            {order.tracking?.url ? (
                              <a href={order.tracking.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-semibold text-[#8B2020] hover:text-[#6b1a1a] transition">
                                <Truck className="w-3.5 h-3.5" />
                                Track · {order.tracking.number || 'View'}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                                <Truck className="w-3.5 h-3.5" />
                                {order.fulfillmentStatus === 'FULFILLED' ? 'Delivered' : 'Tracking soon'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-400">Total</span>
                            <span className="font-bold text-[#6b1a1a] text-base">
                              ₹{order.total.toLocaleString('en-IN')}
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

          {/* ── Puja Bookings Tab ──────────────────────────────── */}
          {activeTab === 'pujas' && (
            <div>
              {loadingPujas ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#8B2020] mx-auto" />
                    <p className="text-sm text-[#8B2020]/50">Fetching your puja bookings…</p>
                  </div>
                </div>
              ) : pujaBookings.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#e8d5c0]/50 shadow-sm py-20 text-center px-8">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #f5e0c0 100%)' }}>
                    <Flame className="w-10 h-10 text-[#c49a3c]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#6b1a1a] mb-2">No Puja Bookings Yet</h3>
                  <p className="text-sm text-stone-400 mb-7 max-w-xs mx-auto leading-relaxed">
                    Book an authentic online puja with our experienced pandits at sacred temples.
                  </p>
                  <Link to="/book-pooja"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition"
                    style={{ background: 'linear-gradient(135deg, #8B2020 0%, #6b1a1a 100%)' }}>
                    <Flame className="w-4 h-4" /> Book a Puja Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pujaBookings.map((booking: any) => {
                    const statusColors: Record<string, string> = {
                      Draft: 'bg-stone-100 text-stone-500 border border-stone-200',
                      'Pending Payment': 'bg-amber-50 text-amber-700 border border-amber-200',
                      Confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                      'Pandit Assigned': 'bg-blue-50 text-blue-700 border border-blue-200',
                      Scheduled: 'bg-violet-50 text-violet-700 border border-violet-200',
                      Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                      Cancelled: 'bg-rose-50 text-rose-600 border border-rose-200',
                    };
                    const statusCls = statusColors[booking.booking_status] || 'bg-stone-100 text-stone-500';
                    const payment = booking.payments?.[0];
                    const paymentStatusCls = payment?.status === 'Captured'
                      ? 'text-emerald-600' : payment?.status === 'Failed'
                      ? 'text-rose-500' : 'text-amber-500';

                    return (
                      <div key={booking.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#e8d5c0]/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#f0e4d4]/80"
                          style={{ background: 'linear-gradient(90deg, #fdf8f3 0%, #faf4ec 100%)' }}>
                          <div>
                            <p className="font-bold text-[#6b1a1a] text-lg">{booking.booking_number}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              <Calendar className="inline w-3 h-3 mr-1" />
                              {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusCls}`}>
                            {booking.booking_status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-stone-400 font-medium">Temple</p>
                            <p className="text-sm font-semibold text-[#3d1a0a] mt-0.5">{booking.temple?.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 font-medium">Puja</p>
                            <p className="text-sm font-semibold text-[#3d1a0a] mt-0.5">{booking.puja?.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 font-medium">Package</p>
                            <p className="text-sm font-semibold text-[#3d1a0a] mt-0.5">{booking.package?.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-400 font-medium">Scheduled</p>
                            <p className="text-sm font-semibold text-[#3d1a0a] mt-0.5">
                              {booking.booking_date
                                ? new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                : '—'}
                              {booking.time_slot ? ` · ${booking.time_slot}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#fdf8f3] border-t border-[#f0e4d4]/80">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${paymentStatusCls}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Payment: {payment?.status || 'Pending'}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-400">Amount</span>
                            <span className="font-bold text-[#6b1a1a] text-base">
                              ₹{parseFloat(booking.package?.price || 0).toLocaleString('en-IN')}
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

          {/* ── Account Tab ────────────────────────────────────── */}
          {activeTab === 'account' && (

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#e8d5c0]/60 shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-[#f0e4d4]"
                style={{ background: 'linear-gradient(90deg, #fdf8f3 0%, #faf4ec 100%)' }}>
                <h2 className="font-semibold text-[#6b1a1a] text-base">Account Details</h2>
              </div>
              <div className="p-7 space-y-5">
                {[
                  { label: 'Full Name', value: editedName || '—', icon: User },
                  { label: 'Email Address', value: customer.email, icon: Mail },
                  { label: 'Phone Number', value: editedPhone || 'Not set', icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-2xl border border-[#f0e4d4] bg-[#fdfaf6]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #f5e0c0 100%)' }}>
                      <Icon className="w-5 h-5 text-[#c49a3c]" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium">{label}</p>
                      <p className="text-[#3d1a0a] font-semibold text-sm mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}

                <button onClick={() => { setActiveTab('orders'); setIsEditing(true); }}
                  className="w-full flex items-center justify-center gap-2 mt-2 py-3 rounded-2xl border-2 border-dashed border-[#e8d5c0] text-[#8B2020]/60 text-sm font-medium hover:border-[#8B2020]/40 hover:text-[#8B2020] transition">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </div>

              {/* Quick links */}
              <div className="border-t border-[#f0e4d4]">
                {[
                  { label: 'Book an Online Puja', to: '/book-pooja', icon: Flame },
                  { label: 'Browse Sacred Shop', to: '/shop', icon: ShoppingBag },
                  { label: 'Track Your Order', to: '/track-order', icon: Truck },
                ].map(({ label, to, icon: Icon }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-4 px-7 py-4 border-b border-[#f5ece0]/80 hover:bg-[#fdf8f3] transition group last:border-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #fdf3e3 0%, #f5e0c0 100%)' }}>
                      <Icon className="w-4 h-4 text-[#c49a3c]" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#3d1a0a]">{label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#8B2020] transition" />
                  </Link>
                ))}
              </div>

              {/* Sign out */}
              <div className="px-7 py-5 bg-[#fdfaf6]">
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition border border-rose-100">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
