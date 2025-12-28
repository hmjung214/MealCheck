```md
# 🍽 MealCheck

**MiracleAGI 사내 식수 인원 체크 시스템**

QR 코드 기반으로 직원의 식사 체크를 간단히 기록하고,  
식당·관리자·회계가 **개인정보 없이 필요한 통계만** 안전하게 확인할 수 있는 사내 웹 서비스.

---

## 📌 프로젝트 개요

- 회사명: **미라클에이지아이 (MiracleAGI)**
- 대상 인원: **직원 50명 이내**
- 사용 방식:
  - 식당 입구 **QR 코드 1개** 스캔
  - 모바일 브라우저 접속 (앱 설치 없음)
- 핵심 목표:
  - 식수 인원 자동 집계
  - 직원 식사 체크 간소화
  - 식당/회계/관리자 역할 분리
  - 최소한의 개인정보 노출

---

## 🧭 사용자 흐름 (확정)

```

QR 스캔
↓
직원 식사 체크 화면 (/public/check.html)
├─ 휴대폰 끝 4자리 저장 (최초 1회)
├─ [식사했어요] 버튼
└─ [📊 오늘 식수 현황 보기] 버튼
↓
통계 조회 화면 (/public/index.html?token=VIEW_TOKEN)

```

- QR **1개만 배포**
- 직원 / 식당 / 회계 모두 동일 진입
- 통계는 **의도적으로 버튼을 눌러야만 접근**

---

## 🧱 기술 스택

### Backend
- **Node.js 20.19.4 (LTS, 보안 패치 적용)**
- **Express**
- **MariaDB 10.11**

### Infra / DevOps
- **Docker / Docker Compose**
- **Ubuntu Server**
- VS Code Remote SSH
- (예정) Cloudflare Tunnel + HTTPS

---

## 🔐 보안 기준 (필수)

- Node.js LTS + 보안 패치 버전 고정
- EOL Node.js 버전 사용 금지
- React / Next.js RSC 취약점(CVE-2025-55182) 회피
- `.env` 파일 Git 미포함
- 통계 조회 시 **개인 식별 정보 미노출**
- 실사용 시 IP 직접 노출 금지 → HTTPS 종단 처리 예정

---

## 📁 프로젝트 구조

```

MealCheck/
├─ backend/
│ ├─ src/
│ │ ├─ server.js              # Express 서버 엔트리
│ │ ├─ db/
│ │ │ └─ pool.js              # MariaDB 커넥션 풀
│ │ ├─ middlewares/
│ │ │ ├─ auth.js              # 역할 기반 권한 미들웨어
│ │ │ ├─ mockAuth.js          # 개발용 인증
│ │ │ └─ viewTokenAuth.js     # 조회 전용 토큰 인증
│ │ ├─ routes/
│ │ │ ├─ meal.js              # 식사 체크 API
│ │ │ ├─ admin.js             # 관리자 기능
│ │ │ ├─ stats.js             # 내부 통계 API
│ │ │ └─ publicStats.js       # 조회 전용 통계 API
│ │ └─ public/
│ │   ├─ check.html           # 직원 식사 체크 화면
│ │   ├─ check.js
│ │   ├─ index.html           # 통계 조회 화면
│ │   ├─ app.js               # 통계 화면 JS (자동 새로고침)
│ │   └─ style.css
│ ├─ Dockerfile
│ ├─ package.json
│ └─ package-lock.json
├─ docker-compose.yml
├─ init.sql                   # DB 초기/복구 스크립트
├─ .env.example
├─ .gitignore
└─ README.md

````

---

## 🛠 개발환경 세팅 (Remote SSH 기준)

### 필수 조건
- 서버: Ubuntu (Docker, Docker Compose 설치 완료)
- 로컬 PC: macOS / Windows
- 편집기: VS Code
- 접속 방식: SSH (Remote SSH)

### 실행
```bash
cp .env.example .env
docker compose up --build -d
````

상태 확인:

```bash
docker compose ps
docker compose logs backend --tail=100
```

---

## 🗄 DB 구조 요약

### 주요 테이블

* `users` : 직원 정보 (phone_last4 기준)
* `roles` : 역할 정의 (staff, admin, owner, accounting)
* `user_roles` : 사용자-역할 매핑 (N:M)
* `meal_logs` : 직원 식사 기록 (1일 1회 제한)
* `guests` : 손님 식사 수
* `view_tokens` : 조회 전용 토큰

---

## 👥 권한 모델

* **직원 (Staff)**

  * 식사 체크
  * 통계 직접 접근 ❌

* **관리자 (Admin / IT)**

  * 직원/손님 관리
  * 통계 조회 가능

* **식당 (Owner)**

  * 오늘/월별 식수 인원 조회
  * 개인 식별 정보 접근 ❌

* **회계 (Accounting)**

  * 월별 집계 데이터 조회
  * 개인 식별 정보 없음

※ 한 사용자는 **여러 역할을 동시에 가질 수 있음**

---

## 📡 API 요약

### 직원 식사 체크

```
POST /api/check-in
```

### 관리자

```
POST /api/admin/guests
```

### 내부 통계 (권한 필요)

```
GET /api/stats/today
GET /api/stats/month
```

### 조회 전용 통계 (View Token)

```
GET /api/public/stats/today?token=...
GET /api/public/stats/month?month=YYYY-MM&token=...
```

---

## 🖥 프론트 화면

### 직원 식사 체크

```
/public/check.html
```

* 휴대폰 끝 4자리 최초 1회 저장
* “식사했어요” 버튼
* 통계 보기 버튼 제공

### 통계 조회 화면

```
/public/index.html?token=VIEW_TOKEN
```

* 오늘 / 월 누적 식수 표시
* **5분 자동 새로고침**
* 개인정보 없음

---

## ✅ 진행 현황 체크리스트

### Day 1 – 환경/인프라

* [x] Ubuntu 서버 + Docker 구성
* [x] Node.js 20.19.4 LTS 고정
* [x] 기본 서버 구동

### Day 2 – DB/백엔드 기초

* [x] DB 스키마 설계 및 init.sql
* [x] 커넥션 풀 구성
* [x] API 구조 분리

### Day 3 – 핵심 기능/통계

* [x] 식사 체크 API
* [x] 중복 식사 방지
* [x] 역할 기반 권한 시스템
* [x] 오늘 / 월별 통계 API

### Day 4 – UX 고도화

* [x] 조회 전용 View Token 도입
* [x] 직원 체크 화면 + 통계 화면 분리
* [x] 단일 QR UX 확정
* [x] 통계 화면 자동 새로고침
* [x] 실사용 가능한 MVP 완성

### 5️⃣ 보안 & 배포

* [ ] Cloudflare Tunnel 연결
* [ ] 도메인 연결
* [ ] HTTPS 자동 인증서 적용
* [ ] IP 직접 노출 차단
* [ ] QR 코드용 최종 URL 확정

---

## 🎯 현재 상태 요약

> **사내 배포 및 시범 운영이 가능한 MVP 상태**
> 직원은 빠르게 체크, 식당·회계는 숫자만 확인 가능

---

## 🔜 다음 단계 (예정)

* Cloudflare Tunnel + HTTPS
* QR 최종 URL 확정 및 배포 가이드
* 운영/장애 대응 문서
* (선택) 관리자 UI 고도화

---

## ✨ 프로젝트 목표

> “직원은 귀찮지 않게,
> 관리자는 정확하게,
> 식당과 회계는 필요한 정보만.”

```
```
