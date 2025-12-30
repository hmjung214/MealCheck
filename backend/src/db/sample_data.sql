/* =========================================================
   MealCheck 샘플 사용자 + 역할 매핑
   - 개발 / 테스트용
   - 재실행 안전 (INSERT IGNORE)
   ========================================================= */

USE meal;

-- =========================================================
-- 1. 샘플 사용자
-- =========================================================
INSERT IGNORE INTO users (phone_last4, device_token)
VALUES
('1234', NULL), -- 일반 직원
('1111', NULL), -- 관리자
('2222', NULL), -- 식당
('3333', NULL); -- 회계

-- =========================================================
-- 2. 사용자 ID 조회 (변수 저장)
-- =========================================================
SET @uid_staff := (SELECT id FROM users WHERE phone_last4 = '1234');
SET @uid_admin := (SELECT id FROM users WHERE phone_last4 = '1111');
SET @uid_owner := (SELECT id FROM users WHERE phone_last4 = '2222');
SET @uid_account := (SELECT id FROM users WHERE phone_last4 = '3333');

SET @rid_staff := (SELECT id FROM roles WHERE name = 'staff');
SET @rid_admin := (SELECT id FROM roles WHERE name = 'admin');
SET @rid_owner := (SELECT id FROM roles WHERE name = 'owner');
SET @rid_account := (SELECT id FROM roles WHERE name = 'accounting');

-- =========================================================
-- 3. 역할 매핑 (N:M)
-- =========================================================

-- 직원
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@uid_staff, @rid_staff);

-- 관리자 (직원 + 관리자)
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES
(@uid_admin, @rid_staff),
(@uid_admin, @rid_admin);

-- 식당
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@uid_owner, @rid_owner);

-- 회계
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (@uid_account, @rid_account);

-- =========================================================
-- 완료
-- =========================================================
