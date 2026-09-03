'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 inset-x-0 max-w-md mx-auto pointer-events-none flex justify-end px-5 z-30">
      <button
        onClick={onClick}
        aria-label="Crear nuevo evento"
        className="pointer-events-auto w-14 h-14 rounded-full bg-neutral-900 text-white shadow-xl shadow-neutral-900/25 flex items-center justify-center hover:bg-neutral-800 active:scale-90 transition-all duration-200 ring-4 ring-white group"
      >
        <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
      </button>
    </div>
  );
};
