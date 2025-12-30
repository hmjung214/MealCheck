const express = require('express');
const path = require('path');
const db = require('./db/pool');

// ✅ 1. app 먼저 생성
const app = express();

// ✅ 2. 미들웨어 등록
app.use(express.json());

// ✅ 3. 라우트 임포트
const mealRoutes = require('./routes/meal');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');
const publicStatsRoutes = require('./routes/publicStats');

// ✅ 4. 라우트 설정
app.use('/api', mealRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/public/stats', publicStatsRoutes);

// ✅ 5. 정적 파일
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 6. 헬스 체크
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    console.error('DB not ready:', err.code || err.message);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ✅ 7. 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
