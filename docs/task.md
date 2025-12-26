# Nutri-Scheduler - Task List

## ✅ Completed

- [x] Configuración inicial del proyecto
  - [x] Estructura de carpetas backend/frontend
  - [x] Instalación de dependencias
  - [x] Configuración de Google Calendar API
  - [x] Verificación de credenciales

- [x] Backend: Lógica de disponibilidad
  - [x] Servicio Google Calendar (freebusy)
  - [x] Servicio de cálculo de slots disponibles
  - [x] Endpoint GET /api/availability
  - [x] Configuración de horario comercial

- [x] Frontend: Interfaz de calendario
  - [x] Componente BookingPage con react-day-picker
  - [x] Integración con API de disponibilidad
  - [x] Estilos del calendario (días de semana, mes/año)
  - [x] Visualización de slots disponibles

## 🔄 En Progreso

- [x] Backend: Sistema de reservas completo
  - [x] Configurar base de datos SQLite
  - [x] Modelo de datos para reservas
  - [/] Servicio de creación de eventos en Google Calendar
  - [x] Endpoint POST /api/bookings con manejo de concurrencia
  - [x] Validación de datos del usuario

- [/] Frontend: Flujo de reserva
  - [/] Modal/formulario de reserva al hacer clic en slot
  - [ ] Captura de datos del usuario (nombre, email, teléfono, notas)
  - [ ] Validación de formulario
  - [ ] Página de confirmación de reserva
  - [ ] Manejo de errores (slot ya ocupado, etc.)

## 📋 Pendiente

- [ ] Testing
  - [ ] Tests unitarios backend
  - [ ] Tests de integración
  - [ ] Tests E2E frontend

- [ ] Mejoras opcionales
  - [ ] Emails de confirmación
  - [ ] Recordatorios automáticos
  - [ ] Panel de administración
  - [ ] Cancelación de citas
