CREATE DATABASE IF NOT EXISTS meal
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE meal;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_last4 VARCHAR(4) NOT NULL UNIQUE COMMENT '휴대폰 번호 뒤 4자리',
  device_token VARCHAR(255) NULL COMMENT '브라우저/디바이스 식별 토큰',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'staff, admin, owner, accounting'
);

INSERT INTO roles (name) VALUES
  ('staff'),
  ('admin'),
  ('owner'),
  ('accounting');

CREATE TABLE user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE meal_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_meal_date (user_id, meal_date)
);

CREATE TABLE guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_date DATE NOT NULL,
  count INT NOT NULL DEFAULT 1 COMMENT '손님 수',
  created_by INT NOT NULL COMMENT '등록한 관리자 user_id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO users (phone_last4) VALUES ('1234');

INSERT INTO user_roles (user_id, role_id)
VALUES
  (1, (SELECT id FROM roles WHERE name='staff')),
  (1, (SELECT id FROM roles WHERE name='admin')),
  (1, (SELECT id FROM roles WHERE name='accounting'));

