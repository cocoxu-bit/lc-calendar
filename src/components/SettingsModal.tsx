'use client';

import React, { useState, useEffect } from 'react';
import {
  CoupleProfile,
  ColorThemeKey,
  CustomCategory,
  QuickShortcut,
  EventOwner,
  NotificationSettings,
  DEFAULT_CATEGORIES,
  DEFAULT_SHORTCUTS,
  DEFAULT_NOTIFICATIONS,
} from '@/types/calendar';
import { COLOR_KEYS, COLOR_THEMES, getColorTheme } from '@/lib/colors';
import { DynamicIcon, AVAILABLE_ICON_NAMES } from '@/components/DynamicIcon';
import {
  X,
  Check,
  Cloud,
  CloudOff,
  RefreshCw,
  Baby,
  Palette,
  Tag,
  Zap,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { clearAllEvents } from '@/lib/eventsService';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  isIOS,
  isStandalonePWA,
} from '@/lib/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  onSaveProfile: (profile: CoupleProfile) => void;
  isLiveFirestore: boolean;
}

type SettingsTab = 'colors' | 'notifications' | 'categories' | 'shortcuts' | 'sync';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isLiveFirestore,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('colors');

  // Profile fields
  const [user1Name, setUser1Name] = useState(profile.user1Name);
  const [user1Color, setUser1Color] = useState<ColorThemeKey>(profile.user1Color || 'sky');
  const [user2Name, setUser2Name] = useState(profile.user2Name);
  const [user2Color, setUser2Color] = useState<ColorThemeKey>(profile.user2Color || 'rose');
  const [bothColor, setBothColor] = useState<ColorThemeKey>(profile.bothColor || 'purple');
  const [childName, setChildName] = useState(profile.childName || 'Peque');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>(
    profile.notifications || DEFAULT_NOTIFICATIONS
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [testResultMsg, setTestResultMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<CustomCategory[]>(
    profile.categories && profile.categories.length > 0 ? profile.categories : DEFAULT_CATEGORIES
  );
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Sparkles');
  const [newCatColor, setNewCatColor] = useState<ColorThemeKey>('sky');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Shortcuts state
  const [shortcuts, setShortcuts] = useState<QuickShortcut[]>(
    profile.shortcuts && profile.shortcuts.length > 0 ? profile.shortcuts : DEFAULT_SHORTCUTS
  );
  const [editingShortcut, setEditingShortcut] = useState<QuickShortcut | null>(null);
  const [isAddingShortcut, setIsAddingShortcut] = useState(false);
  const [newScLabel, setNewScLabel] = useState('');
  const [newScTitle, setNewScTitle] = useState('');
  const [newScIcon, setNewScIcon] = useState('Sparkles');
  const [newScCat, setNewScCat] = useState(categories[0]?.id || 'general');
  const [newScOwner, setNewScOwner] = useState<EventOwner | 'none'>('none');
  const [newScStart, setNewScStart] = useState('10:00');
  const [newScEnd, setNewScEnd] = useState('11:00');
  const [newScAllDay, setNewScAllDay] = useState(false);

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Sync state whenever modal is opened or profile updates
  useEffect(() => {
    if (isOpen) {
      setUser1Name(profile.user1Name);
      setUser1Color(profile.user1Color || 'sky');
      setUser2Name(profile.user2Name);
      setUser2Color(profile.user2Color || 'rose');
      setBothColor(profile.bothColor || 'purple');
      setChildName(profile.childName || 'Peque');
      setNotifications(profile.notifications || DEFAULT_NOTIFICATIONS);
      setBrowserPermission(getNotificationPermission());
      setTestResultMsg(null);
      setCategories(
        profile.categories && profile.categories.length > 0 ? profile.categories : DEFAULT_CATEGORIES
      );
      setShortcuts(
        profile.shortcuts && profile.shortcuts.length > 0 ? profile.shortcuts : DEFAULT_SHORTCUTS
      );
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const showSavedFeedback = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => {
      setSavedFeedback(null);
    }, 1800);
  };

  const handleSaveAll = (overrideProfile?: Partial<CoupleProfile>, feedbackMsg: string = 'Guardado') => {
    const updated: CoupleProfile = {
      user1Name: user1Name.trim() || 'Lucas',
      user1Color,
      user2Name: user2Name.trim() || 'Josefina',
      user2Color,
      bothColor,
      childName: childName.trim() || 'Peque',
      categories,
      shortcuts,
      notifications,
      ...overrideProfile,
    };
    onSaveProfile(updated);
    showSavedFeedback(feedbackMsg);
  };

  // Instant Color Pickers
  const handleSelectUser1Color = (key: ColorThemeKey) => {
    setUser1Color(key);
    handleSaveAll({ user1Color: key }, `Color de ${user1Name} actualizado`);
  };

  const handleSelectUser2Color = (key: ColorThemeKey) => {
    setUser2Color(key);
    handleSaveAll({ user2Color: key }, `Color de ${user2Name} actualizado`);
  };

  const handleSelectBothColor = (key: ColorThemeKey) => {
    setBothColor(key);
    handleSaveAll({ bothColor: key }, 'Color de Juntos actualizado');
  };

  // Notification settings handler
  const handleUpdateNotifications = async (patch: Partial<NotificationSettings>) => {
    const updatedNotifs = { ...notifications, ...patch };
    setNotifications(updatedNotifs);

    // If enabling notifications, request browser permission if needed
    if (patch.enabled === true && browserPermission !== 'granted') {
      const perm = await requestNotificationPermission();
      setBrowserPermission(perm);
      if (perm !== 'granted') {
        showSavedFeedback('Permiso de notificaciones pendiente en el navegador');
      }
    }

    handleSaveAll({ notifications: updatedNotifs }, 'Ajustes de avisos guardados');
  };

  // Test Notification Button
  const handleRunTestNotification = async () => {
    setIsTestingNotification(true);
    setTestResultMsg(null);
    try {
      const result = await sendTestNotification({
        ...profile,
        user1Name,
        user2Name,
        childName,
        notifications,
      });
      setBrowserPermission(getNotificationPermission());
      setTestResultMsg({
        text: result.message,
        isError: !result.success,
      });
    } catch {
      setTestResultMsg({
        text: 'Error al emitir la notificación en el navegador.',
        isError: true,
      });
    } finally {
      setIsTestingNotification(false);
    }
  };

  // Reordering functions
  const moveCategoryUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...categories];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCategories(updated);
    handleSaveAll({ categories: updated }, 'Orden de categorías actualizado');
  };

  const moveCategoryDown = (index: number) => {
    if (index >= categories.length - 1) return;
    const updated = [...categories];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCategories(updated);
    handleSaveAll({ categories: updated }, 'Orden de categorías actualizado');
  };

  const moveShortcutUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...shortcuts];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated }, 'Orden de atajos actualizado');
  };

  const moveShortcutDown = (index: number) => {
    if (index >= shortcuts.length - 1) return;
    const updated = [...shortcuts];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated }, 'Orden de atajos actualizado');
  };

  // Category Actions
  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = `cat_${Date.now()}`;
    const newCategory: CustomCategory = {
      id,
      label: newCatLabel.trim(),
      iconName: newCatIcon,
      colorTheme: newCatColor,
      isCustom: true,
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    setIsAddingCategory(false);
    setNewCatLabel('');
    handleSaveAll({ categories: updated }, 'Categoría creada');
  };

  const handleUpdateCategory = (updatedCat: CustomCategory) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    setEditingCategory(null);
    handleSaveAll({ categories: updated }, 'Categoría actualizada');
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('Debes mantener al menos una categoría.');
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    handleSaveAll({ categories: updated }, 'Categoría eliminada');
  };

  // Shortcut Actions
  const handleToggleShortcut = (scId: string) => {
    const updated = shortcuts.map((s) => (s.id === scId ? { ...s, enabled: !s.enabled } : s));
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated }, 'Atajo actualizado');
  };

  const handleSaveNewShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScLabel.trim()) return;

    const id = `sc_${Date.now()}`;
    const newShortcut: QuickShortcut = {
      id,
      label: newScLabel.trim(),
      title: newScTitle.trim() || newScLabel.trim(),
      iconName: newScIcon,
      category: newScCat,
      defaultOwner: newScOwner === 'none' ? undefined : newScOwner,
      defaultStartTime: newScAllDay ? undefined : newScStart,
      defaultEndTime: newScAllDay ? undefined : newScEnd,
      isAllDay: newScAllDay,
      enabled: true,
      isCustom: true,
    };

    const updated = [...shortcuts, newShortcut];
    setShortcuts(updated);
    setIsAddingShortcut(false);
    setNewScLabel('');
    setNewScTitle('');
    handleSaveAll({ shortcuts: updated }, 'Atajo rápido creado');
  };

  const handleUpdateShortcut = (updatedSc: QuickShortcut) => {
    const updated = shortcuts.map((s) => (s.id === updatedSc.id ? updatedSc : s));
    setShortcuts(updated);
    setEditingShortcut(null);
    handleSaveAll({ shortcuts: updated }, 'Atajo actualizado');
  };

  const handleDeleteShortcut = (scId: string) => {
    const updated = shortcuts.filter((s) => s.id !== scId);
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated }, 'Atajo eliminado');
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer colores, categorías y atajos a los valores iniciales?')) {
      const resetProfile: CoupleProfile = {
        user1Name: 'Lucas',
        user1Color: 'sky',
        user2Name: 'Josefina',
        user2Color: 'rose',
        bothColor: 'purple',
        childName: 'Peque',
        categories: DEFAULT_CATEGORIES,
        shortcuts: DEFAULT_SHORTCUTS,
        notifications: DEFAULT_NOTIFICATIONS,
      };
      setUser1Name(resetProfile.user1Name);
      setUser1Color(resetProfile.user1Color);
      setUser2Name(resetProfile.user2Name);
      setUser2Color(resetProfile.user2Color);
      setBothColor(resetProfile.bothColor);
      setChildName(resetProfile.childName!);
      setNotifications(DEFAULT_NOTIFICATIONS);
      setCategories(DEFAULT_CATEGORIES);
      setShortcuts(DEFAULT_SHORTCUTS);
      onSaveProfile(resetProfile);

      clearAllEvents();
      onClose();
    }
  };

  const handleClearAllEvents = () => {
    if (confirm('¿Seguro que quieres borrar todos los eventos del calendario? Se vaciará por completo para empezar desde cero.')) {
      clearAllEvents();
      showSavedFeedback('Calendario vaciado por completo');
    }
  };

  const user1Theme = getColorTheme(user1Color);
  const user2Theme = getColorTheme(user2Color);
  const bothTheme = getColorTheme(bothColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-x-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/80 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 box-border">
        {/* Top Header */}
        <div className="px-4 sm:px-5 pt-4 pb-2.5 flex items-center justify-between border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-2xs border border-neutral-200/80 shrink-0 bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="L&C Calendar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-serif font-bold tracking-wide text-emerald-800 block leading-none">
                L&amp;C Calendar
              </span>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight mt-0.5">
                Ajustes &amp; Personalización
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (5 responsive tabs without horizontal scroll) */}
        <div className="grid grid-cols-5 gap-1 p-1.5 bg-neutral-100/90 border-b border-neutral-200/60 shrink-0 text-[10px] sm:text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`py-1.5 px-0.5 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'colors'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Palette className="w-3 h-3 shrink-0" />
            <span className="truncate">Colores</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-1.5 px-0.5 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'notifications'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bell className="w-3 h-3 shrink-0" />
            <span className="truncate">Avisos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-1.5 px-0.5 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'categories'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Tag className="w-3 h-3 shrink-0" />
            <span className="truncate">Categorías</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`py-1.5 px-0.5 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'shortcuts'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Zap className="w-3 h-3 shrink-0" />
            <span className="truncate">Atajos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`py-1.5 px-0.5 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'sync'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Cloud className="w-3 h-3 shrink-0" />
            <span className="truncate">Sync</span>
          </button>
        </div>

        {/* Real-time Save Feedback Indicator */}
        {savedFeedback && (
          <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200/80 px-3 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{savedFeedback}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs box-border">
          {/* TAB 1: COLORES & FAMILIA */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Persona 1 */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${user1Theme.indicator}`} />
                    <span>Persona 1 (Tú)</span>
                  </label>
                  <span className="text-[11px] font-bold text-neutral-600 px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                    {user1Theme.label}
                  </span>
                </div>

                <input
                  type="text"
                  value={user1Name}
                  onChange={(e) => setUser1Name(e.target.value)}
                  onBlur={() => handleSaveAll({}, 'Nombre guardado')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Lucas"
                />

                <div>
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Toca un color para asignárselo al instante:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = user1Color === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectUser1Color(key)}
                          title={t.label}
                          className={`h-9 rounded-xl ${t.swatchBg} flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-neutral-950 ring-offset-2 scale-105 shadow-sm'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Persona 2 */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${user2Theme.indicator}`} />
                    <span>Persona 2 (Tu pareja)</span>
                  </label>
                  <span className="text-[11px] font-bold text-neutral-600 px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                    {user2Theme.label}
                  </span>
                </div>

                <input
                  type="text"
                  value={user2Name}
                  onChange={(e) => setUser2Name(e.target.value)}
                  onBlur={() => handleSaveAll({}, 'Nombre guardado')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Josefina"
                />

                <div>
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Toca un color para asignárselo al instante:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = user2Color === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectUser2Color(key)}
                          title={t.label}
                          className={`h-9 rounded-xl ${t.swatchBg} flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-neutral-950 ring-offset-2 scale-105 shadow-sm'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ambos / Juntos */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${bothTheme.indicator}`} />
                    <span>Eventos Compartidos (Juntos)</span>
                  </label>
                  <span className="text-[11px] font-bold text-neutral-600 px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                    {bothTheme.label}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Color para planes y familia:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = bothColor === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectBothColor(key)}
                          title={t.label}
                          className={`h-9 rounded-xl ${t.swatchBg} flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-neutral-950 ring-offset-2 scale-105 shadow-sm'
                              : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Peque / Hijo */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-teal-600" />
                  Nombre de vuestro hijo/a
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  onBlur={() => handleSaveAll({}, 'Nombre del peque guardado')}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Peque"
                />
              </div>

              {/* Live Preview */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Vista Previa en Vivo:
                </span>
                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl border text-xs font-semibold shadow-2xs ${user1Theme.cardBg}`}>
                    {user1Name} — Pádel y Deporte
                  </div>
                  <div className={`p-3 rounded-2xl border text-xs font-semibold shadow-2xs ${user2Theme.cardBg}`}>
                    {user2Name} — Reunión &amp; Yoga
                  </div>
                  <div className={`p-3 rounded-2xl border text-xs font-semibold shadow-2xs ${bothTheme.cardBg}`}>
                    Juntos — Cena Romántica &amp; Rutina de {childName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AVISOS & NOTIFICACIONES (NUEVO) */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Permission & Master Toggle Card */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-xs">Notificaciones del Navegador</h4>
                      <p className="text-[10px] text-neutral-500">Avisos automáticos en tu pantalla</p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.enabled}
                      onChange={(e) => handleUpdateNotifications({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-950"></div>
                  </label>
                </div>

                {/* Visual + System alerts status */}
                <div className="space-y-2 pt-1 border-t border-neutral-200/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-600 font-medium">Avisos visuales y sonido en pantalla:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" />
                      Activos 100%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-600 font-medium">Alertas del sistema (con app cerrada):</span>
                    {browserPermission === 'granted' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Concedidas
                      </span>
                    ) : browserPermission === 'denied' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Bloqueadas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {isIOS() && !isStandalonePWA() && (
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200/90 text-sky-950 text-[11px] leading-relaxed space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-sky-900">
                        <span>📲 Aviso importante para iPhone:</span>
                      </div>
                      <p>
                        Apple (iOS) no permite alertas con la pantalla bloqueada dentro de pestañas normales de Safari. Para recibirlas con el móvil bloqueado: pulsa el botón <strong>Compartir (📤)</strong> abajo en Safari y pulsa <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
                      </p>
                    </div>
                  )}

                  {browserPermission === 'denied' && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
                      El navegador tiene las notificaciones bloqueadas. Si quieres alertas del sistema, haz clic en el icono del candado en la barra de URL para conceder permisos.
                    </div>
                  )}
                </div>
              </div>

              {/* Botón para Probar Notificaciones (Requisito expreso del usuario) */}
              <div className="p-3.5 rounded-2xl border-2 border-neutral-900 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-neutral-900" />
                    <span className="font-bold text-neutral-900 text-xs">Comprobar Funcionamiento</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium">Prueba en vivo</span>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Lanza un aviso de prueba instantáneo para comprobar cómo aparecerá en tu ordenador o teléfono.
                </p>

                <button
                  type="button"
                  disabled={isTestingNotification}
                  onClick={handleRunTestNotification}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isTestingNotification ? 'Enviando aviso...' : '🔔 Lanzar Notificación de Prueba'}
                  </span>
                </button>

                {testResultMsg && (
                  <div
                    className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                      testResultMsg.isError
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {testResultMsg.isError ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    ) : (
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    )}
                    <span>{testResultMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Personalización en Organización */}
              <div className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                <span className="font-bold text-neutral-900 text-xs block">
                  Configuración de Avisos &amp; Organización
                </span>

                {/* 1. Antelación de avisos */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    ¿Con cuánta antelación avisar antes de un evento?
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { val: 0, label: 'Al inicio' },
                      { val: 5, label: '5 min' },
                      { val: 10, label: '10 min' },
                      { val: 15, label: '15 min' },
                      { val: 30, label: '30 min' },
                      { val: 60, label: '1 hora' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleUpdateNotifications({ leadTimeMinutes: opt.val })}
                        className={`py-1.5 px-1 rounded-xl border text-[11px] font-semibold transition ${
                          notifications.leadTimeMinutes === opt.val
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Filtro de eventos a avisar */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    ¿De qué eventos quieres recibir avisos?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateNotifications({ filterByOwner: 'all' })}
                      className={`py-1.5 px-1 rounded-xl border text-[11px] font-semibold transition ${
                        notifications.filterByOwner === 'all'
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateNotifications({ filterByOwner: 'user_1' })}
                      className={`py-1.5 px-1 rounded-xl border text-[11px] font-semibold truncate transition ${
                        notifications.filterByOwner === 'user_1'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Solo {user1Name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateNotifications({ filterByOwner: 'user_2' })}
                      className={`py-1.5 px-1 rounded-xl border text-[11px] font-semibold truncate transition ${
                        notifications.filterByOwner === 'user_2'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                          : 'bg-white text-neutral-700 border-neutral-200'
                      }`}
                    >
                      Solo {user2Name}
                    </button>
                  </div>
                </div>

                {/* 3. Turno de noche especial */}
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🌙</span>
                      <div>
                        <span className="font-bold text-neutral-900 text-xs block">
                          Recordatorio de Turno Nocturno
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Aviso de quién se queda con {childName} por la noche
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.notifyNightShift}
                      onChange={(e) =>
                        handleUpdateNotifications({ notifyNightShift: e.target.checked })
                      }
                      className="rounded w-4 h-4 text-neutral-900"
                    />
                  </div>

                  {notifications.notifyNightShift && (
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                      <span className="text-neutral-600 font-medium">Hora del recordatorio nocturno:</span>
                      <input
                        type="time"
                        value={notifications.nightShiftReminderTime || '21:00'}
                        onChange={(e) =>
                          handleUpdateNotifications({ nightShiftReminderTime: e.target.value })
                        }
                        className="px-2 py-0.5 rounded-lg border border-neutral-200 text-xs font-semibold"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Sonido agradable */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 text-[11px]">
                  <div className="flex items-center gap-2">
                    {notifications.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    )}
                    <div>
                      <span className="font-bold text-neutral-900 block">Sonido de aviso</span>
                      <span className="text-[10px] text-neutral-500">Tono suave al emitir la alerta</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.soundEnabled}
                    onChange={(e) => handleUpdateNotifications({ soundEnabled: e.target.checked })}
                    className="rounded w-4 h-4 text-neutral-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORÍAS (CON REORDENACIÓN Y CRUD) */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-800 text-xs block">
                    Categorías ({categories.length})
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Usa las flechas ⬆️ ⬇️ para definir el orden
                  </span>
                </div>
                {!isAddingCategory && !editingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-semibold text-[11px] hover:bg-neutral-800 transition flex items-center gap-1 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nueva</span>
                  </button>
                )}
              </div>

              {/* Form to Add New Category */}
              {isAddingCategory && (
                <form
                  onSubmit={handleSaveNewCategory}
                  className="p-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-2.5"
                >
                  <span className="font-bold text-neutral-900 text-xs block">Crear Nueva Categoría</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="Ej. Mascotas, Viajes, Finanzas..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                      autoFocus
                    />
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Icono</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-lg border border-neutral-200">
                      {AVAILABLE_ICON_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setNewCatIcon(name)}
                          className={`p-1.5 rounded-md transition ${
                            newCatIcon === name ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <DynamicIcon name={name} className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Color Pastel</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {COLOR_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setNewCatColor(k)}
                          className={`h-7 rounded-lg ${COLOR_THEMES[k].swatchBg} flex items-center justify-center ${
                            newCatColor === k ? 'ring-2 ring-neutral-900 ring-offset-1 scale-105' : ''
                          }`}
                        >
                          {newCatColor === k && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px]"
                    >
                      Crear Categoría
                    </button>
                  </div>
                </form>
              )}

              {/* Form to Edit Existing Category */}
              {editingCategory && (
                <div className="p-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-2.5">
                  <span className="font-bold text-neutral-900 text-xs block">Editar Categoría</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editingCategory.label}
                      onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                    />
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Icono</label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-lg border border-neutral-200">
                      {AVAILABLE_ICON_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setEditingCategory({ ...editingCategory, iconName: name })}
                          className={`p-1.5 rounded-md transition ${
                            editingCategory.iconName === name
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <DynamicIcon name={name} className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Color Pastel</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {COLOR_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setEditingCategory({ ...editingCategory, colorTheme: k })}
                          className={`h-7 rounded-lg ${COLOR_THEMES[k].swatchBg} flex items-center justify-center ${
                            editingCategory.colorTheme === k ? 'ring-2 ring-neutral-900 ring-offset-1 scale-105' : ''
                          }`}
                        >
                          {editingCategory.colorTheme === k && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(editingCategory)}
                      className="px-3 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px]"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* List of categories with reorder arrows */}
              <div className="space-y-1.5">
                {categories.map((cat, index) => {
                  const catTheme = getColorTheme(cat.colorTheme);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Reorder arrows */}
                        <div className="flex flex-col shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveCategoryUp(index)}
                            aria-label="Subir categoría"
                            className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === categories.length - 1}
                            onClick={() => moveCategoryDown(index)}
                            aria-label="Bajar categoría"
                            className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        <span className={`p-1.5 rounded-lg border shrink-0 ${catTheme.badgeBg}`}>
                          <DynamicIcon name={cat.iconName} className="w-3.5 h-3.5" />
                        </span>

                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 block truncate">{cat.label}</span>
                          <span className="text-[10px] text-neutral-400 capitalize">{catTheme.label}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setEditingCategory(cat);
                          }}
                          aria-label={`Editar ${cat.label}`}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            aria-label={`Eliminar ${cat.label}`}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ATAJOS RÁPIDOS (CON REORDENACIÓN Y CREACIÓN GENERAL) */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-800 text-xs block">
                    Atajos Rápidos ({shortcuts.filter((s) => s.enabled).length} activos)
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Reordena con ⬆️ ⬇️ cómo quieres que aparezcan al pulsar (+)
                  </span>
                </div>
                {!isAddingShortcut && !editingShortcut && (
                  <button
                    type="button"
                    onClick={() => setIsAddingShortcut(true)}
                    className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-semibold text-[11px] hover:bg-neutral-800 transition flex items-center gap-1 shadow-2xs shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nuevo</span>
                  </button>
                )}
              </div>

              {/* Form to Add New General Shortcut */}
              {isAddingShortcut && (
                <form
                  onSubmit={handleSaveNewShortcut}
                  className="p-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-2.5"
                >
                  <span className="font-bold text-neutral-900 text-xs block">
                    Crear Nuevo Atajo Rápido (Deporte, Ocio, Casa, Peque...)
                  </span>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Texto en el botón (corto) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newScLabel}
                      onChange={(e) => setNewScLabel(e.target.value)}
                      placeholder="Ej. Pádel, Compra, Cena, Baño..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Título que generará en el calendario
                    </label>
                    <input
                      type="text"
                      value={newScTitle}
                      onChange={(e) => setNewScTitle(e.target.value)}
                      placeholder="Ej. Partido de pádel semanal 🎾"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                    />
                  </div>

                  {/* Owner default selection */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      ¿A quién asignar por defecto?
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => setNewScOwner('none')}
                        className={`py-1 px-1 rounded-lg border text-[10px] font-semibold ${
                          newScOwner === 'none' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'
                        }`}
                      >
                        Preguntar
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewScOwner('user_1')}
                        className={`py-1 px-1 rounded-lg border text-[10px] font-semibold truncate ${
                          newScOwner === 'user_1' ? 'bg-sky-500 text-white' : 'bg-white text-neutral-700'
                        }`}
                      >
                        {user1Name}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewScOwner('user_2')}
                        className={`py-1 px-1 rounded-lg border text-[10px] font-semibold truncate ${
                          newScOwner === 'user_2' ? 'bg-rose-500 text-white' : 'bg-white text-neutral-700'
                        }`}
                      >
                        {user2Name}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewScOwner('both')}
                        className={`py-1 px-1 rounded-lg border text-[10px] font-semibold ${
                          newScOwner === 'both' ? 'bg-purple-500 text-white' : 'bg-white text-neutral-700'
                        }`}
                      >
                        Juntos
                      </button>
                    </div>
                  </div>

                  {/* All-Day toggle or Time Picker */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-neutral-600">¿Es evento de todo el día?</label>
                      <input
                        type="checkbox"
                        checked={newScAllDay}
                        onChange={(e) => setNewScAllDay(e.target.checked)}
                        className="rounded"
                      />
                    </div>

                    {!newScAllDay && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Hora Inicio</label>
                          <input
                            type="time"
                            value={newScStart}
                            onChange={(e) => setNewScStart(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">Hora Fin</label>
                          <input
                            type="time"
                            value={newScEnd}
                            onChange={(e) => setNewScEnd(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Icono</label>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-white rounded-lg border border-neutral-200">
                      {AVAILABLE_ICON_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setNewScIcon(name)}
                          className={`p-1.5 rounded-md transition ${
                            newScIcon === name ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <DynamicIcon name={name} className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Categoría Asociada</label>
                    <select
                      value={newScCat}
                      onChange={(e) => setNewScCat(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingShortcut(false)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px]"
                    >
                      Crear Atajo
                    </button>
                  </div>
                </form>
              )}

              {/* Form to Edit Existing Shortcut */}
              {editingShortcut && (
                <div className="p-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-2.5">
                  <span className="font-bold text-neutral-900 text-xs block">Editar Atajo</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Nombre botón</label>
                    <input
                      type="text"
                      value={editingShortcut.label}
                      onChange={(e) => setEditingShortcut({ ...editingShortcut, label: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Título del Evento</label>
                    <input
                      type="text"
                      value={editingShortcut.title}
                      onChange={(e) => setEditingShortcut({ ...editingShortcut, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={editingShortcut.defaultStartTime || '10:00'}
                        onChange={(e) => setEditingShortcut({ ...editingShortcut, defaultStartTime: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={editingShortcut.defaultEndTime || '11:00'}
                        onChange={(e) => setEditingShortcut({ ...editingShortcut, defaultEndTime: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingShortcut(null)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 text-neutral-600 text-[11px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateShortcut(editingShortcut)}
                      className="px-3 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px]"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* List of shortcuts with reordering buttons */}
              <div className="space-y-1.5">
                {shortcuts.map((sc, index) => (
                  <div
                    key={sc.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      sc.enabled
                        ? 'border-neutral-200/80 bg-white shadow-2xs'
                        : 'border-neutral-200/50 bg-neutral-100/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Reorder arrows */}
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveShortcutUp(index)}
                          aria-label="Subir atajo"
                          className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === shortcuts.length - 1}
                          onClick={() => moveShortcutDown(index)}
                          aria-label="Bajar atajo"
                          className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20 transition"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleShortcut(sc.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ${
                          sc.enabled
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-transparent border-neutral-300'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>

                      <span className="p-1 rounded-md bg-neutral-100 text-neutral-700 shrink-0">
                        <DynamicIcon name={sc.iconName} className="w-3.5 h-3.5" />
                      </span>

                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-900 block truncate">{sc.label}</span>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {sc.defaultStartTime && sc.defaultEndTime
                            ? `${sc.defaultStartTime} - ${sc.defaultEndTime}`
                            : 'Todo el día'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingShortcut(false);
                          setEditingShortcut(sc);
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShortcut(sc.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYNC & DATOS */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800">Sincronización:</span>
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
                    ? 'Conectado en tiempo real. Cualquier cambio se replica en todos los dispositivos conectados.'
                    : 'Modo local activo en este navegador. Añade las credenciales de Firebase en las variables de entorno de Vercel para sincronizar entre varios teléfonos.'}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleClearAllEvents}
                  className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 hover:text-rose-600 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Vaciar todos los eventos del calendario</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restablecer todo a valores por defecto</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="p-3 sm:p-4 border-t border-neutral-100 bg-white flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50 transition"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={() => {
              handleSaveAll({}, 'Ajustes guardados');
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Guardar y Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
