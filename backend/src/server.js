const express = require('express');
const db = require('./db/pool');

// 라우트 임포트
const mealRoutes = require('./routes/meal');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const path = require('path');

const app = express();


app.use(express.json());

// 라우트 설정
app.use('/api', mealRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

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
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));