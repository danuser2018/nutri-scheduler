const db = require('../config/database');
const googleService = require('./googleCalendarService');
const settings = require('../config/settings');
const { addMinutes, parseISO, isBefore } = require('date-fns');

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(slotStartIso, userData) {
        const slotStart = parseISO(slotStartIso);
        const slotEnd = addMinutes(slotStart, settings.appointmentDuration);

        // 1. Basic validation: future date
        if (isBefore(slotStart, new Date())) {
            throw new Error('No se pueden reservar citas en el pasado.');
        }

        // 2. Database lock/check (Race condition prevention)
        // We use a transaction to ensure atomicity
        const insert = db.prepare(`
      INSERT INTO bookings (slot_start, slot_end, user_name, user_email, user_phone, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);

        // Check if already exists in DB
        const existing = db.prepare("SELECT id FROM bookings WHERE slot_start = ? AND status != 'cancelled'").get(slotStartIso);
        if (existing) {
            throw new Error('Este horario ya ha sido reservado por otra persona.');
        }

        let bookingId;
        try {
            const result = insert.run(
                slotStartIso,
                slotEnd.toISOString(),
                userData.name,
                userData.email,
                userData.phone || null,
                userData.notes || null
            );
            bookingId = result.lastInsertRowid;
        } catch (err) {
            if (err.message.includes('UNIQUE')) {
                throw new Error('Este horario ya ha sido reservado.');
            }
            throw err;
        }

        // 3. Create Google Calendar Event
        try {
            const summary = `Cita: ${userData.name}`;
            const description = `Nombre: ${userData.name}\nEmail: ${userData.email}\nTeléfono: ${userData.phone || 'N/A'}\nNotas: ${userData.notes || ''}`;

            const gEvent = await googleService.createEvent(
                slotStart,
                slotEnd,
                summary,
                description,
                userData.email
            );

            // 4. Update status to confirmed and store event ID
            db.prepare("UPDATE bookings SET status = 'confirmed', google_event_id = ? WHERE id = ?")
                .run(gEvent.id, bookingId);

            return {
                id: bookingId,
                googleEventId: gEvent.id,
                ...userData,
                slotStart: slotStartIso
            };

        } catch (err) {
            // Rollback: delete the pending record if Google fails
            db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
            console.error('Error creating Google Calendar event:', err);
            throw new Error('Error al sincronizar con Google Calendar. La reserva no se ha completado.');
        }
    }
}

module.exports = new BookingService();
