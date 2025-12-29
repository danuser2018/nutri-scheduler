const db = require('../config/database');
const googleService = require('./googleCalendarService');
const settings = require('../config/settings');
const { addMinutes, parseISO, isBefore } = require('date-fns');
const BookingStatus = require('../constants/bookingStatus');

class BookingService {
    /**
     * Create a new booking
     */
    async createBooking(slotStartIso, userData) {
        // 0. Defensive Validation
        if (!userData || !userData.email || !userData.name) {
            throw new Error('Datos de usuario incompletos (nombre y email son obligatorios).');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('El formato de email proporcionado no es válido.');
        }

        const slotStart = parseISO(slotStartIso);
        const slotEnd = addMinutes(slotStart, settings.appointmentDuration);

        // 1. Basic validation: future date
        if (isBefore(slotStart, new Date())) {
            throw new Error('No se pueden reservar citas en el pasado.');
        }

        // 2. Coordination Pattern: Reserve-then-Confirm (Saga-like)
        // We create a 'pending' record first to lock the slot, then confirm after external API success.
        const insert = db.prepare(`
      INSERT INTO bookings (slot_start, slot_end, user_name, user_email, user_phone, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, '${BookingStatus.PENDING}')
    `);

        // Check if already exists in DB
        const existing = db.prepare(`SELECT id FROM bookings WHERE slot_start = ? AND status != '${BookingStatus.CANCELLED}'`).get(slotStartIso);
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
                description
            );

            // 4. Update status to confirmed and store event ID
            db.prepare(`UPDATE bookings SET status = '${BookingStatus.CONFIRMED}', google_event_id = ? WHERE id = ?`)
                .run(gEvent.id, bookingId);

            return {
                id: bookingId,
                googleEventId: gEvent.id,
                ...userData,
                slotStart: slotStartIso
            };

        } catch (err) {
            // Compensating Action: Rollback/Cleanup the pending record if Google Calendar sync fails
            db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
            console.error('Error creating Google Calendar event:', {
                message: err.message,
                status: err.status,
                details: err.response ? err.response.data : 'No details available'
            });
            throw new Error('Error al sincronizar con Google Calendar. La reserva no se ha completado.');
        }
    }
}

module.exports = new BookingService();
