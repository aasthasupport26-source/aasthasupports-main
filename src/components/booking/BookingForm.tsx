import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import { createPujaBooking, verifyPujaPayment } from '@/lib/booking.functions';
import 'react-day-picker/dist/style.css';
import { Loader2, CheckCircle2, Flame, Calendar, Clock, User, Phone, Mail, MapPin, Star } from 'lucide-react';

const TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00', '18:00'];

interface BookingFormProps {
  templeId: string;
  pujaId: string;
  packageId: string;
  pujaName: string;
  templeName: string;
  pkg: {
    id: string;
    name: string;
    price: number;
    video: boolean;
    photo: boolean;
    prasad: boolean;
    live_call: boolean;
  };
  userId: string;
  onSuccess?: (bookingNumber: string) => void;
}

/* ── load Razorpay checkout.js lazily ─────────────────────────── */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.body.appendChild(script);
  });
}

export function BookingForm({ templeId, pujaId, packageId, pujaName, templeName, pkg, userId, onSuccess }: BookingFormProps) {
  // Personal
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');

  // Sankalp
  const [gotra, setGotra] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [rashi, setRashi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [sankalpCount, setSankalpCount] = useState(1);
  const [members, setMembers] = useState<{ name: string; relation: string }[]>([{ name: '', relation: '' }]);
  const [specialWish, setSpecialWish] = useState('');

  // Schedule
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');

  // Prasad
  const [needPrasad, setNeedPrasad] = useState(pkg.prasad);
  const [prasadAddress, setPrasadAddress] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedNumber, setConfirmedNumber] = useState('');

  const createBooking = useServerFn(createPujaBooking);
  const verifyPayment = useServerFn(verifyPujaPayment);

  /* ── helpers ──────────────────────────────────────────────────── */
  const handleMemberChange = (index: number, field: 'name' | 'relation', value: string) => {
    const m = [...members];
    m[index][field] = value;
    setMembers(m);
  };

  const updateSankalpCount = (count: number) => {
    setSankalpCount(count);
    const m = [...members];
    while (m.length < count) m.push({ name: '', relation: '' });
    setMembers(m.slice(0, count));
  };

  /* ── submit ───────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !mobileNumber.trim() || !gotra.trim()) {
      toast.error('Please fill Name, Mobile & Gotra (mandatory)');
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time slot');
      return;
    }

    setLoading(true);

    try {
      /* 1️⃣ Create booking draft + Razorpay order in Supabase */
      const res = await createBooking({
        data: {
          userId,
          templeId,
          pujaId,
          packageId,
          packageAmount: pkg.price,
          customerName: fullName,
          phone: mobileNumber,
          whatsapp: whatsappNumber,
          email,
          address,
          gotra,
          dob: birthDate,
          birthTime,
          birthPlace,
          rashi,
          nakshatra,
          bookingDate: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedTime,
          specialWish,
          videoRequired: pkg.video,
          photoRequired: pkg.photo,
          liveRequired: pkg.live_call,
          prasadRequired: needPrasad,
          prasadAddress: needPrasad ? prasadAddress : undefined,
          members: members.filter(m => m.name.trim()),
        }
      });

      /* 2️⃣ Load Razorpay SDK and open checkout modal */
      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: res.keyId,
          amount: res.amountPaise,
          currency: res.currency,
          name: 'Aastha Support',
          description: `${templeName} — ${pujaName} (${pkg.name})`,
          image: '/logo.png',
          order_id: res.razorpayOrderId,
          prefill: {
            name: fullName,
            email: email || undefined,
            contact: mobileNumber,
          },
          notes: {
            booking_number: res.bookingNumber,
            puja: pujaName,
            temple: templeName,
          },
          theme: { color: '#8B1A1A' },
          handler: async (rzpResponse: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              /* 3️⃣ Verify signature + Save confirmed booking to Supabase */
              await verifyPayment({
                data: {
                  bookingPayload: res.bookingPayload,
                  razorpay_order_id: rzpResponse.razorpay_order_id,
                  razorpay_payment_id: rzpResponse.razorpay_payment_id,
                  razorpay_signature: rzpResponse.razorpay_signature,
                }
              });

              setConfirmedNumber(res.bookingNumber);
              setConfirmed(true);
              toast.success('🙏 Booking confirmed! Check your profile for details.');
              onSuccess?.(res.bookingNumber);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled. Your draft booking has been saved.');
              reject(new Error('dismissed'));
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          toast.error('Payment failed: ' + (resp.error?.description || 'Unknown error'));
          reject(new Error('payment_failed'));
        });
        rzp.open();
      });

    } catch (err: any) {
      if (err?.message !== 'dismissed' && err?.message !== 'payment_failed') {
        toast.error(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirmed Screen ─────────────────────────────────────────── */
  if (confirmed) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8d5c0]/60 shadow-lg p-10 text-center space-y-6"
        style={{ background: 'linear-gradient(160deg, #fdf8f3 0%, #faf4ec 100%)' }}>
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6b1a1a 0%, #8B2020 100%)' }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <p className="text-[#e8b84b] text-xs tracking-[0.35em] font-medium mb-1">✦ हरि ॐ ✦</p>
          <h2 className="font-display text-3xl text-[#6b1a1a] font-bold">Booking Confirmed!</h2>
          <p className="text-stone-500 mt-2 text-sm">Your puja has been successfully booked.</p>
        </div>
        <div className="inline-block bg-[#fdf3e3] border border-[#e8d5c0] rounded-2xl px-8 py-4">
          <p className="text-xs text-stone-400 tracking-widest font-medium">BOOKING NUMBER</p>
          <p className="text-2xl font-bold text-[#6b1a1a] mt-1">{confirmedNumber}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm max-w-sm mx-auto">
          <div className="bg-[#fdf8f3] rounded-xl p-3 border border-[#f0e4d4]">
            <p className="text-stone-400 text-xs">Temple</p>
            <p className="font-semibold text-[#6b1a1a] mt-0.5">{templeName}</p>
          </div>
          <div className="bg-[#fdf8f3] rounded-xl p-3 border border-[#f0e4d4]">
            <p className="text-stone-400 text-xs">Puja</p>
            <p className="font-semibold text-[#6b1a1a] mt-0.5">{pujaName}</p>
          </div>
          <div className="bg-[#fdf8f3] rounded-xl p-3 border border-[#f0e4d4]">
            <p className="text-stone-400 text-xs">Package</p>
            <p className="font-semibold text-[#6b1a1a] mt-0.5">{pkg.name}</p>
          </div>
          <div className="bg-[#fdf8f3] rounded-xl p-3 border border-[#f0e4d4]">
            <p className="text-stone-400 text-xs">Date</p>
            <p className="font-semibold text-[#6b1a1a] mt-0.5">{selectedDate ? format(selectedDate, 'dd MMM yyyy') : ''}</p>
          </div>
        </div>
        <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
          Our team will call you within 24 hours to confirm your pandit assignment. You can also track your booking from your profile.
        </p>
        <button
          onClick={() => window.location.href = '/profile'}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white transition"
          style={{ background: 'linear-gradient(135deg, #8B2020 0%, #6b1a1a 100%)' }}>
          <Star className="w-4 h-4" /> View in My Profile
        </button>
      </div>
    );
  }

  /* ── Booking Form ─────────────────────────────────────────────── */
  const price = parseFloat(pkg.price as any);
  const fee = Math.round((price * 2) / 100);
  const total = price + fee;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl border border-[#e8d5c0]/60 shadow-md overflow-hidden">

      {/* Header summary */}
      <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-[#f0e4d4]"
        style={{ background: 'linear-gradient(135deg, #fdf8f3 0%, #faf4ec 100%)' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6b1a1a 0%, #8B2020 100%)' }}>
            <Flame className="w-6 h-6 text-[#e8b84b]" />
          </div>
          <div className="flex-1">
            <p className="text-[#e8b84b] text-xs tracking-[0.3em] font-medium">BOOKING SUMMARY</p>
            <h3 className="font-display text-xl text-[#6b1a1a] font-bold mt-0.5">{pujaName}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
              <span className="text-xs text-stone-500">🕌 {templeName}</span>
              <span className="text-xs text-stone-500">📦 {pkg.name}</span>
              <span className="text-xs font-semibold text-[#8B2020]">₹{price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 space-y-8 pb-8">

        {/* 1. Personal Details */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#6b1a1a] text-white text-xs flex items-center justify-center font-bold">1</div>
            <h3 className="font-display text-lg text-[#6b1a1a] font-semibold">Personal Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <User className="w-3.5 h-3.5 text-[#c49a3c]" /> Full Name *
              </Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required
                placeholder="Your full name" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label htmlFor="mobileNumber" className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c49a3c]" /> Mobile Number *
              </Label>
              <Input id="mobileNumber" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required
                placeholder="10-digit mobile" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <Mail className="w-3.5 h-3.5 text-[#c49a3c]" /> Email Address
              </Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c49a3c]" /> WhatsApp Number
              </Label>
              <Input id="whatsapp" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="WhatsApp contact" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-1.5 text-[#3d1a0a] text-xs font-semibold mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#c49a3c]" /> Full Address
              </Label>
              <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Your address for billing & communication" rows={2}
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl resize-none" />
            </div>
          </div>
        </section>

        {/* 2. Sankalp Details */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#6b1a1a] text-white text-xs flex items-center justify-center font-bold">2</div>
            <h3 className="font-display text-lg text-[#6b1a1a] font-semibold">Sankalp Details <span className="text-sm text-stone-400 font-normal">(संकल्प विवरण)</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Gotra (गोत्र) *</Label>
              <Input value={gotra} onChange={e => setGotra(e.target.value)} required
                placeholder="e.g., Kashyap" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Date of Birth</Label>
              <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Birth Time</Label>
              <Input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Birth Place</Label>
              <Input value={birthPlace} onChange={e => setBirthPlace(e.target.value)}
                placeholder="City/State" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Rashi (राशि)</Label>
              <Input value={rashi} onChange={e => setRashi(e.target.value)}
                placeholder="e.g., Mesh" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
            <div>
              <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Nakshatra</Label>
              <Input value={nakshatra} onChange={e => setNakshatra(e.target.value)}
                placeholder="e.g., Ashwini" className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl" />
            </div>
          </div>

          {/* Sankalp members */}
          <div className="mt-5 p-4 rounded-2xl border border-[#f0e4d4] bg-[#fdfaf6]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#6b1a1a]">Members for Sankalp</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Count:</span>
                <Input type="number" min={1} max={10} value={sankalpCount}
                  onChange={e => updateSankalpCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 h-8 text-center border-[#e8d5c0] rounded-lg text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              {members.map((member, idx) => (
                <div key={idx} className="flex gap-3">
                  <Input placeholder={`Member ${idx + 1} name *`} value={member.name}
                    onChange={e => handleMemberChange(idx, 'name', e.target.value)} required
                    className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl text-sm" />
                  <Input placeholder="Relation (e.g. Self, Son)" value={member.relation}
                    onChange={e => handleMemberChange(idx, 'relation', e.target.value)}
                    className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl text-sm" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Special Wish (विशेष मनोकामना)</Label>
            <Textarea value={specialWish} onChange={e => setSpecialWish(e.target.value)}
              placeholder="Type your special prayer or wish here…" rows={2}
              className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl resize-none" />
          </div>
        </section>

        {/* 3. Date & Time */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-[#6b1a1a] text-white text-xs flex items-center justify-center font-bold">3</div>
            <h3 className="font-display text-lg text-[#6b1a1a] font-semibold">Schedule Ritual <span className="text-sm text-stone-400 font-normal">(पूजा की तारीख और समय)</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e8d5c0]/60 rounded-2xl p-4 bg-[#fdfaf6] flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: addDays(new Date(), 1) }}
              />
            </div>
            <div>
              <p className="text-[#3d1a0a] text-xs font-semibold mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c49a3c]" /> Select Time Slot *
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" onClick={() => setSelectedTime(slot)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedTime === slot
                        ? 'bg-[#6b1a1a] text-white border-[#6b1a1a] shadow-md'
                        : 'border-[#e8d5c0] text-[#6b1a1a] bg-white hover:border-[#8B2020] hover:bg-[#fdf8f3]'
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
              {selectedDate && selectedTime && (
                <div className="mt-4 p-4 rounded-2xl border border-[#e8b84b]/30 bg-[#fdf8ec]">
                  <p className="text-xs text-[#c49a3c] font-semibold tracking-wide mb-1">SCHEDULED FOR</p>
                  <p className="font-bold text-[#6b1a1a]">{format(selectedDate, 'EEEE, dd MMMM yyyy')}</p>
                  <p className="text-sm text-[#8B2020] font-medium">at {selectedTime}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Prasad (conditional) */}
        {pkg.prasad && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#6b1a1a] text-white text-xs flex items-center justify-center font-bold">4</div>
              <h3 className="font-display text-lg text-[#6b1a1a] font-semibold">Prasad Delivery</h3>
            </div>
            <div className="p-4 rounded-2xl border border-[#f0e4d4] bg-[#fdfaf6] space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox id="needPrasad" checked={needPrasad} onCheckedChange={val => setNeedPrasad(!!val)}
                  className="border-[#e8d5c0] data-[state=checked]:bg-[#6b1a1a]" />
                <Label htmlFor="needPrasad" className="cursor-pointer text-sm font-medium text-[#3d1a0a]">
                  I want Prasad delivered to my home (प्रसाद चाहिए)
                </Label>
              </div>
              {needPrasad && (
                <div>
                  <Label className="text-[#3d1a0a] text-xs font-semibold mb-1.5 block">Prasad Delivery Address *</Label>
                  <Textarea value={prasadAddress} onChange={e => setPrasadAddress(e.target.value)} required={needPrasad}
                    placeholder="Complete address with PIN code for prasad delivery" rows={2}
                    className="border-[#e8d5c0] focus:border-[#8B2020] rounded-xl resize-none" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Payment summary & submit */}
        <div className="border-t border-[#f0e4d4] pt-6">
          <div className="rounded-2xl border border-[#e8d5c0]/60 bg-[#fdfaf6] p-5 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Puja Package ({pkg.name})</span>
              <span className="text-[#3d1a0a] font-medium">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Processing Fee (2%)</span>
              <span className="text-[#3d1a0a] font-medium">₹{fee.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-[#f0e4d4] pt-2 flex justify-between">
              <span className="font-bold text-[#6b1a1a]">Total Payable</span>
              <span className="font-bold text-[#6b1a1a] text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button type="submit" disabled={loading || !selectedDate || !selectedTime}
            className="w-full text-base font-semibold py-6 rounded-2xl text-white transition-all"
            style={{ background: loading ? '#9e9e9e' : 'linear-gradient(135deg, #8B2020 0%, #6b1a1a 100%)' }}>
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Opening Secure Payment…</span>
            ) : (
              <span className="flex items-center gap-2">🔒 Pay ₹{total.toLocaleString('en-IN')} &amp; Confirm Booking</span>
            )}
          </Button>
          <p className="text-center text-xs text-stone-400 mt-3">
            Secured by Razorpay · Your booking data is stored safely in Supabase
          </p>
        </div>

      </div>
    </form>
  );
}
