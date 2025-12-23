module.exports = {
    // Service configuration
    businessHours: {
        start: 9, // 9 AM
        end: 17,  // 5 PM
    },
    // Days of the week available (0=Sunday, 1=Monday, etc.)
    workDays: [1, 2, 3, 4, 5], // Mon-Fri

    appointmentDuration: 60, // minutes

    // Timezone of the service provider (the calendar owner)
    // Very important to set this correctly to calculate slots
    timeZone: 'Europe/Madrid',
};
