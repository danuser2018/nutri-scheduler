const request = require('supertest');
const app = require('../index');
const db = require('../config/database');
const { addDays, setHours, setMinutes, setSeconds } = require('date-fns');
const BookingStatus = require('../constants/bookingStatus');

describe('Booking Integration Test', () => {
    let testSlot;

    beforeAll(() => {
        // Ensure table exists and is clean for the test slot
        db.prepare('DELETE FROM bookings WHERE user_email = ?').run('integration-test@example.com');
    });

    beforeEach(() => {
        // Create a future slot: tomorrow at 11:00 AM
        const tomorrow = addDays(new Date(), 1);
        tomorrow.setHours(11, 0, 0, 0);
        testSlot = tomorrow.toISOString();
    });

    afterAll(() => {
        // Cleanup
        db.prepare('DELETE FROM bookings WHERE user_email = ?').run('integration-test@example.com');
    });

    test('POST /api/bookings should complete the full flow', async () => {
        const payload = {
            slotStart: testSlot,
            name: 'Integration Test User',
            email: 'integration-test@example.com',
            phone: '999999999',
            notes: 'Testing full integration flow'
        };

        const response = await request(app)
            .post('/api/bookings')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201); // Assuming 201 Created or 200 OK

        expect(response.body.booking).toHaveProperty('id');
        expect(response.body.booking).toHaveProperty('googleEventId');
        expect(response.body.booking.email).toBe(payload.email);

        // 1. Verify Database record
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(response.body.booking.id);
        expect(booking).toBeDefined();
        expect(booking.status).toBe(BookingStatus.CONFIRMED);
        expect(booking.google_event_id).toBe(response.body.booking.googleEventId);
        expect(booking.user_name).toBe(payload.name);

        console.log('Successfully created Google Event ID:', response.body.booking.googleEventId);
    });

    test('POST /api/bookings should fail if slot is already taken', async () => {
        const payload = {
            slotStart: testSlot,
            name: 'Second User',
            email: 'integration-test@example.com',
            phone: '888888888'
        };

        // The slot is already taken by the previous test if it ran successfully
        const response = await request(app)
            .post('/api/bookings')
            .send(payload)
            .expect(400); // Or the appropriate error code

        expect(response.body.error).toMatch(/ya ha sido reservado/i);
    });
});
