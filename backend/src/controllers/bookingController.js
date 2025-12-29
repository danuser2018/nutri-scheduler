const bookingService = require('../services/bookingService');

async function createBooking(req, res) {
    try {
        const { slotStart, name, email, phone, notes } = req.body;

        if (!slotStart) return res.status(400).json({ error: 'El campo slotStart es obligatorio' });
        if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
        if (!email) return res.status(400).json({ error: 'El email es obligatorio' });

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'El formato de email no es válido' });
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
