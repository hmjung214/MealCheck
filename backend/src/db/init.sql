/* =========================================================
   MealCheck DB 전체 복구 / 초기화 SQL
   - MariaDB 10.11 기준
   - 재실행 안전 (IF NOT EXISTS + FK 분리)
   - 작성일: 2025-12-30
   ========================================================= */

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE meal;

-- =========================================================
-- 1. users
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  phone_last4 CHAR(4) NOT NULL COMMENT '휴대폰 번호 끝 4자리',
  device_token VARCHAR(255) DEFAULT NULL COMMENT '브라우저/디바이스 식별 토큰',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성 여부',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_phone_last4 (phone_last4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='직원 사용자';

-- =========================================================
-- 2. roles
-- =========================================================
CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '역할명',
  description VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_role_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='역할 정의';

-- 기본 역할 (중복 삽입 방지)
INSERT IGNORE INTO roles (name, description) VALUES
('staff', '직원'),
('admin', '관리자'),
('owner', '식당'),
('accounting', '회계');

-- =========================================================
-- 3. user_roles (FK 없이 생성)
-- =========================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사용자-역할 매핑';

-- =========================================================
-- 4. meal_logs
-- =========================================================
CREATE TABLE IF NOT EXISTS meal_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL COMMENT '직원 ID',
  meal_date DATE NOT NULL COMMENT '식사 날짜',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_meal_date (user_id, meal_date),
  KEY idx_meal_date (meal_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='직원 식사 기록';

-- =========================================================
-- 5. guests
-- =========================================================
CREATE TABLE IF NOT EXISTS guests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  meal_date DATE NOT NULL COMMENT '식사 날짜',
  count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '손님 식사 수',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_guest_meal_date (meal_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='손님 식사 수';

-- =========================================================
-- 6. view_tokens
-- =========================================================
CREATE TABLE IF NOT EXISTS view_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token VARCHAR(255) NOT NULL COMMENT '조회 전용 토큰',
  description VARCHAR(255) DEFAULT NULL COMMENT '용도 설명',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성 여부',
  expires_at DATETIME DEFAULT NULL COMMENT '만료 일시',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_view_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='통계 조회 전용 토큰';

-- =========================================================
-- 7. FK 추가 (존재 여부 체크 후 안전 추가)
-- =========================================================

-- user_roles → users
SET @fk1 := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_roles'
    AND CONSTRAINT_NAME = 'fk_user_roles_user'
);

SET @sql1 := IF(@fk1 = 0,
  'ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  'SELECT 1'
);

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- user_roles → roles
SET @fk2 := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_roles'
    AND CONSTRAINT_NAME = 'fk_user_roles_role'
);

SET @sql2 := IF(@fk2 = 0,
  'ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE',
  'SELECT 1'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- meal_logs → users
SET @fk3 := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'meal_logs'
    AND CONSTRAINT_NAME = 'fk_meal_logs_user'
);

SET @sql3 := IF(@fk3 = 0,
  'ALTER TABLE meal_logs ADD CONSTRAINT fk_meal_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  'SELECT 1'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

SET FOREIGN_KEY_CHECKS = 1;

/* =========================================================
   완료
   - 여러 번 실행 가능
   - Docker 환경에서도 FK 오류 없음
   ========================================================= */
