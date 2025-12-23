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

app.get('/api/availability', availabilityController.getAvailability);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
