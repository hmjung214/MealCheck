// backend/src/middlewares/auth.js
const pool = require('../db/pool');

/**
 * 유저의 역할 목록 조회
 */
async function getUserRoles(userId) {
  const [rows] = await pool.query(
    `
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = ?
    `,
    [userId]
  );

  return rows.map(r => r.name); // ['staff', 'admin']
}

/**
 * 단일 역할 필요
 */
function requireRole(role) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: '인증 정보 없음' });
      }

      const roles = await getUserRoles(userId);

      if (!roles.includes(role)) {
        return res.status(403).json({ message: '권한 없음' });
      }

      next();
    } catch (err) {
      console.error('[AUTH]', err);
      res.status(500).json({ message: '권한 확인 실패' });
    }
  };
}

/**
 * 여러 역할 중 하나라도 필요
 */
function requireAnyRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: '인증 정보 없음' });
      }

      const roles = await getUserRoles(userId);

      const hasRole = roles.some(r => allowedRoles.includes(r));
      if (!hasRole) {
        return res.status(403).json({ message: '권한 없음' });
      }

      next();
    } catch (err) {
      console.error('[AUTH]', err);
      res.status(500).json({ message: '권한 확인 실패' });
    }
  };
}

module.exports = {
  requireRole,
  requireAnyRole
};