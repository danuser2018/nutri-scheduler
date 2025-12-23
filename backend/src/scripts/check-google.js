const { calendar } = require('../config/google');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function checkIntegration() {
    try {
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (!calendarId) {
            console.error('❌ GOOGLE_CALENDAR_ID is missing in .env file');
            process.exit(1);
        }

        console.log(`Checking access to calendar: ${calendarId}...`);

        const res = await calendar.events.list({
            calendarId,
            timeMin: new Date().toISOString(),
            maxResults: 1,
            singleEvents: true,
            orderBy: 'startTime',
        });

        console.log('✅ Connection Successful!');
        if (res.data.items && res.data.items.length) {
            console.log('Upcoming event found:', res.data.items[0].summary);
        } else {
            console.log('No upcoming events found (but connection works).');
        }
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code === 404) {
            console.error('Hint: Check if the Calendar ID is correct and if you shared the calendar with the Service Account email.');
        }
    }
}

checkIntegration();
