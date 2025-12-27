const express = require('express');
const router = express.Router();
const db = require('../db');

// 식사 체크
router.post('/check-in', async (req, res) => {
  const { phone_last4 } = req.body;

  if (!phone_last4 || phone_last4.length !== 4) {
    return res.status(400).json({ message: '휴대폰 끝 4자리를 입력하세요.' });
  }

  try {
    const [users] = await db.query(
      'SELECT id FROM users WHERE phone_last4 = ? AND is_active = 1',
      [phone_last4]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const userId = users[0].id;

    await db.query(
      'INSERT INTO meal_logs (user_id, meal_date) VALUES (?, CURDATE())',
      [userId]
    );

    res.json({ message: '식사 체크 완료' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 오늘 식사하셨습니다.' });
    }
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;

/**
 * 오늘 식수 인원
 * GET /api/today-count
 */
router.get('/today-count', async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT COUNT(*) AS count FROM meal_logs WHERE meal_date = CURDATE()'
    );
    res.json({ count: row.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});
