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

// Generate realistic initial couple & baby routines centered around today
export function getInitialSampleEvents(): CalendarEvent[] {
  const now = new Date();

  const d0 = new Date(now);
  const d1 = new Date(now);
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date(now);
  d2.setDate(d2.getDate() + 2);
  const d3 = new Date(now);
  d3.setDate(d3.getDate() + 3);

  const date0 = formatDateKey(d0);
  const date1 = formatDateKey(d1);
  const date2 = formatDateKey(d2);
  const date3 = formatDateKey(d3);

  return [
    {
      id: 'demo-1',
      title: 'Desayuno & Biberón de la mañana 🍼',
      date: date0,
      startTime: '08:00',
      endTime: '08:45',
      isAllDay: false,
      owner: 'user_2', // Josefina
      category: 'bebe',
      babyTaskType: 'comida',
      createdAt: Date.now() - 10000,
    },
    {
      id: 'demo-2',
      title: 'Pádel / Running con amigos 🎾',
      date: date0,
      startTime: '18:00',
      endTime: '19:15',
      isAllDay: false,
      owner: 'user_1', // Lucas
      category: 'deporte',
      createdAt: Date.now() - 9000,
    },
    {
      id: 'demo-3',
      title: 'Turno de noche con el peque 🌙',
      date: date0,
      startTime: '23:30',
      endTime: '07:30',
      isAllDay: false,
      owner: 'user_1', // Lucas se queda esta noche
      category: 'bebe',
      babyTaskType: 'noche',
      createdAt: Date.now() - 8000,
    },
    {
      id: 'demo-4',
      title: 'Llevar a la guardería 🎒',
      date: date1,
      startTime: '09:00',
      endTime: '09:30',
      isAllDay: false,
      owner: 'user_1', // Lucas
      category: 'bebe',
      babyTaskType: 'guarderia',
      createdAt: Date.now() - 7000,
    },
    {
      id: 'demo-5',
      title: 'Puré de verduras & Comida del peque 🥣',
      date: date1,
      startTime: '13:00',
      endTime: '14:00',
      isAllDay: false,
      owner: 'user_2', // Josefina
      category: 'bebe',
      babyTaskType: 'comida',
      createdAt: Date.now() - 6000,
    },
    {
      id: 'demo-6',
      title: 'Baño y rutina relajante antes de dormir 🛁',
      date: date1,
      startTime: '20:00',
      endTime: '20:45',
      isAllDay: false,
      owner: 'both', // Juntos
      category: 'bebe',
      babyTaskType: 'bano',
      createdAt: Date.now() - 5500,
    },
    {
      id: 'demo-7',
      title: 'Turno de noche con el peque 🌙',
      date: date1,
      startTime: '23:30',
      endTime: '07:30',
      isAllDay: false,
      owner: 'user_2', // Josefina se queda la noche siguiente
      category: 'bebe',
      babyTaskType: 'noche',
      createdAt: Date.now() - 5000,
    },
    {
      id: 'demo-8',
      title: 'Revisión 6 meses Pediatra 🩺',
      date: date2,
      startTime: '11:00',
      endTime: '12:00',
      isAllDay: false,
      owner: 'both',
      category: 'bebe',
      babyTaskType: 'pediatra',
      createdAt: Date.now() - 4000,
    },
    {
      id: 'demo-9',
      title: 'Paseo en familia por el parque 🌳',
      date: date3,
      startTime: '11:30',
      endTime: '13:30',
      isAllDay: false,
      owner: 'both',
      category: 'ocio',
      createdAt: Date.now() - 3000,
    },
  ];
}

// LocalStorage helpers
function getLocalEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    const initial = getInitialSampleEvents();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalEvents(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent(LOCAL_CHANGE_EVENT));
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
