import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { getAdminBookings, updateBookingStatus } from "@/lib/admin.functions";
import {
  Loader2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Hash,
  Sparkles,
  Video,
  Gift,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

function AdminBookings() {
  const { customer, accessToken, loading, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const { bookings } = await getAdminBookings({ data: { accessToken } });
      setBookings(bookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customer && isAdmin && accessToken) {
      loadBookings();
    }
  }, [customer, isAdmin, accessToken]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled",
  ) => {
    if (!accessToken) return;
    try {
      await updateBookingStatus({ data: { bookingId, status: newStatus, accessToken } });
      toast.success("Booking status updated successfully");
      loadBookings();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-maroon" />
        </div>
      </Layout>
    );
  }

  if (!customer || !isAdmin) {
    return <Navigate to="/auth" />;
  }

  return (
    <Layout>
      <section className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl text-maroon-deep mb-2">Booking Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all client scheduled Pujas and rituals
            </p>
          </div>
          <button
            onClick={loadBookings}
            className="border border-gold/30 hover:border-gold px-4 py-2 rounded-lg text-sm text-maroon-deep font-medium transition"
          >
            Refresh List
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gold/10 p-8 shadow-sm">
            <p className="text-muted-foreground">No bookings recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gold/20 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-gold/10 text-maroon-deep text-xs font-semibold px-2.5 py-1 rounded-md border border-gold/25 font-mono">
                      {booking.booking_id}
                    </span>
                    <h3 className="font-display text-xl text-maroon-deep">
                      {booking.poojas?.name || "Sacred Pooja Ritual"}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border uppercase ${
                        booking.status === "confirmed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : booking.status === "completed"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : booking.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-soft" />
                      <span>Date: {booking.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-soft" />
                      <span>Slot: {booking.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold-soft" />
                      <span>Gotra: {booking.gotra || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-gold-soft" />
                      <span className="truncate">Address: {booking.location_address}</span>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="bg-cream/40 rounded-lg p-3 border border-gold/10 text-xs">
                      <span className="font-semibold text-maroon-deep block mb-1">
                        Special Instruction / Sankalp Members:
                      </span>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col justify-between md:justify-center items-end gap-4 border-t md:border-t-0 md:border-l border-gold/10 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Offering Price</span>
                    <span className="text-2xl font-bold text-maroon-deep">
                      ₹{booking.total_amount?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="w-full">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                      Update Status
                    </label>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(booking.booking_id, e.target.value as any)
                      }
                      className="border border-gold/30 rounded-lg px-3 py-1.5 text-sm bg-white text-maroon-deep w-full focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                      <option value="draft">Draft</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
