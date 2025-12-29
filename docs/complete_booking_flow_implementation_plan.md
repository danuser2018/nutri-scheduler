# [COMPLETED] Implementation Plan: Complete Booking Flow

## Goal

Implement the complete booking functionality that allows users to reserve appointments. The system will:
- Accept user information (name, email, phone, notes)
- Prevent double-bookings using SQLite as a locking mechanism
- Create events in Google Calendar
- Provide confirmation feedback to the user

## User Review Required

> [!IMPORTANT]
> **Database Choice**: Using SQLite for the MVP. This is suitable for a single-calendar service with moderate traffic. If you expect high concurrency or plan to scale to multiple calendars, we should discuss using PostgreSQL instead.

> [!WARNING]
> **Race Condition Mitigation**: The implementation uses a "reserve-then-confirm" pattern with database locks. There's a small window where a slot could be shown as available but fail during booking if two users click simultaneously. This is acceptable for an MVP but should be monitored.

## Proposed Changes

### Backend - Database Layer

#### [NEW] [backend/package.json](file:///home/danuser2018/workspace/nutri-scheduler/backend/package.json)
- Add `better-sqlite3` dependency for SQLite database

#### [NEW] [backend/src/config/database.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/config/database.js)
- Initialize SQLite database connection
- Create `bookings` table with schema:
  - `id` (INTEGER PRIMARY KEY)
  - `slot_start` (TEXT, ISO timestamp)
  - `slot_end` (TEXT, ISO timestamp)
  - `user_name` (TEXT)
  - `user_email` (TEXT)
  - `user_phone` (TEXT, optional)
  - `notes` (TEXT, optional)
  - `status` (TEXT: 'pending', 'confirmed', 'cancelled')
  - `google_event_id` (TEXT, nullable)
  - `created_at` (TEXT, ISO timestamp)

---

### Backend - Services

#### [NEW] [backend/src/services/bookingService.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/services/bookingService.js)
- `createBooking(slotStart, userData)`: Main booking logic
  1. Validate slot is in the future
  2. Check database for existing booking (status != 'cancelled')
  3. Create pending booking record (transaction)
  4. Call Google Calendar API to create event
  5. If successful: update booking to 'confirmed' and store event ID
  6. If failed: delete pending booking and throw error
- `getBookingById(id)`: Retrieve booking details
- `checkSlotAvailable(slotStart)`: Check if slot is free in DB

#### [MODIFY] [backend/src/services/googleCalendarService.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/services/googleCalendarService.js)
- Add `createEvent(startTime, endTime, summary, description, attendeeEmail)` method
  - Uses `calendar.events.insert()`
  - Returns Google event ID

---

### Backend - Controllers & Routes

#### [NEW] [backend/src/controllers/bookingController.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/controllers/bookingController.js)
- `POST /api/bookings` handler
  - Validate request body (name, email required; phone, notes optional)
  - Validate email format
  - Call `bookingService.createBooking()`
  - Return booking confirmation with ID

#### [MODIFY] [backend/src/index.js](file:///home/danuser2018/workspace/nutri-scheduler/backend/src/index.js)
- Register `POST /api/bookings` route

---

### Frontend - Components

#### [NEW] [frontend/src/components/BookingModal.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingModal.jsx)
- Modal dialog that appears when user clicks a time slot
- Form fields:
  - Name (required)
  - Email (required, with validation)
  - Phone (optional)
  - Notes (optional textarea)
- Submit button with loading state
- Cancel button to close modal

#### [NEW] [frontend/src/components/BookingModal.css](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingModal.css)
- Modal overlay and content styling
- Form input styling consistent with existing design
- Responsive layout

#### [MODIFY] [frontend/src/components/BookingPage.jsx](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/components/BookingPage.jsx)
- Add state for selected slot and modal visibility
- Handle slot button click to open modal
- Pass selected slot to BookingModal
- Handle booking confirmation (show success message, refresh availability)

#### [MODIFY] [frontend/src/api/client.js](file:///home/danuser2018/workspace/nutri-scheduler/frontend/src/api/client.js)
- Add `createBooking(slotStart, userData)` function
  - POST to `/api/bookings`
  - Returns booking confirmation

---

## Verification Plan

### Automated Tests

#### Backend Unit Tests
```bash
cd backend
npm test
```
Tests to create:
- `src/services/bookingService.test.js`:
  - Test successful booking creation
  - Test duplicate booking prevention
  - Test invalid slot (past date) rejection
  - Test Google Calendar API failure handling

#### Integration Test
```bash
cd backend
npm run test:integration
```
- Test complete flow: POST /api/bookings → DB insert → Google Calendar event creation
- Verify event appears in Google Calendar
- Verify database record matches

### Manual Verification

1. **Start both servers**:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Test booking flow**:
   - Open `http://localhost:5173`
   - Select a date (tomorrow or later)
   - Click on an available time slot
   - Fill in the form:
     - Name: "Test User"
     - Email: "test@example.com"
     - Phone: "+34 600 000 000" (optional)
     - Notes: "Test booking"
   - Click "Reservar"
   - Verify success message appears
   - Verify the slot disappears from available slots

3. **Verify in Google Calendar**:
   - Open Google Calendar in browser
   - Navigate to the booked date/time
   - Verify event exists with:
     - Correct time
     - Title containing user name
     - Description with user details

4. **Test race condition prevention**:
   - Open two browser windows side by side
   - Select the same slot in both
   - Try to submit booking in both simultaneously
   - Verify only one succeeds, the other shows "Slot already booked" error

5. **Test validation**:
   - Try submitting without name → should show error
   - Try submitting with invalid email → should show error
   - Try booking a past date → should show error
