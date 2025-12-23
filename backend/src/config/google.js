const { google } = require('googleapis');
const path = require('path');

// Initialize GoogleAuth client using Service Account credentials
// It automatically looks for GOOGLE_APPLICATION_CREDENTIALS env var
// or we can pass keyFile explicitly.

const KEY_FILE_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../service-account.json');

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

const getCalendarId = () => {
    const id = process.env.GOOGLE_CALENDAR_ID;
    if (!id) {
        throw new Error('GOOGLE_CALENDAR_ID is not defined in .env');
    }
    return id;
};

module.exports = {
    calendar,
    getCalendarId
};
