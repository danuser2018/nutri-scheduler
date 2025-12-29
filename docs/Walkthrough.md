# Nutri-Scheduler MVP - Walkthrough

## Resumen

Se está implementando el primer MVP de **Nutri-Scheduler**, una aplicación web de reservas integrada con Google Calendar.

## Funcionalidades Implementadas

### Backend (Node.js + Express)

#### Configuración
- ✅ Integración con Google Calendar API mediante Service Account
- ✅ Configuración de horario comercial (L-V, 9:00-17:00)
- ✅ Zona horaria configurable (`Europe/Madrid`)
- ✅ Duración de citas configurable (60 minutos)

#### Endpoints
- `GET /api/health` - Health check del servidor
- `GET /api/availability?from={ISO_DATE}&to={ISO_DATE}` - Consulta de disponibilidad
- `POST /api/bookings` - Creación de nuevas reservas

#### Servicios
- **GoogleCalendarService**: Consulta períodos ocupados mediante la API `freebusy` y crea eventos.
- **AvailabilityService**: Calcula slots disponibles cruzando horario comercial con eventos de Google Calendar.
- **BookingService**: Gestiona la lógica de reserva, validación, persistencia en SQLite y coordinación con Google.

### Frontend (React + Vite)

#### Componentes
- **BookingPage**: Página principal con calendario interactivo y visualización de horarios.
- **BookingModal**: Formulario modal para capturar datos del usuario (Nombre, Email, Teléfono, Notas).
- Selector de fecha usando `react-day-picker`.
- Grid de horarios disponibles.
- Manejo de estados (loading, error, sin disponibilidad, éxito).

#### Características
- Calendario en español con locale de `date-fns`.
- Días pasados deshabilitados.
- Visualización de horarios en formato 24h.
- Proxy configurado en Vite para evitar CORS.
- **Validación**: Frontend (HTML5) y Backend (Regex estricto para emails, comprobación de integridad).

## Validación Realizada

### Test de Integración Google Calendar
```bash
npm run test:google
```
**Resultado**: ✅ Connection Successful

### Test de Endpoint de Disponibilidad
```bash
curl "http://localhost:3000/api/availability?from=2025-12-24T08:00:00Z&to=2025-12-24T18:00:00Z"
```
**Resultado**: JSON con slots disponibles.

### Test de Flujo de Reserva
1. Usuario selecciona slot.
2. Rellena formulario en BookingModal.
3. Se crea registro 'pending' en SQLite.
4. Se crea evento en Google Calendar.
5. Se confirma registro en SQLite.
6. Frontend muestra mensaje de éxito.

### Test Frontend
- ✅ Servidor corriendo en `http://localhost:5173`
- ✅ Calendario renderizado correctamente
- ✅ Selección de fecha funcional
- ✅ Carga de horarios disponibles desde el backend
- ✅ Reserva exitosa y actualización de disponibilidad

## Archivos Clave Creados

### Backend
- [src/index.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/index.js) - Servidor Express principal
- [src/config/google.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/config/google.js) - Cliente Google Calendar API
- [src/services/bookingService.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/services/bookingService.js) - **Nuevo**: Lógica de reservas
- [src/controllers/bookingController.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/controllers/bookingController.js) - **Nuevo**: Controlador de reservas
- [src/constants/bookingStatus.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/constants/bookingStatus.js) - **Nuevo**: Constantes de estado

### Frontend
- [src/components/BookingPage.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingPage.jsx) - Página de reservas (actualizada)
- [src/components/BookingModal.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingModal.jsx) - **Nuevo**: Modal de formulario
- [src/api/client.js](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/api/client.js) - Cliente HTTP (actualizado con `createBooking`)

## Estado del Proyecto

**Estado Actual**: MVP Funcional Completado 🚀

El flujo de reservas está totalmente implementado y probado, incluyendo:
- Persistencia en BD (SQLite)
- Sincronización real con Google Calendar
- Interfaz de usuario completa

**Próximos Pasos (Post-MVP)**:
1. Emails de confirmación (Nodemailer/SendGrid)
2. Panel de administración para ver reservas
3. Cancelación de citas por parte del usuario

