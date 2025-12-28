const express = require('express');
const router = express.Router();

const pool = require('../db/pool');
const requireViewToken = require('../middlewares/viewTokenAuth');

/**
 * 오늘 통계 (조회 전용)
 */
router.get('/today', requireViewToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [[staffRow]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM meal_logs WHERE meal_date = ?`,
      [today]
    );

    const [[guestRow]] = await pool.query(
      `SELECT IFNULL(SUM(count), 0) AS cnt FROM guests WHERE meal_date = ?`,
      [today]
    );

    const staff = Number(staffRow.cnt);
    const guests = Number(guestRow.cnt);

    res.json({
      date: today,
      staff,
      guests,
      total: staff + guests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '통계 조회 실패' });
  }
});

/**
 * 월별 통계 (조회 전용)
 */
router.get('/month', requireViewToken, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'month 파라미터 필요 (YYYY-MM)' });
    }

    const start = `${month}-01`;
    const end = `${month}-31`;

    const [[staffRow]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM meal_logs WHERE meal_date BETWEEN ? AND ?`,
      [start, end]
    );

    const [[guestRow]] = await pool.query(
      `SELECT IFNULL(SUM(count), 0) AS cnt FROM guests WHERE meal_date BETWEEN ? AND ?`,
      [start, end]
    );

    const staff = Number(staffRow.cnt);
    const guests = Number(guestRow.cnt);

    res.json({
      month,
      staff,
      guests,
      total: staff + guests
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '월별 통계 조회 실패' });
  }
});

module.exports = router;
