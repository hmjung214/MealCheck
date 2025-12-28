const express = require('express');
const router = express.Router();

const pool = require('../db/pool');
const mockAuth = require('../middlewares/mockAuth');
const { requireRole } = require('../middlewares/auth');

// 관리자 손님 식사 추가
router.post('/guests', mockAuth, requireRole('admin'), async (req, res) => {
  try {
    const { count } = req.body;
    const guestCount = Number(count) || 1;

    if (guestCount <= 0) {
      return res.status(400).json({ message: 'count는 1 이상이어야 합니다.' });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const adminId = req.user.id;

    await pool.query(
      `
      INSERT INTO guests (meal_date, count, created_by)
      VALUES (?, ?, ?)
      `,
      [today, guestCount, adminId]
    );

    res.json({
      message: '손님 식사 인원 추가 완료',
      count: guestCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '손님 식사 추가 실패' });
  }
});

module.exports = router;