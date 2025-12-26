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

#### Servicios
- **GoogleCalendarService**: Consulta períodos ocupados mediante la API `freebusy`
- **AvailabilityService**: Calcula slots disponibles cruzando horario comercial con eventos de Google Calendar

### Frontend (React + Vite)

#### Componentes
- **BookingPage**: Página principal con calendario interactivo y visualización de horarios
- Selector de fecha usando `react-day-picker`
- Grid de horarios disponibles
- Manejo de estados (loading, error, sin disponibilidad)

#### Características
- Calendario en español con locale de `date-fns`
- Días pasados deshabilitados
- Visualización de horarios en formato 24h
- Proxy configurado en Vite para evitar CORS

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
**Resultado**: 
```json
{
  "availableSlots": [
    "2025-12-24T08:00:00.000Z",
    "2025-12-24T09:00:00.000Z",
    "2025-12-24T10:00:00.000Z",
    ...
  ]
}
```

### Test Frontend
- ✅ Servidor corriendo en `http://localhost:5173`
- ✅ Calendario renderizado correctamente
- ✅ Selección de fecha funcional
- ✅ Carga de horarios disponibles desde el backend
- ✅ Visualización de slots en formato local (HH:mm)

## Archivos Clave Creados

### Backend
- [src/index.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/index.js) - Servidor Express principal
- [src/config/google.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/config/google.js) - Cliente Google Calendar API
- [src/config/settings.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/config/settings.js) - Configuración del negocio
- [src/services/googleCalendarService.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/services/googleCalendarService.js) - Servicio Google Calendar
- [src/services/availabilityService.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/services/availabilityService.js) - Lógica de disponibilidad
- [src/controllers/availabilityController.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/controllers/availabilityController.js) - Controlador HTTP

### Frontend
- [src/App.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/App.jsx) - Componente raíz
- [src/components/BookingPage.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingPage.jsx) - Página de reservas
- [src/components/BookingPage.css](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingPage.css) - Estilos
- [src/api/client.js](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/api/client.js) - Cliente HTTP
- [vite.config.js](file:///home/danuser2018/workspace/nutri-scheduler/frontend/vite.config.js) - Configuración con proxy

## Próximos Pasos Sugeridos

Para completar el MVP funcional, se recomienda:

1. **Implementar el flujo de reserva completo** (`POST /api/bookings`)
   - Crear endpoint para confirmar reservas
   - Crear evento en Google Calendar
   - Añadir base de datos SQLite para prevenir condiciones de carrera
   - Formulario de datos del usuario (nombre, email, teléfono)

2. **Mejorar la UI**
   - Añadir modal/formulario al hacer clic en un slot
   - Página de confirmación de reserva
   - Mejoras estéticas (gradientes, animaciones)

3. **Manejo de errores robusto**
   - Validación de datos en backend
   - Mensajes de error más descriptivos
   - Retry logic para llamadas a Google API

4. **Testing**
   - Tests unitarios para servicios
   - Tests de integración para endpoints
   - Tests E2E con Playwright/Cypress

## Estado del Proyecto

**Rama actual**: `feat/booking-flow`

Se está desarrollando el punto 1: Implementar el flujo de reserva completo (`POST /api/bookings`)

**Servidores en ejecución**:
- Backend: `http://localhost:3000` (nodemon)
- Frontend: `http://localhost:5173` (Vite)
