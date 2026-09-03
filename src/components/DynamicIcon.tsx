'use client';

import React from 'react';
import {
  Baby,
  Moon,
  Utensils,
  Bath,
  Package,
  Activity,
  Coffee,
  HeartPulse,
  Calendar,
  PawPrint,
  Home,
  Briefcase,
  ShoppingBag,
  Plane,
  Book,
  Sparkles,
  Dumbbell,
  Music,
  Car,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Baby,
  Moon,
  Utensils,
  Bath,
  Package,
  Activity,
  Coffee,
  HeartPulse,
  Calendar,
  PawPrint,
  Home,
  Briefcase,
  ShoppingBag,
  Plane,
  Book,
  Sparkles,
  Dumbbell,
  Music,
  Car,
  UtensilsCrossed,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = ICON_MAP[name] || Calendar;
  return <IconComponent className={className} />;
};
