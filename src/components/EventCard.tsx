'use client';

import React from 'react';
import {
  CalendarEvent,
  CoupleProfile,
  CATEGORY_CONFIG,
  EventOwner,
} from '@/types/calendar';
import {
  Clock,
  Sun,
  Package,
  Activity,
  Coffee,
  HeartPulse,
  Calendar,
  Users,
  User,
  Baby,
  Moon,
  Utensils,
  Bath,
} from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  profile: CoupleProfile;
  onClick: (event: CalendarEvent) => void;
}

const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  switch (iconName) {
    case 'Baby':
      return <Baby className={className} />;
    case 'Package':
      return <Package className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Coffee':
      return <Coffee className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Calendar':
    default:
      return <Calendar className={className} />;
  }
};

export const EventCard: React.FC<EventCardProps> = ({ event, profile, onClick }) => {
  const categoryMeta = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.general;

  // Exact styles requested by user
  const getOwnerStyles = (owner: EventOwner) => {
    switch (owner) {
      case 'user_1':
        return {
          cardBg: 'bg-sky-50 border-sky-200 text-sky-950 hover:border-sky-300',
          badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-200',
          indicator: 'bg-sky-500',
          ownerName: profile.user1Name,
          icon: <User className="w-3 h-3 text-sky-600" />,
        };
      case 'user_2':
        return {
          cardBg: 'bg-rose-50 border-rose-200 text-rose-950 hover:border-rose-300',
          badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-200',
          indicator: 'bg-rose-500',
          ownerName: profile.user2Name,
          icon: <User className="w-3 h-3 text-rose-600" />,
        };
      case 'both':
      default:
        return {
          cardBg: 'bg-purple-50 border-purple-200 text-purple-950 hover:border-purple-300',
          badgeBg: 'bg-purple-100/90 text-purple-900 border-purple-200',
          indicator: 'bg-purple-500',
          ownerName: 'Juntos',
          icon: <Users className="w-3 h-3 text-purple-600" />,
        };
    }
  };

  const ownerStyle = getOwnerStyles(event.owner);

  return (
    <div
      onClick={() => onClick(event)}
      role="button"
      tabIndex={0}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer ${ownerStyle.cardBg}`}
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
              <span className="truncate max-w-[100px]">{ownerStyle.ownerName}</span>
            </span>

            {/* Category badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-white/70 ${categoryMeta.badgeBg}`}
            >
              <CategoryIcon iconName={categoryMeta.iconName} className="w-3 h-3 shrink-0" />
              <span>{categoryMeta.label}</span>
            </span>

            {/* Special baby task badge */}
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
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-950 transition leading-snug">
            {event.title}
          </h3>
        </div>

        {/* Time Badge / Indicator */}
        <div className="shrink-0 flex flex-col items-end">
          {event.isAllDay ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold bg-white/90 text-neutral-700 shadow-2xs border border-neutral-200/70">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Todo el día</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/90 text-neutral-800 shadow-2xs border border-neutral-200/70">
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
