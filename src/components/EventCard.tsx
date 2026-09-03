'use client';

import React from 'react';
import { CalendarEvent, CoupleProfile, EventOwner } from '@/types/calendar';
import { getColorTheme } from '@/lib/colors';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Clock, Sun, Users, User, Moon, Utensils, Bath } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  profile: CoupleProfile;
  onClick: (event: CalendarEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, profile, onClick }) => {
  // Find category metadata dynamically
  const categoryMeta = profile.categories?.find((c) => c.id === event.category) || {
    id: event.category,
    label: event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'General',
    iconName: 'Calendar',
    colorTheme: 'indigo' as const,
  };
  const categoryTheme = getColorTheme(categoryMeta.colorTheme);

  // Dynamic owner styles
  const getOwnerStyles = (owner: EventOwner) => {
    switch (owner) {
      case 'user_1': {
        const theme = getColorTheme(profile.user1Color);
        return {
          cardBg: theme.cardBg,
          badgeBg: theme.badgeBg,
          ownerName: profile.user1Name,
          icon: <User className="w-3 h-3" />,
        };
      }
      case 'user_2': {
        const theme = getColorTheme(profile.user2Color);
        return {
          cardBg: theme.cardBg,
          badgeBg: theme.badgeBg,
          ownerName: profile.user2Name,
          icon: <User className="w-3 h-3" />,
        };
      }
      case 'both':
      default: {
        const theme = getColorTheme(profile.bothColor);
        return {
          cardBg: theme.cardBg,
          badgeBg: theme.badgeBg,
          ownerName: 'Juntos',
          icon: <Users className="w-3 h-3" />,
        };
      }
    }
  };

  const ownerStyle = getOwnerStyles(event.owner);

  return (
    <div
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer w-full box-border overflow-hidden ${ownerStyle.cardBg}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          {/* Top metadata row: Owner tag, Category badge & baby routine badge */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Owner pill */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${ownerStyle.badgeBg}`}
            >
              {ownerStyle.icon}
              <span className="truncate max-w-[120px]">{ownerStyle.ownerName}</span>
            </span>

            {/* Category badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-white/80 ${categoryTheme.badgeBg}`}
            >
              <DynamicIcon name={categoryMeta.iconName} className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px]">{categoryMeta.label}</span>
            </span>

            {/* Baby task routine badge */}
            {event.babyTaskType === 'noche' && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                <Moon className="w-2.5 h-2.5 text-indigo-600" />
                <span>Noche</span>
              </span>
            )}
            {event.babyTaskType === 'comida' && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Utensils className="w-2.5 h-2.5 text-amber-600" />
                <span>Comida</span>
              </span>
            )}
            {event.babyTaskType === 'bano' && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                <Bath className="w-2.5 h-2.5 text-cyan-600" />
                <span>Baño</span>
              </span>
            )}
          </div>

          {/* Event title */}
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-950 transition leading-snug break-words">
            {event.title}
          </h3>
        </div>

        {/* Time Badge / Indicator */}
        <div className="shrink-0 flex flex-col items-end">
          {event.isAllDay ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold bg-white/90 text-neutral-700 shadow-2xs border border-neutral-200/70 whitespace-nowrap">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Todo el día</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/90 text-neutral-800 shadow-2xs border border-neutral-200/70 whitespace-nowrap">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span>
                {event.startTime}
                {event.endTime ? ` - ${event.endTime}` : ''}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
