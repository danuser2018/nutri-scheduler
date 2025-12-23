const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutri-Scheduler Backend is running' });
});

const availabilityController = require('./controllers/availabilityController');
const bookingController = require('./controllers/bookingController');

app.get('/api/availability', availabilityController.getAvailability);
app.post('/api/bookings', bookingController.createBooking);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
