import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CalendarEvent } from '@/types/calendar';

const LOCAL_STORAGE_KEY = 'lc_calendar_events_local_v2';
const LOCAL_CHANGE_EVENT = 'lc_calendar_local_change';

// Helper to format date YYYY-MM-DD
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial events for empty state (empty by default for real usage)
export function getInitialSampleEvents(): CalendarEvent[] {
  return [];
}

// LocalStorage helpers
function getLocalEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try {
    const list: CalendarEvent[] = JSON.parse(stored);
    // Automatically purge any sample/demo events so user starts clean
    const cleaned = list.filter((e) => !e.id?.startsWith('demo-'));
    if (cleaned.length !== list.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveLocalEvents(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent(LOCAL_CHANGE_EVENT));
}

// Clear all events completely
export function clearAllEvents(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(LOCAL_CHANGE_EVENT));
  }
}

// Subscribe to events (realtime Firestore with fallback to LocalStorage)
export function subscribeToEvents(
  onUpdate: (events: CalendarEvent[], isLiveFirestore: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const events: CalendarEvent[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            events.push({
              id: docSnap.id,
              title: data.title || '',
              date: data.date || '',
              startTime: data.startTime || '',
              endTime: data.endTime || '',
              isAllDay: Boolean(data.isAllDay),
              owner: data.owner || 'both',
              category: data.category || 'general',
              babyTaskType: data.babyTaskType,
              notes: data.notes,
              createdAt: data.createdAt || Date.now(),
            });
          });
          onUpdate(events, true);
        },
        (err) => {
          console.warn('Firestore subscription fallback to local storage:', err);
          if (onError) onError(err);
          onUpdate(getLocalEvents(), false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Error creating Firestore listener:', err);
    }
  }

  // Local mode
  const handleLocalChange = () => {
    onUpdate(getLocalEvents(), false);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(LOCAL_CHANGE_EVENT, handleLocalChange);
    window.addEventListener('storage', handleLocalChange);
    setTimeout(() => {
      onUpdate(getLocalEvents(), false);
    }, 0);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(LOCAL_CHANGE_EVENT, handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
    }
  };
}

// Add new event
export async function createEvent(
  eventData: Omit<CalendarEvent, 'id' | 'createdAt'>
): Promise<string> {
  const fullData: Omit<CalendarEvent, 'id'> = {
    ...eventData,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'events'), fullData);
      return docRef.id;
    } catch (err) {
      console.error('Error adding doc to Firestore, falling back to local:', err);
    }
  }

  // Local storage fallback
  const localList = getLocalEvents();
  const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newEvent: CalendarEvent = {
    ...fullData,
    id,
  };
  saveLocalEvents([...localList, newEvent]);
  return id;
}

// Update existing event
export async function updateEvent(
  id: string,
  updates: Partial<CalendarEvent>
): Promise<void> {
  if (isFirebaseConfigured && db && !id.startsWith('demo-') && !id.startsWith('local-')) {
    try {
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, updates);
      return;
    } catch (err) {
      console.error('Error updating Firestore doc:', err);
    }
  }

  // Local storage
  const localList = getLocalEvents();
  const index = localList.findIndex((e) => e.id === id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...updates };
    saveLocalEvents([...localList]);
  }
}

// Delete event
export async function deleteEvent(id: string): Promise<void> {
  if (isFirebaseConfigured && db && !id.startsWith('demo-') && !id.startsWith('local-')) {
    try {
      const docRef = doc(db, 'events', id);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.error('Error deleting Firestore doc:', err);
    }
  }

  // Local storage
  const localList = getLocalEvents();
  const filtered = localList.filter((e) => e.id !== id);
  saveLocalEvents(filtered);
}
