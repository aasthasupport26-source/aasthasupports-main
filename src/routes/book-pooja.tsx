import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { BookingForm } from "@/components/booking/BookingForm";
import { getTemples, getPujasByTemple } from "@/lib/booking.functions";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/book-pooja")({
  component: BookPoojaPage,
});

function BookPoojaPage() {
  const { customer } = useAuth();
  const userId = customer?.id || "";

  const fetchTemples = useServerFn(getTemples);
  const fetchPujas = useServerFn(getPujasByTemple);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);

  const [temples, setTemples] = useState<any[]>([]);
  const [selectedTemple, setSelectedTemple] = useState<any>(null);

  const [pujas, setPujas] = useState<any[]>([]);
  const [selectedPuja, setSelectedPuja] = useState<any>(null);

  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    loadTemples();
  }, []);

  const loadTemples = async () => {
    try {
      const data = await fetchTemples();
      setTemples(data);
    } catch (error) {
      console.error("Failed to load temples:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemple = async (temple: any) => {
    setSelectedTemple(temple);
    setStep(2);
    setLoading(true);
    try {
      const data = await fetchPujas({ data: { templeId: temple.id } });
      setPujas(data);
    } catch (error) {
      console.error("Failed to load pujas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPuja = (puja: any) => {
    setSelectedPuja(puja);
    setStep(3);
  };

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setStep(4);
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedTemple(null);
    setSelectedPuja(null);
    setSelectedPackage(null);
  };

  return (
    <Layout>
      <section className="py-16 bg-cream min-h-screen">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-gold tracking-[0.3em] text-xs">|| बुक करें ||</p>
            <h1 className="font-display text-4xl md:text-5xl text-maroon-deep mt-2">
              Book a Online Puja
            </h1>

            {/* Breadcrumbs */}
            <div className="flex justify-center items-center space-x-2 mt-6 text-sm">
              <button
                onClick={resetFlow}
                className={`${step >= 1 ? "text-maroon font-semibold" : "text-gray-400"}`}
              >
                1. Temple
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => {
                  if (step > 2) {
                    setStep(2);
                    setSelectedPackage(null);
                    setSelectedPuja(null);
                  }
                }}
                className={`${step >= 2 ? "text-maroon font-semibold" : "text-gray-400"}`}
              >
                2. Puja
              </button>
              <span className="text-gray-300">/</span>
              <button
                onClick={() => {
                  if (step > 3) {
                    setStep(3);
                    setSelectedPackage(null);
                  }
                }}
                className={`${step >= 3 ? "text-maroon font-semibold" : "text-gray-400"}`}
              >
                3. Package
              </button>
              <span className="text-gray-300">/</span>
              <span className={`${step >= 4 ? "text-maroon font-semibold" : "text-gray-400"}`}>
                4. Checkout
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-display text-center text-maroon-deep mb-6">
                    Select a Holy Shrine
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {temples.map((temple) => (
                      <div
                        key={temple.id}
                        onClick={() => handleSelectTemple(temple)}
                        className="bg-white rounded-xl p-6 shadow-md border border-gold/20 hover:shadow-royal transition-all cursor-pointer hover:-translate-y-1"
                      >
                        <h3 className="font-display text-xl text-maroon-deep mb-1">
                          {temple.name}
                        </h3>
                        <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-3">
                          {temple.city}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {temple.description}
                        </p>
                      </div>
                    ))}
                    {temples.length === 0 && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                        No temples available yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center text-sm text-gray-500 hover:text-maroon mb-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Temples
                  </button>
                  <h2 className="text-2xl font-display text-center text-maroon-deep mb-2">
                    Select a Puja at {selectedTemple.name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {pujas.map((puja) => (
                      <div
                        key={puja.id}
                        onClick={() => handleSelectPuja(puja)}
                        className="bg-white rounded-xl p-6 shadow-md border border-gold/20 hover:shadow-royal transition-all cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="font-display text-xl text-maroon-deep mb-2">
                            {puja.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {puja.description}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gold/10">
                          <span className="text-sm text-gray-500">
                            {puja.duration_minutes} mins
                          </span>
                          <span className="font-semibold text-maroon">
                            Starts ₹{puja.base_price}
                          </span>
                        </div>
                      </div>
                    ))}
                    {pujas.length === 0 && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                        No pujas available for this temple.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && selectedPuja && (
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center text-sm text-gray-500 hover:text-maroon mb-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pujas
                  </button>
                  <h2 className="text-3xl font-display text-center text-maroon-deep mb-2">
                    {selectedPuja.name}
                  </h2>
                  <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                    {selectedPuja.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(selectedPuja.packages || [])
                      .sort((a: any, b: any) => a.price - b.price)
                      .map((pkg: any) => (
                        <div
                          key={pkg.id}
                          className="bg-white rounded-xl p-6 shadow-md border border-gold/20 flex flex-col h-full relative overflow-hidden"
                        >
                          {pkg.priority > 0 && (
                            <div className="absolute top-4 -right-8 bg-gold text-white text-xs font-bold px-10 py-1 rotate-45 shadow-sm">
                              RECOMMENDED
                            </div>
                          )}
                          <h3 className="font-display text-xl text-maroon-deep mb-1">{pkg.name}</h3>
                          <div className="text-3xl font-bold text-gray-900 mb-4">₹{pkg.price}</div>
                          <p className="text-sm text-gray-600 mb-6 flex-grow">{pkg.description}</p>

                          <ul className="space-y-2 mb-8 text-sm">
                            <li className="flex items-center">
                              <span className="mr-2 text-green-500">✓</span> Personalized Sankalp
                            </li>
                            {pkg.photo && (
                              <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span> Puja Photos
                              </li>
                            )}
                            {pkg.video && (
                              <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span> Puja Video Recording
                              </li>
                            )}
                            {pkg.live_call && (
                              <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span> Live Video Call
                              </li>
                            )}
                            {pkg.prasad && (
                              <li className="flex items-center">
                                <span className="mr-2 text-green-500">✓</span> Home Delivered Prasad
                              </li>
                            )}
                          </ul>

                          <button
                            onClick={() => handleSelectPackage(pkg)}
                            className="w-full bg-maroon text-white hover:bg-maroon-deep py-3 rounded-lg font-semibold transition-colors"
                          >
                            Select {pkg.name}
                          </button>
                        </div>
                      ))}
                    {(!selectedPuja.packages || selectedPuja.packages.length === 0) && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                        No packages defined for this puja.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && selectedPackage && (
                <div className="max-w-3xl mx-auto">
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center text-sm text-gray-500 hover:text-maroon mb-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Packages
                  </button>

                  <BookingForm
                    templeId={selectedTemple.id}
                    pujaId={selectedPuja.id}
                    packageId={selectedPackage.id}
                    templeName={selectedTemple.name}
                    pujaName={selectedPuja.name}
                    pkg={selectedPackage}
                    userId={userId}
                    onSuccess={() => {
                      window.location.href = "/my-account";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
