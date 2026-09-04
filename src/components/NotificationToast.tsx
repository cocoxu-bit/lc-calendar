'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface InAppToastPayload {
  title: string;
  body: string;
  isNight?: boolean;
}

export const NotificationToast: React.FC = () => {
  const [toast, setToast] = useState<InAppToastPayload | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<InAppToastPayload>;
      if (customEvent.detail) {
        setToast(customEvent.detail);

        // Haptic feedback if supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([80, 40, 80]);
          } catch {
            // Ignore if vibration not permitted
          }
        }
      }
    };

    window.addEventListener('lc_in_app_notification', handleToastEvent);
    return () => window.removeEventListener('lc_in_app_notification', handleToastEvent);
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="bg-neutral-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-white/20 shrink-0 mt-0.5 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="L&C Calendar"
            className="w-full h-full object-cover"
          />
          {toast.isNight && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] shadow-sm font-bold">
              🌙
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="text-xs font-bold text-white truncate leading-tight">
              {toast.title}
            </h4>
            <span className="text-[9px] text-white/50 font-medium shrink-0">Ahora</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-snug break-words">
            {toast.body}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Cerrar aviso"
          className="text-white/40 hover:text-white transition p-1 shrink-0 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
