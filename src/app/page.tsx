'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { OwnerFilter, FilterOwnerType } from '@/components/OwnerFilter';
import { ViewSelector, CalendarViewMode } from '@/components/ViewSelector';
import { AgendaList } from '@/components/AgendaList';
import { HorizontalCalendarView } from '@/components/HorizontalCalendarView';
import { EventSheet } from '@/components/EventSheet';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { SettingsModal } from '@/components/SettingsModal';
import {
  CalendarEvent,
  CoupleProfile,
  DEFAULT_COUPLE,
} from '@/types/calendar';
import {
  subscribeToEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/eventsService';
import {
  toDateString,
  getAgendaDatesWindow,
  getThreeDaysDates,
  getWeekDatesWindow,
  parseDateString,
} from '@/lib/dateUtils';
import { addDays } from 'date-fns';
import {
  getStoredProfile,
  saveStoredProfile,
  subscribeToProfile,
} from '@/lib/profileStorage';

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLiveFirestore, setIsLiveFirestore] = useState(false);
  const [profile, setProfile] = useState<CoupleProfile>(DEFAULT_COUPLE);
  const [filter, setFilter] = useState<FilterOwnerType>('all');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('agenda');

  const todayStr = useMemo(() => toDateString(new Date()), []);
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Modal controls
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [sheetDate, setSheetDate] = useState<string>(todayStr);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load profile
  useEffect(() => {
    setProfile(getStoredProfile());
    const unsub = subscribeToProfile((updated) => setProfile(updated));
    return () => unsub();
  }, []);

  // Subscribe to real-time events (Firestore or fallback to LocalStorage)
  useEffect(() => {
    const unsub = subscribeToEvents((data, isLive) => {
      setEvents(data);
      setIsLiveFirestore(isLive);
    });
    return () => unsub();
  }, []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    if (filter === 'user_1') {
      return events.filter((e) => e.owner === 'user_1' || e.owner === 'both');
    }
    if (filter === 'user_2') {
      return events.filter((e) => e.owner === 'user_2' || e.owner === 'both');
    }
    return events;
  }, [events, filter]);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const all = events.length;
    const user_1 = events.filter((e) => e.owner === 'user_1' || e.owner === 'both').length;
    const user_2 = events.filter((e) => e.owner === 'user_2' || e.owner === 'both').length;
    return { all, user_1, user_2 };
  }, [events]);

  // Set of dates that have events (for week scrubber dot indicators)
  const eventDatesSet = useMemo(() => {
    const set = new Set<string>();
    filteredEvents.forEach((e) => {
      if (e.date) set.add(e.date);
    });
    return set;
  }, [filteredEvents]);

  // Window of dates depending on current viewMode:
  // - 'agenda': starts strictly from today
  // - '3days': exactly 3 horizontal day columns starting from selectedDate
  // - 'week': the 7 horizontal day columns of the current week anchor (Monday to Sunday)
  const displayedDates = useMemo(() => {
    if (viewMode === '3days') {
      const anchor = parseDateString(selectedDate || todayStr);
      return getThreeDaysDates(anchor);
    }

    if (viewMode === 'week') {
      return getWeekDatesWindow(currentWeekAnchor);
    }

    // Default 'agenda' view: starts strictly from today
    const baseWindow = getAgendaDatesWindow(new Date(), 14);
    const dateSet = new Set(baseWindow);
    filteredEvents.forEach((e) => {
      if (e.date && e.date >= todayStr) {
        dateSet.add(e.date);
      }
    });
    return Array.from(dateSet).sort();
  }, [viewMode, selectedDate, todayStr, currentWeekAnchor, filteredEvents]);

  // Group events by date, sorting each day's events: allDay first, then by startTime
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });

    // Sort within each day
    Object.keys(map).forEach((dateKey) => {
      map[dateKey].sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
    });

    return map;
  }, [filteredEvents]);

  // Handlers
  const handleOpenCreateSheet = (targetDate?: string) => {
    setEditingEvent(null);
    setSheetDate(targetDate || selectedDate || todayStr);
    setIsSheetOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSheetDate(event.date);
    setIsSheetOpen(true);
  };

  const handleSaveEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt'>,
    eventId?: string
  ) => {
    if (eventId) {
      await updateEvent(eventId, eventData);
    } else {
      await createEvent(eventData);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const handleResetToToday = () => {
    const now = new Date();
    setCurrentWeekAnchor(now);
    setSelectedDate(todayStr);
  };

  const handleShiftRange = (direction: -1 | 1) => {
    if (viewMode === '3days') {
      const current = parseDateString(selectedDate || todayStr);
      const nextDate = addDays(current, direction * 3);
      setSelectedDate(toDateString(nextDate));
    } else if (viewMode === 'week') {
      const nextWeek = addDays(currentWeekAnchor, direction * 7);
      setCurrentWeekAnchor(nextWeek);
      setSelectedDate(toDateString(nextWeek));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center selection:bg-neutral-900 selection:text-white overflow-x-hidden">
      {/* Mobile Frame Container (Strictly bounded, zero accidental horizontal scroll) */}
      <main className="w-full max-w-md min-h-screen bg-neutral-50 text-neutral-900 shadow-2xl relative flex flex-col font-sans border-x border-neutral-200/60 overflow-x-hidden box-border">
        {/* Header with week scrubber */}
        <Header
          currentWeekAnchor={currentWeekAnchor}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onWeekChange={setCurrentWeekAnchor}
          onResetToToday={handleResetToToday}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isLiveFirestore={isLiveFirestore}
          eventDatesSet={eventDatesSet}
          profile={profile}
        />

        {/* View Switcher [Agenda | 3 Días | Semana] */}
        <ViewSelector
          currentView={viewMode}
          onViewChange={setViewMode}
        />

        {/* Filter by owner [Todos | Lucas | Josefina] */}
        <OwnerFilter
          currentFilter={filter}
          onFilterChange={setFilter}
          profile={profile}
          counts={counts}
        />

        {/* Dynamic View: Continuous Vertical Agenda OR Multi-Column Horizontal Views */}
        {viewMode === 'agenda' ? (
          <AgendaList
            dates={displayedDates}
            eventsByDate={eventsByDate}
            profile={profile}
            selectedDate={selectedDate}
            onEventClick={handleEditEvent}
            onQuickAddDate={(dateStr) => handleOpenCreateSheet(dateStr)}
          />
        ) : (
          <HorizontalCalendarView
            mode={viewMode}
            dates={displayedDates}
            eventsByDate={eventsByDate}
            profile={profile}
            selectedDate={selectedDate}
            onEventClick={handleEditEvent}
            onQuickAddDate={(dateStr) => handleOpenCreateSheet(dateStr)}
            onShiftRange={handleShiftRange}
          />
        )}

        {/* Floating Action Button (+) */}
        <FloatingActionButton onClick={() => handleOpenCreateSheet()} />

        {/* Event Sheet Modal */}
        <EventSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          editingEvent={editingEvent}
          initialDate={sheetDate}
          profile={profile}
        />

        {/* Couple Profile & Full Customization Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSaveProfile={saveStoredProfile}
          isLiveFirestore={isLiveFirestore}
        />
      </main>
    </div>
  );
}
