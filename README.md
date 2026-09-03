# L&C Calendar — Calendario Minimalista para Parejas

Aplicación web **mobile-first** diseñada para que una pareja coordine su día a día sin fricción, con una estética ultra-visual, microinteracciones fluidas y sincronización en tiempo real.

---

## Características Principales

1. **Diseño Mobile-First Nativo**: Contenedor centrado (`max-w-md`) optimizado para pantallas de smartphone y navegación táctil.
2. **Cabecera Dinámica & Scrubber Semanal**:
   - Visualización del mes y año actual.
   - Selector interactivo de semanas (L, M, X, J, V, S, D) con indicador de eventos activos por día y botón de salto rápido a "Hoy".
3. **Filtro de Propietario Instantáneo**:
   - Segmented control estilo pill: **Todos** | **Persona 1** (ej. Lucas) | **Persona 2** (ej. Claudia).
   - Contadores en tiempo real por cada categoría.
4. **Vista Agenda Continua**:
   - Agrupada por fechas cronológicas ("Hoy - Jueves 3", "Mañana - Viernes 4", etc.).
   - Estado sutil **"Día despejado"** en fechas sin planes con acceso directo para añadir actividades.
   - Tarjetas de eventos personalizadas según el propietario:
     - **Persona 1**: Tinte azul pastel (`bg-sky-50 border-sky-200 text-sky-950`).
     - **Persona 2**: Tinte melocotón/rosa pastel (`bg-rose-50 border-rose-200 text-rose-950`).
     - **Ambos / Juntos**: Tinte lavanda pastel (`bg-purple-50 border-purple-200 text-purple-950`).
   - Badges de horario ("Todo el día" o rango `HH:mm - HH:mm`) e iconos temáticos de categoría: Logística, Deporte, Ocio, Salud, General.
5. **Modal Inferior Rápido (Bottom Sheet / Drawer)**:
   - Activado mediante el **Botón Flotante (+)** o pulsando directamente en cualquier día.
   - Permite crear, editar y eliminar eventos en un toque.
6. **Sincronización en Tiempo Real con Firebase Firestore**:
   - Suscripción reactiva con `onSnapshot` a la colección `events`.
   - **Tolerancia a fallos y Modo Demo**: Funciona de inmediato sin configuración previa mediante almacenamiento local reactivo, y se conecta automáticamente a Firestore en cuanto configures tus credenciales.
7. **Personalización de Nombres**: Posibilidad de cambiar los nombres de la pareja desde el modal de Ajustes.

---

## Modelo de Datos (Firestore)

Colección: `events`
```ts
interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm (opcional)
  endTime?: string; // Formato HH:mm (opcional)
  isAllDay: boolean;
  owner: 'user_1' | 'user_2' | 'both';
  category: 'general' | 'logistica' | 'ocio' | 'salud' | 'deporte';
  createdAt: number;
}
```

---

## Puesta en Marcha

### 1. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador (o emula vista de móvil con `Cmd+Option+I`).

### 2. Configurar Firebase (Opcional para persistencia remota)
Crea un archivo `.env.local` en la raíz copiando `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```
Puedes usar cualquiera de tus proyectos existentes en Firebase o crear uno nuevo.
