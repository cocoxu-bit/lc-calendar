'use client';

import React from 'react';
import { CoupleProfile } from '@/types/calendar';
import { getColorTheme } from '@/lib/colors';

export type FilterOwnerType = 'all' | 'user_1' | 'user_2';

interface OwnerFilterProps {
  currentFilter: FilterOwnerType;
  onFilterChange: (filter: FilterOwnerType) => void;
  profile: CoupleProfile;
  counts: {
    all: number;
    user_1: number;
    user_2: number;
  };
}

export const OwnerFilter: React.FC<OwnerFilterProps> = ({
  currentFilter,
  onFilterChange,
  profile,
  counts,
}) => {
  const user1Theme = getColorTheme(profile.user1Color);
  const user2Theme = getColorTheme(profile.user2Color);

  return (
    <div className="w-full px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-xs border-b border-neutral-200/60 sticky top-[108px] z-20 box-border">
      <div className="flex p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/50 shadow-inner w-full min-w-0">
        {/* Todos */}
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
            currentFilter === 'all'
              ? 'bg-white text-neutral-900 shadow-xs scale-[1.01]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span className="truncate">Todos</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              currentFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-200/80 text-neutral-600'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* Persona 1 */}
        <button
          onClick={() => onFilterChange('user_1')}
          className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
            currentFilter === 'user_1'
              ? `${user1Theme.cardBg} shadow-xs scale-[1.01]`
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${user1Theme.indicator} shrink-0`} />
          <span className="truncate">{profile.user1Name}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              currentFilter === 'user_1'
                ? user1Theme.badgeBg
                : 'bg-neutral-200/80 text-neutral-600'
            }`}
          >
            {counts.user_1}
          </span>
        </button>

        {/* Persona 2 */}
        <button
          onClick={() => onFilterChange('user_2')}
          className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${
            currentFilter === 'user_2'
              ? `${user2Theme.cardBg} shadow-xs scale-[1.01]`
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${user2Theme.indicator} shrink-0`} />
          <span className="truncate">{profile.user2Name}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
              currentFilter === 'user_2'
                ? user2Theme.badgeBg
                : 'bg-neutral-200/80 text-neutral-600'
            }`}
          >
            {counts.user_2}
          </span>
        </button>
      </div>
    </div>
  );
};
