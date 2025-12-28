const pool = require('../db/pool');

module.exports = async function requireViewToken(req, res, next) {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ message: '조회 토큰 필요' });
    }

    const [[row]] = await pool.query(
      `
      SELECT id
      FROM view_tokens
      WHERE token = ?
        AND is_active = 1
        AND (expires_at IS NULL OR expires_at > NOW())
      `,
      [token]
    );

    if (!row) {
      return res.status(403).json({ message: '유효하지 않은 토큰' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '토큰 검증 실패' });
  }
};
