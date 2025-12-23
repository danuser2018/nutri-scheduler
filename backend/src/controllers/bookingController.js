const bookingService = require('../services/bookingService');

async function createBooking(req, res) {
    try {
        const { slotStart, name, email, phone, notes } = req.body;

        if (!slotStart || !name || !email) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: slotStart, name, email' });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        const booking = await bookingService.createBooking(slotStart, {
            name,
            email,
            phone,
            notes
        });

        res.status(201).json({
            message: 'Reserva confirmada con éxito',
            booking
        });

    } catch (error) {
        console.error('Error in createBooking controller:', error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createBooking
};
