'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { formatMonthHeader, getWeekDays, toDateString } from '@/lib/dateUtils';
import { addDays } from 'date-fns';
import { CoupleProfile } from '@/types/calendar';

interface HeaderProps {
  currentWeekAnchor: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onWeekChange: (newAnchor: Date) => void;
  onResetToToday: () => void;
  onOpenSettings: () => void;
  isLiveFirestore: boolean;
  eventDatesSet: Set<string>;
  profile: CoupleProfile;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeekAnchor,
  selectedDate,
  onSelectDate,
  onWeekChange,
  onResetToToday,
  onOpenSettings,
  isLiveFirestore,
  eventDatesSet,
  profile,
}) => {
  const weekDays = getWeekDays(currentWeekAnchor);
  const monthTitle = formatMonthHeader(currentWeekAnchor);
  const todayStr = toDateString(new Date());
  const isViewingCurrentWeek = weekDays.some((w) => w.dateString === todayStr);

  const handlePrevWeek = () => {
    onWeekChange(addDays(currentWeekAnchor, -7));
  };

  const handleNextWeek = () => {
    onWeekChange(addDays(currentWeekAnchor, 7));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs w-full box-border overflow-hidden">
      {/* Top Bar: Brand, Month & Controls */}
      <div className="px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm shrink-0">
            L&amp;C
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight truncate">
                {monthTitle}
              </h1>
              {isLiveFirestore ? (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" title="Sincronizado con Firebase Firestore" />
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-100 shrink-0" title="Modo Local Activo" />
              )}
            </div>
            <p className="text-[11px] text-neutral-500 font-medium leading-none truncate">
              {profile.user1Name} &amp; {profile.user2Name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isViewingCurrentWeek && (
            <button
              onClick={onResetToToday}
              className="px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition active:scale-95 shadow-xs whitespace-nowrap"
            >
              Hoy
            </button>
          )}

          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60">
            <button
              onClick={handlePrevWeek}
              aria-label="Semana anterior"
              className="p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              aria-label="Semana siguiente"
              className="p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            aria-label="Configuración"
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Scrubber (7 days) - Zero horizontal scroll, perfectly fitted */}
      <div className="px-2 sm:px-3 pb-2.5 pt-0.5 w-full box-border">
        <div className="grid grid-cols-7 gap-1 w-full min-w-0">
          {weekDays.map((day) => {
            const isSelected = day.dateString === selectedDate;
            const hasEvents = eventDatesSet.has(day.dateString);
            const isCurrentToday = day.isToday;

            return (
              <button
                key={day.dateString}
                onClick={() => onSelectDate(day.dateString)}
                className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all duration-150 relative min-w-0 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-md shadow-neutral-900/10 scale-[1.02]'
                    : isCurrentToday
                    ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70 border border-neutral-300/80 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900'
                }`}
              >
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-0.5 truncate ${
                    isSelected
                      ? 'text-neutral-300'
                      : isCurrentToday
                      ? 'text-neutral-900 font-bold'
                      : 'text-neutral-600'
                  }`}
                >
                  {day.dayInitial}
                </span>

                <span
                  className={`text-xs sm:text-sm font-semibold leading-none ${
                    isSelected
                      ? 'text-white'
                      : isCurrentToday
                      ? 'text-neutral-950 font-bold'
                      : 'text-neutral-800'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Event Dot Indicator */}
                <div className="h-1 flex items-center justify-center mt-1">
                  {hasEvents && (
                    <span
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-rose-300'
                          : isCurrentToday
                          ? 'bg-neutral-900'
                          : 'bg-neutral-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
