const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

/**
 * 식사 체크 (자동 사용자 등록)
 */
router.post('/check-in', async (req, res) => {
  const { phone_last4, device_token } = req.body;

  if (!/^\d{4}$/.test(phone_last4)) {
    return res.status(400).json({ message: '휴대폰 끝 4자리가 필요합니다.' });
  }

  if (!device_token) {
    return res.status(400).json({ message: '디바이스 정보가 필요합니다.' });
  }

  try {
    let userId;
    let savedDeviceToken = null;

    const [users] = await pool.query(
      `SELECT id, device_token
       FROM users
       WHERE phone_last4 = ? AND is_active = 1`,
      [phone_last4]
    );

    if (users.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO users (phone_last4, device_token)
         VALUES (?, ?)`,
        [phone_last4, device_token]
      );
      userId = result.insertId;
    } else {
      userId = users[0].id;
      savedDeviceToken = users[0].device_token;

      if (!savedDeviceToken) {
        await pool.query(
          `UPDATE users SET device_token = ? WHERE id = ?`,
          [device_token, userId]
        );
      } else if (savedDeviceToken !== device_token) {
        console.warn(`[WARN] device_token mismatch: user=${userId}`);
      }
    }

    const [logs] = await pool.query(
      `SELECT id
       FROM meal_logs
       WHERE user_id = ? AND meal_date = CURDATE()`,
      [userId]
    );

    if (logs.length > 0) {
      return res.json({ message: '이미 오늘 식사하셨습니다.' });
    }

    await pool.query(
      `INSERT INTO meal_logs (user_id, meal_date)
       VALUES (?, CURDATE())`,
      [userId]
    );

    res.json({ message: '식사 체크 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '식사 체크 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
