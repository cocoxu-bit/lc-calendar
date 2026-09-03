'use client';

import React from 'react';
import { CoupleProfile } from '@/types/calendar';

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
  return (
    <div className="px-4 py-2.5 bg-white/70 backdrop-blur-xs border-b border-neutral-200/60 sticky top-[108px] z-20">
      <div className="flex p-1 bg-neutral-100/90 rounded-2xl border border-neutral-200/50 shadow-inner">
        {/* Todos */}
        <button
          onClick={() => onFilterChange('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            currentFilter === 'all'
              ? 'bg-white text-neutral-900 shadow-xs scale-[1.01]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Todos</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            currentFilter === 'user_1'
              ? 'bg-sky-50 text-sky-950 border border-sky-200/80 shadow-xs scale-[1.01]'
              : 'text-neutral-500 hover:text-sky-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span className="truncate max-w-[80px]">{profile.user1Name}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              currentFilter === 'user_1'
                ? 'bg-sky-200 text-sky-900'
                : 'bg-neutral-200/80 text-neutral-600'
            }`}
          >
            {counts.user_1}
          </span>
        </button>

        {/* Persona 2 */}
        <button
          onClick={() => onFilterChange('user_2')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            currentFilter === 'user_2'
              ? 'bg-rose-50 text-rose-950 border border-rose-200/80 shadow-xs scale-[1.01]'
              : 'text-neutral-500 hover:text-rose-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="truncate max-w-[80px]">{profile.user2Name}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              currentFilter === 'user_2'
                ? 'bg-rose-200 text-rose-900'
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
