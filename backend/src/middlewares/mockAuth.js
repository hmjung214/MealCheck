const pool = require('../db/pool');

module.exports = async function mockAuth(req, res, next) {
  const phoneLast4 = req.body.phone_last4 || req.query.phone_last4;
  if (!phoneLast4) return res.status(401).json({ message: 'phone_last4 필요' });

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE phone_last4 = ? AND is_active = 1',
    [phoneLast4]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: '사용자 없음' });
  }

  req.user = rows[0]; // 🔥 핵심
  next();
};
