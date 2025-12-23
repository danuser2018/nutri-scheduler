const googleService = require('./googleCalendarService');
const settings = require('../config/settings');
const { addMinutes, startOfDay, endOfDay, setHours, setMinutes, isSameDay, isWeekend, getDay } = require('date-fns');
const { toZonedTime, fromZonedTime } = require('date-fns-tz');

class AvailabilityService {

    /**
     * Calculate available slots for a given date range
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getAvailableSlots(startDate, endDate) {
        // 1. Get busy periods from Google for the whole range
        const busyPeriods = await googleService.getBusyPeriods(startDate, endDate);

        // 2. Generate all possible logical slots based on business hours
        const possibleSlots = this.generateTimeSlots(startDate, endDate);

        // 3. Filter out slots that overlap with busy periods
        const availableSlots = possibleSlots.filter(slot => {
            const slotEnd = addMinutes(slot, settings.appointmentDuration);
            return !googleService.isSlotBusy(slot, slotEnd, busyPeriods);
        });

        return availableSlots;
    }

    /**
     * Generates theoretical slots based on business hours (without checking availability)
     */
    generateTimeSlots(start, end) {
        const slots = [];
        let currentDay = startOfDay(start);
        const lastDay = startOfDay(end);

        while (currentDay <= lastDay) {
            // Check if it's a work day
            const dayOfWeek = getDay(currentDay);
            if (settings.workDays.includes(dayOfWeek)) {

                // Define work hours for this day in the service timezone
                // We need to work carefully with timezones here.
                // For MVP simplicity, we construct the Date objects assuming the server is running or handling UTC correctly,
                // but applying the hour offsets of the business.

                // Hardcoded hours in settings are "local time" (e.g. 9 means 09:00 in Madrid)
                // We create a date at that *local* time and convert to UTC/JS Date object.

                let slotTime = toZonedTime(currentDay, settings.timeZone); // ensure we are anchoring to day

                // Construct start of business day
                let workStart = setMinutes(setHours(currentDay, settings.businessHours.start), 0);
                let workEnd = setMinutes(setHours(currentDay, settings.businessHours.end), 0);

                // Iterate through the day
                let currentSlot = workStart;
                while (addMinutes(currentSlot, settings.appointmentDuration) <= workEnd) {

                    // Only add if it's in the future relative to the request range start
                    // (and maybe check now() to avoid booking in the past)
                    if (currentSlot >= start && addMinutes(currentSlot, settings.appointmentDuration) <= end) {
                        slots.push(new Date(currentSlot));
                    }

                    currentSlot = addMinutes(currentSlot, settings.appointmentDuration);
                }
            }
            currentDay = addMinutes(currentDay, 24 * 60); // Next day
        }

        return slots;
    }
}

module.exports = new AvailabilityService();
