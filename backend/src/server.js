const express = require('express');
const db = require('./db');
const mealRoutes = require('./routes/meal');
const path = require('path');

const app = express();


app.use(express.json());

app.use('/api', mealRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('DB not ready:', err.code || err.message);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
