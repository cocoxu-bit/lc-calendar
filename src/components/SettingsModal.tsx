'use client';

import React, { useState } from 'react';
import { CoupleProfile } from '@/types/calendar';
import { X, Check, Cloud, CloudOff, RefreshCw, Heart, Baby } from 'lucide-react';
import { getInitialSampleEvents } from '@/lib/eventsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  onSaveProfile: (profile: CoupleProfile) => void;
  isLiveFirestore: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isLiveFirestore,
}) => {
  const [user1Name, setUser1Name] = useState(profile.user1Name);
  const [user2Name, setUser2Name] = useState(profile.user2Name);
  const [childName, setChildName] = useState(profile.childName || 'Peque');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      user1Name: user1Name.trim() || 'Lucas',
      user2Name: user2Name.trim() || 'Josefina',
      childName: childName.trim() || 'Peque',
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleResetSampleData = () => {
    if (confirm('¿Restablecer los eventos de prueba y turnos del bebé?')) {
      const initial = getInitialSampleEvents();
      localStorage.setItem('lc_calendar_events_local_v2', JSON.stringify(initial));
      window.dispatchEvent(new CustomEvent('lc_calendar_local_change'));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200/80 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Ajustes de Familia</h2>
              <p className="text-[11px] text-neutral-500">Pareja y cuidados del bebé</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Names */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Papá / Persona 1
              </label>
              <input
                type="text"
                value={user1Name}
                onChange={(e) => setUser1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-xs"
                placeholder="Lucas"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Mamá / Persona 2
              </label>
              <input
                type="text"
                value={user2Name}
                onChange={(e) => setUser2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs"
                placeholder="Josefina"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5 text-teal-600" />
                Nombre del bebé / hijo
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-xs"
                placeholder="Peque"
              />
            </div>
          </div>

          {/* Database status */}
          <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700">Sincronización:</span>
              {isLiveFirestore ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Cloud Firestore
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <CloudOff className="w-3 h-3 text-amber-600" />
                  Modo Local / Demo
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              {isLiveFirestore
                ? 'Conectado a Firebase en tiempo real con onSnapshot activo.'
                : 'Operando localmente. Para sincronizar en la nube entre móviles, añade tus credenciales en .env.local.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
              <span>{isSaved ? '¡Guardado!' : 'Guardar Nombres'}</span>
            </button>

            {!isLiveFirestore && (
              <button
                type="button"
                onClick={handleResetSampleData}
                className="w-full py-2 px-3 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition flex items-center justify-center gap-1.5 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restablecer datos de ejemplo</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
