# Nutri-Scheduler

Sistema de reservas de citas automatizado integrado con Google Calendar. Diseñado para permitir a los usuarios consultar disponibilidad y agendar citas que se sincronizan automáticamente con el calendario del propietario.

## 📋 Contexto y Alcance (MVP)

Este proyecto es un MVP (Producto Mínimo Viable) con las siguientes características:
- **Un solo calendario:** Gestiona las citas de un único proveedor de servicios.
- **Sin cuentas de usuario:** Los clientes no necesitan registrarse ni tener cuenta de Google.
- **Duración fija:** Todas las citas tienen una duración predefinida (configurable).
- **Integración Backend:** Toda la comunicación con Google Calendar se realiza desde el servidor usando una Service Account.
- **Persistencia y Seguridad:** Uso de SQLite para gestión de estado y prevención de reservas duplicadas (concurrencia).

## 🏗 Arquitectura

El sistema utiliza una arquitectura cliente-servidor desacoplada:

- **Frontend:** React + Vite (SPA). Interfaz rápida y reactiva.
- **Backend:** Node.js + Express. API RESTful.
- **Base de Datos:** SQLite. Gestión de bloqueos temporales (concurrencia) y metadatos de citas.
- **Integración:** Google Calendar API (Service Account).

### Flujo Principal
### Flujo Principal
1. **Disponibilidad:** El backend calcula huecos libres cruzando el horario comercial definido con los eventos ocupados ("busy") de Google Calendar.
2. **Reserva (Saga Pattern):** 
   - Se crea reserva 'pending' en SQLite (lock).
   - Se crea el evento en Google Calendar.
   - Si éxito: Se confirma reserva ('confirmed').
   - Si fallo: Se elimina reserva (rollback).

## 📂 Estructura del Proyecto

```text
/nutri-scheduler
├── /backend        # API Node.js/Express
├── /frontend       # Aplicación React/Vite
└── /docs           # Documentación adicional
```

## 🚀 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Google Cloud Platform (para la API de Calendar)

## 🛠 Configuración Inicial

*(Las instrucciones detalladas de instalación se añadirán conforme avance el desarrollo)*

1. Clonar el repositorio.
2. **Backend**:
   - `cd backend`
   - `cp .env.example .env` y rellenar credenciales.
   - `npm install`
   - `npm run dev` (iniciará servidor y creará DB SQLite automáticamente).
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## 📄 Licencia

Ver archivo [LICENSE](LICENSE).