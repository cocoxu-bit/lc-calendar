'use client';

import React, { useState } from 'react';
import {
  CoupleProfile,
  ColorThemeKey,
  CustomCategory,
  QuickShortcut,
  DEFAULT_CATEGORIES,
  DEFAULT_SHORTCUTS,
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
} from 'lucide-react';
import { getInitialSampleEvents } from '@/lib/eventsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  onSaveProfile: (profile: CoupleProfile) => void;
  isLiveFirestore: boolean;
}

type SettingsTab = 'colors' | 'categories' | 'shortcuts' | 'sync';

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
  const [user1Color, setUser1Color] = useState<ColorThemeKey>(profile.user1Color);
  const [user2Name, setUser2Name] = useState(profile.user2Name);
  const [user2Color, setUser2Color] = useState<ColorThemeKey>(profile.user2Color);
  const [bothColor, setBothColor] = useState<ColorThemeKey>(profile.bothColor);
  const [childName, setChildName] = useState(profile.childName || 'Peque');

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
  const [newScStart, setNewScStart] = useState('10:00');
  const [newScEnd, setNewScEnd] = useState('11:00');

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (overrideProfile?: Partial<CoupleProfile>) => {
    const updated: CoupleProfile = {
      user1Name: user1Name.trim() || 'Lucas',
      user1Color,
      user2Name: user2Name.trim() || 'Josefina',
      user2Color,
      bothColor,
      childName: childName.trim() || 'Peque',
      categories,
      shortcuts,
      ...overrideProfile,
    };
    onSaveProfile(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 1500);
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
    handleSaveAll({ categories: updated });
  };

  const handleUpdateCategory = (updatedCat: CustomCategory) => {
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    setEditingCategory(null);
    handleSaveAll({ categories: updated });
  };

  const handleDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      alert('Debes mantener al menos una categoría.');
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    handleSaveAll({ categories: updated });
  };

  // Shortcut Actions
  const handleToggleShortcut = (scId: string) => {
    const updated = shortcuts.map((s) => (s.id === scId ? { ...s, enabled: !s.enabled } : s));
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated });
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
      defaultStartTime: newScStart,
      defaultEndTime: newScEnd,
      isAllDay: false,
      enabled: true,
      isCustom: true,
    };

    const updated = [...shortcuts, newShortcut];
    setShortcuts(updated);
    setIsAddingShortcut(false);
    setNewScLabel('');
    setNewScTitle('');
    handleSaveAll({ shortcuts: updated });
  };

  const handleUpdateShortcut = (updatedSc: QuickShortcut) => {
    const updated = shortcuts.map((s) => (s.id === updatedSc.id ? updatedSc : s));
    setShortcuts(updated);
    setEditingShortcut(null);
    handleSaveAll({ shortcuts: updated });
  };

  const handleDeleteShortcut = (scId: string) => {
    const updated = shortcuts.filter((s) => s.id !== scId);
    setShortcuts(updated);
    handleSaveAll({ shortcuts: updated });
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
      };
      setUser1Name(resetProfile.user1Name);
      setUser1Color(resetProfile.user1Color);
      setUser2Name(resetProfile.user2Name);
      setUser2Color(resetProfile.user2Color);
      setBothColor(resetProfile.bothColor);
      setChildName(resetProfile.childName!);
      setCategories(DEFAULT_CATEGORIES);
      setShortcuts(DEFAULT_SHORTCUTS);
      onSaveProfile(resetProfile);

      const initial = getInitialSampleEvents();
      localStorage.setItem('lc_calendar_events_local_v2', JSON.stringify(initial));
      window.dispatchEvent(new CustomEvent('lc_calendar_local_change'));
      onClose();
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight">
                Personalización Total
              </h2>
              <p className="text-[11px] text-neutral-500">Colores, categorías y atajos a vuestro gusto</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (No horizontal scroll, 4 equal responsive tabs) */}
        <div className="grid grid-cols-4 gap-1 p-1.5 bg-neutral-100/90 border-b border-neutral-200/60 shrink-0 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
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
            onClick={() => setActiveTab('categories')}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
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
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
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
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
              activeTab === 'sync'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Cloud className="w-3 h-3 shrink-0" />
            <span className="truncate">Sync</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs box-border">
          {/* TAB 1: COLORES & FAMILIA */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Persona 1 */}
              <div className="p-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${user1Theme.indicator}`} />
                    Nombre Persona 1
                  </label>
                  <span className="text-[10px] text-neutral-500">{user1Theme.label}</span>
                </div>
                <input
                  type="text"
                  value={user1Name}
                  onChange={(e) => setUser1Name(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Lucas"
                />
                <div>
                  <span className="block text-[10px] font-semibold text-neutral-500 mb-1">
                    Elige su color pastel:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = user1Color === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setUser1Color(key)}
                          title={t.label}
                          className={`w-6 h-6 rounded-full ${t.swatchBg} transition-transform ${
                            isSelected ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : 'hover:scale-105'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Persona 2 */}
              <div className="p-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${user2Theme.indicator}`} />
                    Nombre Persona 2
                  </label>
                  <span className="text-[10px] text-neutral-500">{user2Theme.label}</span>
                </div>
                <input
                  type="text"
                  value={user2Name}
                  onChange={(e) => setUser2Name(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Josefina"
                />
                <div>
                  <span className="block text-[10px] font-semibold text-neutral-500 mb-1">
                    Elige su color pastel:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = user2Color === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setUser2Color(key)}
                          title={t.label}
                          className={`w-6 h-6 rounded-full ${t.swatchBg} transition-transform ${
                            isSelected ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : 'hover:scale-105'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ambos / Juntos */}
              <div className="p-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${bothTheme.indicator}`} />
                    Planes Juntos / Familia
                  </label>
                  <span className="text-[10px] text-neutral-500">{bothTheme.label}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-semibold text-neutral-500 mb-1">
                    Elige el color para eventos compartidos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_KEYS.map((key) => {
                      const t = COLOR_THEMES[key];
                      const isSelected = bothColor === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setBothColor(key)}
                          title={t.label}
                          className={`w-6 h-6 rounded-full ${t.swatchBg} transition-transform ${
                            isSelected ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : 'hover:scale-105'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Peque / Hijo */}
              <div className="p-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-2">
                <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-teal-600" />
                  Nombre de vuestro hijo/a
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs box-border"
                  placeholder="Peque"
                />
              </div>

              {/* Live Preview */}
              <div className="pt-1">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Vista Previa de Tarjetas:
                </span>
                <div className="space-y-1.5">
                  <div className={`p-2.5 rounded-xl border text-xs font-semibold ${user1Theme.cardBg}`}>
                    {user1Name} — Pádel y Deporte
                  </div>
                  <div className={`p-2.5 rounded-xl border text-xs font-semibold ${user2Theme.cardBg}`}>
                    {user2Name} — Reunión &amp; Yoga
                  </div>
                  <div className={`p-2.5 rounded-xl border text-xs font-semibold ${bothTheme.cardBg}`}>
                    Juntos — Cena Romántica &amp; Rutina de {childName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORÍAS */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 text-xs">
                  Categorías ({categories.length})
                </span>
                {!isAddingCategory && !editingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-semibold text-[11px] hover:bg-neutral-800 transition flex items-center gap-1 shadow-2xs"
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
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setNewCatColor(k)}
                          className={`w-5 h-5 rounded-full ${COLOR_THEMES[k].swatchBg} ${
                            newCatColor === k ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110' : ''
                          }`}
                        />
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
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_KEYS.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setEditingCategory({ ...editingCategory, colorTheme: k })}
                          className={`w-5 h-5 rounded-full ${COLOR_THEMES[k].swatchBg} ${
                            editingCategory.colorTheme === k ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110' : ''
                          }`}
                        />
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

              {/* List of categories */}
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const catTheme = getColorTheme(cat.colorTheme);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`p-1.5 rounded-lg border ${catTheme.badgeBg}`}>
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

          {/* TAB 3: ATAJOS RÁPIDOS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-800 text-xs block">
                    Atajos Rápidos ({shortcuts.filter((s) => s.enabled).length} activos)
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Aparecen en el modal de nuevo evento para agendar en 1 toque
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

              {/* Form to Add New Shortcut */}
              {isAddingShortcut && (
                <form
                  onSubmit={handleSaveNewShortcut}
                  className="p-3 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-2.5"
                >
                  <span className="font-bold text-neutral-900 text-xs block">Crear Nuevo Atajo Rápido</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Nombre en botón (corto)
                    </label>
                    <input
                      type="text"
                      required
                      value={newScLabel}
                      onChange={(e) => setNewScLabel(e.target.value)}
                      placeholder="Ej. Pádel, Paseo perro..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Título que generará el evento
                    </label>
                    <input
                      type="text"
                      value={newScTitle}
                      onChange={(e) => setNewScTitle(e.target.value)}
                      placeholder="Ej. Partido de pádel semanal 🎾"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-900 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={newScStart}
                        onChange={(e) => setNewScStart(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={newScEnd}
                        onChange={(e) => setNewScEnd(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white border border-neutral-200 text-xs"
                      />
                    </div>
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

              {/* List of shortcuts */}
              <div className="space-y-1.5">
                {shortcuts.map((sc) => (
                  <div
                    key={sc.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      sc.enabled
                        ? 'border-neutral-200/80 bg-white shadow-2xs'
                        : 'border-neutral-200/50 bg-neutral-100/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
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

          {/* TAB 4: SYNC & DATOS */}
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

              <div className="pt-2">
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
            onClick={() => handleSaveAll()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>{isSaved ? '¡Guardado Correctamente!' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
