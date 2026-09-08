import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false);

  const openWhatsApp = () => {
    const message = encodeURIComponent("Namaste! I would like to inquire about products and pooja services at Aastha Supports.");
    window.open(
      `https://wa.me/918287670827?text=${message}`,
      "whatsapp_popup",
      "width=600,height=700,scrollbars=yes,resizable=yes"
    );
  };

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 print:hidden">
      {showTooltip && (
        <div className="bg-white text-gray-800 text-xs shadow-2xl rounded-2xl p-3.5 border border-emerald-500/30 max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-200 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 mb-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Aastha Support</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-[11px]">
            Need Vedic astrological or pooja guidance? Connect with us on WhatsApp!
          </p>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-600 font-bold">wa.me/91</span>
            <span className="text-[10px] text-emerald-800 font-medium">Online</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openWhatsApp}
        onMouseEnter={() => setShowTooltip(true)}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl hover:shadow-emerald-500/40 px-3.5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-white/40 cursor-pointer"
        aria-label="Chat on WhatsApp wa.me/918287670827"
        title="Chat on WhatsApp (wa.me/918287670827)"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-semibold tracking-wide pr-0.5 hidden sm:inline">
          wa.me/91
        </span>
      </button>
    </aside>
  );
}
