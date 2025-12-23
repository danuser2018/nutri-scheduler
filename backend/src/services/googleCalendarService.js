const { calendar, getCalendarId } = require('../config/google');
const settings = require('../config/settings');
const { addMinutes, parseISO, isBefore, format, startOfDay, endOfDay, setHours, setMinutes, setSeconds } = require('date-fns');
const { toZonedTime, fromZonedTime } = require('date-fns-tz');

class GoogleCalendarService {
    constructor() {
        this.calendarId = getCalendarId();
    }

    /**
     * Get busy periods from Google Calendar
     * @param {Date} timeMin Start of range
     * @param {Date} timeMax End of range
     * @returns {Promise<Array<{start: Date, end: Date}>>} List of busy intervals
     */
    async getBusyPeriods(timeMin, timeMax) {
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                timeZone: settings.timeZone,
                items: [{ id: this.calendarId }],
            },
        });

        const busy = response.data.calendars[this.calendarId].busy;

        // Map strings to Date objects
        return busy.map(period => ({
            start: new Date(period.start),
            end: new Date(period.end)
        }));
    }

    /**
     * Check if a specific slot clashes with any busy period
     */
    isSlotBusy(slotStart, slotEnd, busyPeriods) {
        for (const busy of busyPeriods) {
            // Check if there is overlap
            // A slot (S_start, S_end) overlaps with Busy (B_start, B_end) if:
            // S_start < B_end AND S_end > B_start
            if (slotStart < busy.end && slotEnd > busy.start) {
                return true;
            }
        }
        return false;
    }
}

module.exports = new GoogleCalendarService();
