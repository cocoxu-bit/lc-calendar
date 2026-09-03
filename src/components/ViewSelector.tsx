'use client';

import React from 'react';
import { CalendarDays, CalendarRange, List } from 'lucide-react';

export type CalendarViewMode = 'agenda' | '3days' | 'week';

interface ViewSelectorProps {
  currentView: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="px-3 sm:px-4 py-1.5 bg-neutral-100/60 border-b border-neutral-200/50 flex items-center justify-between gap-2 box-border">
      <span className="text-[11px] font-semibold text-neutral-500">
        Modo de visualización:
      </span>

      <div className="inline-flex p-0.5 bg-neutral-200/80 rounded-xl border border-neutral-300/40 text-[11px] font-semibold">
        {/* Agenda */}
        <button
          type="button"
          onClick={() => onViewChange('agenda')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${
            currentView === 'agenda'
              ? 'bg-white text-neutral-950 shadow-2xs font-bold scale-[1.02]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <List className="w-3 h-3" />
          <span>Agenda</span>
        </button>

        {/* 3 Días */}
        <button
          type="button"
          onClick={() => onViewChange('3days')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${
            currentView === '3days'
              ? 'bg-white text-neutral-950 shadow-2xs font-bold scale-[1.02]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CalendarDays className="w-3 h-3" />
          <span>3 Días</span>
        </button>

        {/* Semana */}
        <button
          type="button"
          onClick={() => onViewChange('week')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all ${
            currentView === 'week'
              ? 'bg-white text-neutral-950 shadow-2xs font-bold scale-[1.02]'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CalendarRange className="w-3 h-3" />
          <span>Semana</span>
        </button>
      </div>
    </div>
  );
};
