'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarEvent,
  EventOwner,
  BabyTaskType,
  CoupleProfile,
  QuickShortcut,
} from '@/types/calendar';
import { getColorTheme } from '@/lib/colors';
import { DynamicIcon } from '@/components/DynamicIcon';
import { X, Trash2, Check, Sparkles } from 'lucide-react';

interface EventSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>, eventId?: string) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  editingEvent?: CalendarEvent | null;
  initialDate?: string;
  profile: CoupleProfile;
}

export const EventSheet: React.FC<EventSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingEvent,
  initialDate,
  profile,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().slice(0, 10));
  const [owner, setOwner] = useState<EventOwner>('both');
  const [category, setCategory] = useState<string>('general');
  const [babyTaskType, setBabyTaskType] = useState<BabyTaskType | undefined>(undefined);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Sync state with editingEvent or initial values when opened
  useEffect(() => {
    if (isOpen) {
      setShowConfirmDelete(false);
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDate(editingEvent.date);
        setOwner(editingEvent.owner);
        setCategory(editingEvent.category || 'general');
        setBabyTaskType(editingEvent.babyTaskType);
        setIsAllDay(editingEvent.isAllDay);
        setStartTime(editingEvent.startTime || '10:00');
        setEndTime(editingEvent.endTime || '11:00');
      } else {
        setTitle('');
        setDate(initialDate || new Date().toISOString().slice(0, 10));
        setOwner('both');
        setCategory(profile.categories?.[0]?.id || 'general');
        setBabyTaskType(undefined);
        setIsAllDay(false);
        setStartTime('10:00');
        setEndTime('11:00');
      }
    }
  }, [isOpen, editingEvent, initialDate, profile]);

  if (!isOpen) return null;

  // Active shortcuts configured in profile (no horizontal scroll, rendered as a 2-column grid)
  const activeShortcuts = (profile.shortcuts || []).filter((s) => s.enabled);

  const applyShortcut = (shortcut: QuickShortcut) => {
    setTitle(shortcut.title);
    setCategory(shortcut.category);
    setBabyTaskType(shortcut.babyTaskType);
    setIsAllDay(Boolean(shortcut.isAllDay));
    if (shortcut.defaultStartTime) setStartTime(shortcut.defaultStartTime);
    if (shortcut.defaultEndTime) setEndTime(shortcut.defaultEndTime);
    if (shortcut.defaultOwner) setOwner(shortcut.defaultOwner);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(
        {
          title: title.trim(),
          date,
          owner,
          category,
          babyTaskType,
          isAllDay,
          startTime: isAllDay ? undefined : startTime,
          endTime: isAllDay ? undefined : endTime,
        },
        editingEvent?.id
      );
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent?.id || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(editingEvent.id);
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const user1Theme = getColorTheme(profile.user1Color);
  const user2Theme = getColorTheme(profile.user2Color);
  const bothTheme = getColorTheme(profile.bothColor);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet Content Container (Mobile-bound) */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-neutral-200/80 z-10 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-250 ease-out box-border overflow-hidden">
        {/* Drag handle bar */}
        <div className="w-full flex items-center justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300/90" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <p className="text-xs text-neutral-500">Coordina planes, pareja y familia</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Shortcuts (Atajos configurables - Cuadrícula de 2 columnas sin scroll horizontal) */}
        {!editingEvent && activeShortcuts.length > 0 && (
          <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-100 box-border">
            <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Atajos rápidos:
            </span>
            <div className="grid grid-cols-2 gap-2 w-full">
              {activeShortcuts.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => applyShortcut(sc)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-800 text-xs font-semibold hover:bg-neutral-100/70 transition flex items-center gap-1.5 shadow-2xs text-left min-w-0"
                >
                  <DynamicIcon name={sc.iconName} className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span className="truncate">{sc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 text-sm box-border">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Título del evento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Turno de noche, Cena, Pádel, Compra..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition box-border"
              autoFocus
            />
          </div>

          {/* Propietario (Owner) Selection with Dynamic Colors */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              ¿A quién corresponde?
            </label>
            <div className="grid grid-cols-3 gap-2 w-full min-w-0">
              {/* Persona 1 */}
              <button
                type="button"
                onClick={() => setOwner('user_1')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all min-w-0 ${
                  owner === 'user_1'
                    ? `${user1Theme.cardBg} ring-2 ring-neutral-900/10 shadow-xs font-bold`
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${user1Theme.indicator} mb-1`} />
                <span className="truncate w-full text-center">{profile.user1Name}</span>
              </button>

              {/* Persona 2 */}
              <button
                type="button"
                onClick={() => setOwner('user_2')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all min-w-0 ${
                  owner === 'user_2'
                    ? `${user2Theme.cardBg} ring-2 ring-neutral-900/10 shadow-xs font-bold`
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${user2Theme.indicator} mb-1`} />
                <span className="truncate w-full text-center">{profile.user2Name}</span>
              </button>

              {/* Ambos */}
              <button
                type="button"
                onClick={() => setOwner('both')}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all min-w-0 ${
                  owner === 'both'
                    ? `${bothTheme.cardBg} ring-2 ring-neutral-900/10 shadow-xs font-bold`
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${bothTheme.indicator} mb-1`} />
                <span className="truncate w-full text-center">Juntos</span>
              </button>
            </div>
          </div>

          {/* Date & All-Day Toggle */}
          <div className="grid grid-cols-2 gap-2.5 items-end w-full">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition text-xs box-border"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200 h-[38px] box-border">
              <span className="text-xs font-medium text-neutral-700 truncate mr-1">Todo el día</span>
              <button
                type="button"
                onClick={() => setIsAllDay(!isAllDay)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAllDay ? 'bg-neutral-900' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAllDay ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Time Picker (Shown only if not all-day) */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-2.5 p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 box-border w-full">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 box-border"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 box-border"
                />
              </div>
            </div>
          )}

          {/* Category Selection (Wrap cleanly without horizontal scroll) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <div className="flex flex-wrap gap-1.5 w-full">
              {(profile.categories || []).map((cat) => {
                const isSelected = category === cat.id;
                const catTheme = getColorTheme(cat.colorTheme);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id !== 'bebe') setBabyTaskType(undefined);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs font-bold'
                        : `bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 ${catTheme.text}`
                    }`}
                  >
                    <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-neutral-900/10 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingEvent ? 'Guardar Cambios' : 'Crear Evento'}</span>
            </button>

            {editingEvent && onDelete && (
              <>
                {!showConfirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar evento</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs text-rose-800 font-medium">¿Confirmar eliminación?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white text-neutral-700 border border-neutral-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
