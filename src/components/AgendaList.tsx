'use client';

import React, { useEffect, useRef } from 'react';
import { CalendarEvent, CoupleProfile } from '@/types/calendar';
import { EventCard } from './EventCard';
import { formatAgendaHeader } from '@/lib/dateUtils';
import { getColorTheme } from '@/lib/colors';
import { Sparkles, Plus, CalendarHeart, Moon } from 'lucide-react';

interface AgendaListProps {
  dates: string[];
  eventsByDate: Record<string, CalendarEvent[]>;
  profile: CoupleProfile;
  selectedDate: string;
  onEventClick: (event: CalendarEvent) => void;
  onQuickAddDate: (dateStr: string) => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  dates,
  eventsByDate,
  profile,
  selectedDate,
  onEventClick,
  onQuickAddDate,
}) => {
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});

  // Auto-scroll to selectedDate when user picks a day in the week scrubber
  useEffect(() => {
    if (selectedDate && dayRefs.current[selectedDate]) {
      const el = dayRefs.current[selectedDate];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-5 pb-28 w-full box-border overflow-hidden">
      {dates.map((dateStr) => {
        const events = eventsByDate[dateStr] || [];
        const headerInfo = formatAgendaHeader(dateStr);
        const isTargetDay = dateStr === selectedDate;

        // Find if someone has night duty tonight
        const nightEvent = events.find(
          (e) => e.babyTaskType === 'noche' || e.title.toLowerCase().includes('noche')
        );
        const nightOwnerName = nightEvent
          ? nightEvent.owner === 'user_1'
            ? profile.user1Name
            : nightEvent.owner === 'user_2'
            ? profile.user2Name
            : 'Juntos'
          : null;

        const nightOwnerTheme = nightEvent
          ? nightEvent.owner === 'user_1'
            ? getColorTheme(profile.user1Color)
            : nightEvent.owner === 'user_2'
            ? getColorTheme(profile.user2Color)
            : getColorTheme(profile.bothColor)
          : null;

        return (
          <section
            key={dateStr}
            ref={(el) => {
              dayRefs.current[dateStr] = el;
            }}
            className={`scroll-mt-40 transition-all duration-300 w-full box-border ${
              isTargetDay ? 'ring-2 ring-neutral-900/10 rounded-3xl p-1 bg-white/40' : ''
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between py-1.5 px-1 mb-2 gap-2 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                {headerInfo.relative ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-2xs shrink-0 ${
                      headerInfo.isCurrentDay
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-200/90 text-neutral-800'
                    }`}
                  >
                    {headerInfo.relative}
                  </span>
                ) : null}

                <h2 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                  <span className="capitalize">{headerInfo.dayName}</span>,{' '}
                  <span className="font-normal text-neutral-600">{headerInfo.formattedDate}</span>
                </h2>

                {/* Night duty badge in day header */}
                {nightOwnerName && nightOwnerTheme && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border shadow-2xs shrink-0 ${nightOwnerTheme.badgeBg}`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Noche: {nightOwnerName}</span>
                  </span>
                )}
              </div>

              {/* Quick Add for this day */}
              <button
                onClick={() => onQuickAddDate(dateStr)}
                aria-label={`Añadir evento para ${dateStr}`}
                className="w-7 h-7 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition active:scale-90 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Events or "Día despejado" */}
            {events.length > 0 ? (
              <div className="space-y-2 w-full">
                {events.map((event) => (
                  <EventCard
                    key={event.id || `${event.date}-${event.title}`}
                    event={event}
                    profile={profile}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            ) : (
              <div
                onClick={() => onQuickAddDate(dateStr)}
                role="button"
                tabIndex={0}
                className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-dashed border-neutral-200/90 bg-neutral-50/50 hover:bg-neutral-100/60 hover:border-neutral-300/80 transition-all cursor-pointer w-full box-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-600 transition">
                    Día despejado
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 font-medium">
                  <Plus className="w-3 h-3" /> Añadir
                </span>
              </div>
            )}
          </section>
        );
      })}

      {/* Footer subtle tip */}
      <div className="pt-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-[11px] text-neutral-500 font-medium max-w-full">
          <CalendarHeart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{profile.user1Name}, {profile.user2Name} &amp; {profile.childName || 'Peque'}</span>
        </div>
      </div>
    </div>
  );
};
