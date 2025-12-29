require('dotenv').config();
const googleService = require('./googleCalendarService');
const bookingService = require('./bookingService');
const db = require('../config/database');
const { addDays, format, addMinutes } = require('date-fns');
const BookingStatus = require('../constants/bookingStatus');

describe('BookingService', () => {
    let testSlot;
    const userData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        notes: 'Test notes'
    };

    beforeEach(() => {
        // Clear database before each test
        db.prepare('DELETE FROM bookings').run();

        // Reset all spies
        vi.restoreAllMocks();

        // Create a future slot (tomorrow at 10 AM)
        const tomorrow = addDays(new Date(), 1);
        tomorrow.setHours(10, 0, 0, 0);
        testSlot = tomorrow.toISOString();
    });

    test('should create a booking successfully', async () => {
        vi.spyOn(googleService, 'createEvent').mockResolvedValue({ id: 'mock-google-id' });

        const result = await bookingService.createBooking(testSlot, userData);

        expect(result).toHaveProperty('id');
        expect(result.googleEventId).toBe('mock-google-id');
        expect(result.slotStart).toBe(testSlot);

        // Verify DB record
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.id);
        expect(booking.status).toBe(BookingStatus.CONFIRMED);
        expect(booking.user_name).toBe(userData.name);
    });

    test('should prevent duplicate bookings for the same slot', async () => {
        vi.spyOn(googleService, 'createEvent').mockResolvedValue({ id: 'mock-google-id-1' });

        // First booking
        await bookingService.createBooking(testSlot, userData);

        // Second booking for the same slot
        await expect(bookingService.createBooking(testSlot, userData))
            .rejects.toThrow('Este horario ya ha sido reservado por otra persona.');
    });

    test('should reject bookings in the past', async () => {
        const pastDate = new Date();
        pastDate.setHours(pastDate.getHours() - 1);
        const pastSlot = pastDate.toISOString();

        await expect(bookingService.createBooking(pastSlot, userData))
            .rejects.toThrow('No se pueden reservar citas en el pasado.');
    });

    test('should rollback DB entry if Google Calendar API fails', async () => {
        vi.spyOn(googleService, 'createEvent').mockRejectedValue(new Error('Google API Error'));

        await expect(bookingService.createBooking(testSlot, userData))
            .rejects.toThrow('Error al sincronizar con Google Calendar. La reserva no se ha completado.');

        // Verify no record left in DB
        const booking = db.prepare('SELECT * FROM bookings WHERE slot_start = ?').get(testSlot);
        expect(booking).toBeUndefined();
    });

    test('should reject bookings with invalid email format', async () => {
        const invalidUserData = { ...userData, email: 'not-an-email' };

        await expect(bookingService.createBooking(testSlot, invalidUserData))
            .rejects.toThrow('El formato de email proporcionado no es válido.');
    });
});
