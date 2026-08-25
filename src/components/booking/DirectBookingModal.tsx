import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createDirectPujaBooking, verifyPujaPayment } from "@/lib/booking.functions";
import { validatePhone } from "@/lib/input-sanitizer";
import type { RazorpayOptions, RazorpayResponse } from "@/types/razorpay";
import { Loader2, User, Phone, BookOpen, X } from "lucide-react";

/* ── load Razorpay checkout.js lazily ─────────────────────────── */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
}

interface DirectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sevaName: string;
  amount: number;
}

export function DirectBookingModal({
  isOpen,
  onClose,
  sevaName,
  amount,
}: DirectBookingModalProps) {
  const { customer } = useAuth();
  const userId = customer?.id || "";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [sankalpNotes, setSankalpNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const createBooking = useServerFn(createDirectPujaBooking);
  const verifyPayment = useServerFn(verifyPujaPayment);

  useEffect(() => {
    if (customer) {
      if (customer.displayName) setFullName(customer.displayName);
      else if (customer.firstName)
        setFullName(`${customer.firstName} ${customer.lastName || ""}`.trim());

      if (customer.phone) setPhone(customer.phone);
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      toast.error("Please fill Name and Mobile Number");
      return;
    }
    if (!validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await createBooking({
        data: {
          userId,
          sevaName,
          amount,
          customerName: fullName,
          phone,
          sankalpNotes,
        },
      });

      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const options: RazorpayOptions = {
          key: res.keyId,
          amount: res.amountPaise,
          currency: res.currency,
          name: "Aastha Support",
          description: sevaName,
          image: "/logo.png",
          order_id: res.razorpayOrderId,
          prefill: {
            name: fullName,
            contact: phone,
            email: customer?.email || undefined,
          },
          notes: {
            booking_number: res.bookingNumber,
            puja: sevaName,
          },
          theme: { color: "#8B1A1A" },
          handler: async (rzpResponse: RazorpayResponse) => {
            try {
              await verifyPayment({
                data: {
                  bookingPayload: res.bookingPayload,
                  razorpay_order_id: rzpResponse.razorpay_order_id,
                  razorpay_payment_id: rzpResponse.razorpay_payment_id,
                  razorpay_signature: rzpResponse.razorpay_signature,
                },
              });
              toast.success("🙏 Booking confirmed! Redirecting to profile...");
              window.location.href = "/my-account";
              resolve();
            } catch (err: unknown) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled.");
              reject(new Error("dismissed"));
            },
          },
        };

        const rzp = new window.Razorpay!(options);
        rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
          toast.error("Payment failed: " + (resp.error?.description || "Unknown error"));
          reject(new Error("payment_failed"));
        });
        rzp.open();
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error?.message !== "dismissed" && error?.message !== "payment_failed") {
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fee = Math.round((amount * 2) / 100);
  const total = amount + fee;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-maroon-deep text-cream p-4 flex justify-between items-center">
          <h2 id="modal-title" className="font-display text-lg">Instant Booking</h2>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-1 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-1">Seva</p>
            <h3 className="font-display text-xl text-maroon-deep">{sevaName}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <User className="w-3.5 h-3.5 text-[#c49a3c]" /> Devotee Name *
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Full Name"
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c49a3c]" /> Mobile Number *
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="10-digit mobile"
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#c49a3c]" /> Sankalp Details (Optional)
              </Label>
              <Textarea
                value={sankalpNotes}
                onChange={(e) => setSankalpNotes(e.target.value)}
                placeholder="Gotra, names of family members, or special wishes..."
                rows={2}
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl resize-none text-sm"
              />
            </div>
          </div>

          <div className="bg-[#fdfaf6] p-4 rounded-xl border border-[#e8d5c0]/60 space-y-1.5">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Seva Amount</span>
              <span>₹{amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Platform Fee (2%)</span>
              <span>₹{fee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-maroon-deep pt-2 border-t border-[#f0e4d4]">
              <span>Total Payable</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-sm font-semibold py-5 rounded-xl text-white transition-all bg-maroon hover:bg-maroon-deep"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">Pay ₹{total.toLocaleString("en-IN")}</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
