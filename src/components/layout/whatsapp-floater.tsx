"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppFloater() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Show after 1.5 seconds if not previously closed in this session
    const isClosed = sessionStorage.getItem("vyapar_wa_dismissed");
    if (!isClosed) {
      const timer = setTimeout(() => setDismissed(false), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("vyapar_wa_dismissed", "true");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950 text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* Red / WhatsApp Banner matching reference screenshot */}
      <div className="relative bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2.5 top-2.5 rounded-full p-1 text-white/80 hover:bg-black/20 hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-between pr-4">
          <div>
            <h3 className="text-base font-black tracking-tight leading-tight">
              WhatsApp
              <span className="block text-xs font-bold text-white/90">For Business</span>
            </h3>
          </div>
          <div className="flex size-14 items-center justify-center rounded-full bg-white p-2 shadow-lg">
            <MessageCircle className="size-10 text-emerald-500 fill-emerald-500" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 bg-zinc-950 text-left">
        <div>
          <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
            Send Invoices on WhatsApp 💬
          </h4>
          <p className="mt-1 text-[11px] text-zinc-300 leading-snug">
            व्हाट्सएप पे भेजिए कस्टमर को बिल, बिना किसी रुकावट के! 🤩
          </p>
        </div>

        {/* Buttons matching screenshot: [Remind Later] [Try Now] */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 py-1.5 text-center text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            Remind Later
          </button>
          <Link
            href="/invoices"
            onClick={handleDismiss}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-1.5 text-center text-xs font-bold text-white shadow-md transition-colors"
          >
            Try Now
          </Link>
        </div>
      </div>
    </div>
  );
}
