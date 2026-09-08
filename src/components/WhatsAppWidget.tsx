import { useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

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
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Aastha Support</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-[11px]">
            Need Vedic astrological or pooja guidance? Connect with us on WhatsApp!
          </p>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">+91 82876 70827</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Online
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openWhatsApp}
        onMouseEnter={() => setShowTooltip(true)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:shadow-emerald-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group relative cursor-pointer border-2 border-white/50"
        aria-label="Chat on WhatsApp (+91 82876 70827)"
        title="Chat on WhatsApp (+91 82876 70827)"
      >
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#25D366]"></span>
        </span>
        <WhatsAppIcon variant="monochrome" className="w-8 h-8 text-white shrink-0 drop-shadow-sm transition-transform group-hover:scale-105" />
      </button>
    </aside>
  );
}
