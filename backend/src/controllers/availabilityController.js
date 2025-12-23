const availabilityService = require('../services/availabilityService');
const { parseISO, isValid, endOfDay, startOfDay, addDays } = require('date-fns');

async function getAvailability(req, res) {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: 'Missing "from" or "to" query parameters (ISO dates)' });
        }

        const startDate = parseISO(from);
        const endDate = parseISO(to);

        if (!isValid(startDate) || !isValid(endDate)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Limit the range to avoid heavy queries (e.g. max 30 days)
        // For MVP we can trust the frontend but good to be safe.

        const slots = await availabilityService.getAvailableSlots(startDate, endDate);

        // Return slots as ISO strings
        res.json({
            availableSlots: slots.map(d => d.toISOString())
        });

    } catch (error) {
        console.error('Error getting availability:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

module.exports = {
    getAvailability
};
