'use client';

import React from 'react';
import { CalendarEvent, CoupleProfile } from '@/types/calendar';
import { getColorTheme } from '@/lib/colors';
import { DynamicIcon } from '@/components/DynamicIcon';
import { formatAgendaHeader, parseDateString } from '@/lib/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Moon,
  Clock,
  Sun,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HorizontalCalendarViewProps {
  mode: '3days' | 'week';
  dates: string[];
  eventsByDate: Record<string, CalendarEvent[]>;
  profile: CoupleProfile;
  selectedDate: string;
  onEventClick: (event: CalendarEvent) => void;
  onQuickAddDate: (dateStr: string) => void;
  onShiftRange: (direction: -1 | 1) => void;
}

export const HorizontalCalendarView: React.FC<HorizontalCalendarViewProps> = ({
  mode,
  dates,
  eventsByDate,
  profile,
  selectedDate,
  onEventClick,
  onQuickAddDate,
  onShiftRange,
}) => {
  // Title range description
  const getRangeTitle = () => {
    if (dates.length === 0) return '';
    const first = parseDateString(dates[0]);
    const last = parseDateString(dates[dates.length - 1]);
    const fStr = format(first, "d 'de' MMM", { locale: es });
    const lStr = format(last, "d 'de' MMM yyyy", { locale: es });
    return `${fStr} — ${lStr}`;
  };

  const getOwnerStyles = (owner: string) => {
    switch (owner) {
      case 'user_1':
        return getColorTheme(profile.user1Color);
      case 'user_2':
        return getColorTheme(profile.user2Color);
      case 'both':
      default:
        return getColorTheme(profile.bothColor);
    }
  };

  const getOwnerName = (owner: string) => {
    if (owner === 'user_1') return profile.user1Name;
    if (owner === 'user_2') return profile.user2Name;
    return 'Juntos';
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-3 flex flex-col w-full box-border pb-28">
      {/* Range Navigator Header */}
      <div className="flex items-center justify-between py-2 px-1 mb-2.5 bg-white/70 backdrop-blur-xs rounded-2xl border border-neutral-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => onShiftRange(-1)}
          aria-label="Anterior rango"
          className="p-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            {mode === '3days' ? 'Columnas de 3 Días' : 'Semana Completa en Horizontal'}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 capitalize">
            {getRangeTitle()}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onShiftRange(1)}
          aria-label="Siguiente rango"
          className="p-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3-DAY MODE: 3 EQUAL COLUMNS SIDE-BY-SIDE (FITS 100% CONTAINER WIDTH) */}
      {mode === '3days' && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full flex-1 items-start min-h-[450px]">
          {dates.map((dateStr) => {
            const events = eventsByDate[dateStr] || [];
            const headerInfo = formatAgendaHeader(dateStr);
            const isToday = headerInfo.isCurrentDay;
            const isSelected = dateStr === selectedDate;

            // Night duty check
            const nightEvent = events.find(
              (e) => e.babyTaskType === 'noche' || e.title.toLowerCase().includes('noche')
            );
            const nightOwnerName = nightEvent ? getOwnerName(nightEvent.owner) : null;
            const nightOwnerTheme = nightEvent ? getOwnerStyles(nightEvent.owner) : null;

            return (
              <div
                key={dateStr}
                className={`flex flex-col rounded-2xl p-2 bg-white border transition-all duration-200 min-h-[420px] shadow-2xs ${
                  isSelected
                    ? 'ring-2 ring-neutral-900/10 border-neutral-400'
                    : isToday
                    ? 'border-neutral-900/40 bg-neutral-50/70'
                    : 'border-neutral-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="pb-2 mb-2 border-b border-neutral-100 text-center relative">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isToday ? 'text-neutral-900' : 'text-neutral-500'
                      }`}
                    >
                      {headerInfo.dayName.slice(0, 3)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onQuickAddDate(dateStr)}
                      aria-label="Añadir evento"
                      className="w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-500 flex items-center justify-center transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span
                    className={`text-base sm:text-lg font-bold block leading-none my-0.5 ${
                      isToday ? 'text-neutral-950' : 'text-neutral-800'
                    }`}
                  >
                    {format(parseDateString(dateStr), 'd')}
                  </span>

                  {headerInfo.relative && (
                    <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-neutral-900 text-white leading-tight">
                      {headerInfo.relative}
                    </span>
                  )}

                  {/* Night duty badge */}
                  {nightOwnerName && nightOwnerTheme && (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold border truncate max-w-full ${nightOwnerTheme.badgeBg}`}
                      >
                        <Moon className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{nightOwnerName}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Events list in this day's column */}
                <div className="flex-1 space-y-1.5 overflow-y-auto">
                  {events.length > 0 ? (
                    events.map((event) => {
                      const ownerTheme = getOwnerStyles(event.owner);
                      const catMeta = profile.categories?.find((c) => c.id === event.category);

                      return (
                        <div
                          key={event.id || `${event.date}-${event.title}`}
                          onClick={() => onEventClick(event)}
                          role="button"
                          tabIndex={0}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs active:scale-[0.97] ${ownerTheme.cardBg}`}
                        >
                          {/* Time */}
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-600 mb-0.5">
                            {event.isAllDay ? (
                              <>
                                <Sun className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                <span className="truncate">Día</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-2.5 h-2.5 shrink-0 text-neutral-400" />
                                <span className="truncate">{event.startTime}</span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-neutral-900 leading-snug break-words">
                            {event.title}
                          </h4>

                          {/* Category icon */}
                          {catMeta && (
                            <div className="mt-1 flex items-center gap-1 text-[9px] text-neutral-500">
                              <DynamicIcon name={catMeta.iconName} className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{catMeta.label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div
                      onClick={() => onQuickAddDate(dateStr)}
                      role="button"
                      tabIndex={0}
                      className="h-28 rounded-xl border border-dashed border-neutral-200 flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-neutral-50 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-neutral-300 mb-1" />
                      <span className="text-[10px] text-neutral-400 font-medium leading-tight">
                        Despejado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK MODE: 7 HORIZONTAL SWIPEABLE COLUMNS (MONDAY TO SUNDAY) */}
      {mode === 'week' && (
        <div className="w-full">
          <div className="text-[11px] text-neutral-500 font-medium mb-1.5 flex items-center justify-between px-1">
            <span>Desliza en horizontal para ver los 7 días:</span>
            <span className="text-[10px] text-neutral-400">Lun → Dom</span>
          </div>

          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 scrollbar-thin">
            {dates.map((dateStr) => {
              const events = eventsByDate[dateStr] || [];
              const headerInfo = formatAgendaHeader(dateStr);
              const isToday = headerInfo.isCurrentDay;
              const isSelected = dateStr === selectedDate;

              // Night duty check
              const nightEvent = events.find(
                (e) => e.babyTaskType === 'noche' || e.title.toLowerCase().includes('noche')
              );
              const nightOwnerName = nightEvent ? getOwnerName(nightEvent.owner) : null;
              const nightOwnerTheme = nightEvent ? getOwnerStyles(nightEvent.owner) : null;

              return (
                <div
                  key={dateStr}
                  className={`w-[44%] min-w-[150px] max-w-[175px] snap-start shrink-0 flex flex-col rounded-2xl p-2.5 bg-white border transition-all duration-200 min-h-[420px] shadow-2xs ${
                    isSelected
                      ? 'ring-2 ring-neutral-900/10 border-neutral-400'
                      : isToday
                      ? 'border-neutral-900/50 bg-neutral-50/80 shadow-xs'
                      : 'border-neutral-200/80'
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-2 mb-2 border-b border-neutral-100 text-center">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isToday ? 'text-neutral-950 font-bold' : 'text-neutral-500'
                        }`}
                      >
                        {headerInfo.dayName}
                      </span>

                      <button
                        type="button"
                        onClick={() => onQuickAddDate(dateStr)}
                        aria-label="Añadir evento"
                        className="w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-500 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 my-1">
                      <span
                        className={`text-lg font-bold leading-none ${
                          isToday ? 'text-neutral-950 font-bold' : 'text-neutral-800'
                        }`}
                      >
                        {format(parseDateString(dateStr), 'd')}
                      </span>

                      {headerInfo.relative && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-neutral-900 text-white">
                          {headerInfo.relative}
                        </span>
                      )}
                    </div>

                    {/* Night duty badge */}
                    {nightOwnerName && nightOwnerTheme && (
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold border truncate max-w-full ${nightOwnerTheme.badgeBg}`}
                        >
                          <Moon className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">Noche: {nightOwnerName}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Column Events List */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {events.length > 0 ? (
                      events.map((event) => {
                        const ownerTheme = getOwnerStyles(event.owner);
                        const catMeta = profile.categories?.find((c) => c.id === event.category);

                        return (
                          <div
                            key={event.id || `${event.date}-${event.title}`}
                            onClick={() => onEventClick(event)}
                            role="button"
                            tabIndex={0}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs active:scale-[0.97] ${ownerTheme.cardBg}`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-neutral-600 mb-0.5">
                              {event.isAllDay ? (
                                <span className="inline-flex items-center gap-0.5 text-neutral-700">
                                  <Sun className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                  <span>Todo el día</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-neutral-700">
                                  <Clock className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                                  <span>{event.startTime}</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-neutral-900 leading-snug break-words">
                              {event.title}
                            </h4>

                            {catMeta && (
                              <div className="mt-1 flex items-center gap-1 text-[9px] text-neutral-500">
                                <DynamicIcon name={catMeta.iconName} className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{catMeta.label}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div
                        onClick={() => onQuickAddDate(dateStr)}
                        role="button"
                        tabIndex={0}
                        className="h-28 rounded-xl border border-dashed border-neutral-200 flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-neutral-50 transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-neutral-300 mb-1" />
                        <span className="text-[10px] text-neutral-400 font-medium leading-tight">
                          Día libre
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
