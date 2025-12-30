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
- **Cloudflare Tunnel (예정 → 적용 중)**

---

## 🔐 보안 기준 (필수)

- Node.js LTS + 보안 패치 버전 고정
- EOL Node.js 버전 사용 금지
- React / Next.js RSC 취약점(CVE-2025-55182) 회피
- `.env` 파일 Git 미포함
- 통계 조회 시 **개인 식별 정보 미노출**
- 실사용 시 IP 직접 노출 금지 → HTTPS 종단 처리

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
│ │   ├─ app.js               # 통계 화면 JS
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

## 🌐 Cloudflare Tunnel 기반 개발/운영 환경 설정 (단계별)

> **목적**
> 내부망(사설 IP) 서버를 외부에 직접 노출하지 않고,
> `HTTPS + 도메인`으로 안전하게 접근하기 위함

---

### 1️⃣ Cloudflare 계정 및 도메인 준비

* Cloudflare 계정 생성
* 기존 도메인 `miracle-agi.com` Cloudflare에 등록
* 네임서버(NS)를 Cloudflare로 변경

---

### 2️⃣ cloudflared 설치 (서버)

```bash
sudo apt update
sudo apt install -y cloudflared
```

설치 확인:

```bash
cloudflared --version
```

---

### 3️⃣ Cloudflare 로그인 (Origin 인증서 발급)

```bash
sudo cloudflared tunnel login
```

* 브라우저에서 Cloudflare 로그인
* 인증서가 `/root/.cloudflared/cert.pem`에 저장됨

---

### 4️⃣ Named Tunnel 생성

```bash
sudo cloudflared tunnel create mealcheck
```

생성 결과:

* Tunnel ID 발급
* `/root/.cloudflared/<TUNNEL_ID>.json` 생성

---

### 5️⃣ 서브도메인 연결

예시: `meal.miracle-agi.com`

```bash
sudo cloudflared tunnel route dns mealcheck meal.miracle-agi.com
```

> ⚠️ 동일한 호스트명이 이미 DNS에 있으면 기존 레코드 삭제 후 재시도

---

### 6️⃣ Tunnel 설정 파일 작성

`/etc/cloudflared/config.yml`

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: meal.miracle-agi.com
    service: http://localhost:3000
  - service: http_status:404
```

---

### 7️⃣ Tunnel 실행 (서비스 등록 권장)

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

---

### 8️⃣ 최종 접속 확인

```
https://meal.miracle-agi.com
```

* 내부 IP 노출 ❌
* HTTPS 자동 적용 ⭕
* QR 코드에는 **도메인 URL만 사용**

---

## 🗄 DB 구조 요약

### 주요 테이블

* `users`
* `roles`
* `user_roles`
* `meal_logs`
* `guests`
* `view_tokens`

---

## 👥 권한 모델

* **직원 (Staff)**: 식사 체크
* **관리자 (Admin)**: 관리 + 통계
* **식당 (Owner)**: 통계만
* **회계 (Accounting)**: 월별 집계

---

## 📡 API 요약

* `POST /api/check-in`
* `GET /api/stats/today`
* `GET /api/public/stats/today?token=...`

---

## ✅ 진행 현황 체크리스트

### Day 1 – 환경/인프라

* [x] Docker 환경 구성

### Day 2 – DB/백엔드

* [x] DB 스키마 / init.sql
* 복구용 SQL 스크립트
* `docker exec -i mealcheck-db mariadb -uroot -prootpass meal < backend/src/db/init.sql`

### Day 3 – 핵심 기능

* [x] 식사 체크 / 통계

### Day 4 – UX 고도화

* [x] 단일 QR + View Token

### Day 5 – 보안 & 배포

* [x] Cloudflare Tunnel 구성
* [ ] 운영 자동화 / 문서 보완

---

## 🎯 현재 상태 요약

> **HTTPS 기반 외부 접속 가능,
> 실사용 가능한 사내 식수 체크 MVP 완성**

---

## ✨ 프로젝트 목표

> “직원은 귀찮지 않게,
> 관리자는 정확하게,
> 식당과 회계는 필요한 정보만.”
