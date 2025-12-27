# 🍽 MealCheck

**MiracleAGI 사내 식수 인원 체크 시스템**

QR 코드 기반으로 직원 및 손님의 식사 여부를 간단히 기록하고,
식당·관리자·회계가 필요한 통계를 안전하게 확인할 수 있는 사내 웹 서비스.

---

## 📌 프로젝트 개요

* 회사명: **미라클에이지아이 (MiracleAGI)**
* 대상 인원: **직원 50명 이내**
* 사용 방식:

  * 식당 입구 QR 코드 스캔
  * 모바일 브라우저 접속 (앱 설치 없음)
* 핵심 목표:

  * 식수 인원 자동 집계
  * 직원별 식사 기록 관리
  * 식당/회계/관리자 역할 분리
  * 최소한의 개인정보 노출

---

## 🧱 기술 스택

### Backend

* **Node.js 20.19.4 (LTS, 보안 패치 적용)**
* **Express (4.x 권장)**
* **MariaDB 10.11**

### Infra / DevOps

* **Docker / Docker Compose**
* **Ubuntu Server**
* VS Code Remote SSH
* (예정) Cloudflare Tunnel + HTTPS

---

## 🔐 보안 기준 (필수)

* Node.js LTS + 보안 패치 버전 고정
* EOL Node.js 버전 사용 금지
* React / Next.js RSC 취약점(CVE-2025-55182) 회피
* `.env` 파일 Git 미포함
* 실사용 시 IP 직접 노출 금지 → HTTPS 종단 처리

---

## 📁 프로젝트 구조

```
MealCheck/
├─ backend/
│  ├─ src/
│  │  └─ server.js
│  ├─ Dockerfile
│  ├─ package.json
│  └─ package-lock.json
├─ docker-compose.yml
├─ .env.example
├─ .gitignore
└─ README.md
```

---

## 🛠 개발환경 세팅 (Remote SSH 기준)

### 필수 조건

* 서버: Ubuntu (Docker, Docker Compose 설치 완료)
* 로컬 PC: macOS / Windows
* 편집기: VS Code
* 접속 방식: SSH (Remote SSH)

---

### 1️⃣ VS Code 확장 설치

* **Remote - SSH**
* (선택) Docker

---

### 2️⃣ SSH 접속 확인

```bash
ssh ubuntu@<SERVER_IP>
```

---

### 3️⃣ VS Code Remote SSH 연결

1. `Cmd/Ctrl + Shift + P`
2. `Remote-SSH: Connect to Host...`
3. `ubuntu@<SERVER_IP>`
4. 프로젝트 폴더 열기:

   ```
   /home/ubuntu/projects/MealCheck
   ```

---

### 4️⃣ 환경 변수 설정

```bash
cp .env.example .env
```

---

### 5️⃣ Docker 컨테이너 실행

```bash
cd ~/projects/MealCheck
docker compose up --build -d
```

상태 확인:

```bash
docker compose ps
docker compose logs backend --tail=100
```

---

### 6️⃣ 내부망 접속 테스트 (HTTP)

```
http://<SERVER_LAN_IP>:3000
```

정상 응답:

```json
{ "message": "MiracleAGI MealCheck Backend Running" }
```

> ⚠️ 현재는 HTTP 테스트 단계
> HTTPS는 Cloudflare Tunnel 적용 예정

---

### 7️⃣ 권한 관련 주의사항 (중요)

Docker 컨테이너 내부에서 npm 명령을 실행하면 파일 소유권이 꼬일 수 있음.
프로젝트 전체는 **ubuntu 소유**로 유지:

```bash
sudo chown -R ubuntu:ubuntu ~/projects/MealCheck
```

---

## 👥 권한 모델 (설계 기준)

* **직원(Staff)**

  * 본인 식사 체크
  * 본인 식사 기록 조회
  * 오늘 총 식수 인원 수 조회(숫자만)

* **관리자(Admin / IT)**

  * 직원/디바이스 관리
  * 손님 식사 인원 수동 추가
  * 전체 로그 관리/수정

* **식당(Owner)**

  * 일/월별 총 식수 인원 조회
  * 개인 식별 정보 접근 불가

* **회계(Accounting)**

  * 월별 집계 데이터 조회
  * 개인 식별 정보 없음

※ 한 사용자는 **여러 역할을 동시에 가질 수 있음**

---

## ✅ 진행 현황 체크리스트

### 1️⃣ 개발 환경 & 인프라 (완료)

* [x] Ubuntu 서버 준비
* [x] Docker / Docker Compose 구성
* [x] Node.js 20.19.4 LTS 고정
* [x] Express 서버 기동 확인
* [x] MariaDB 컨테이너 구성
* [x] DB 데이터 영속성 볼륨 적용
* [x] `.env / .env.example` 분리
* [x] `.gitignore` 설정
* [x] 내부망 HTTP 접속 테스트 완료

---

### 2️⃣ 백엔드 기초 설계 (다음 단계)

* [ ] DB 스키마 설계 (직원 / 토큰 / 식사 로그 / 손님)
* [ ] DB 연결 모듈 구성
* [ ] API 기본 구조 정리 (routes / controllers)

---

### 3️⃣ 핵심 기능

* [ ] 식사 체크 API (`POST /check-in`)
* [ ] 중복 식사 방지 로직
* [ ] 디바이스 토큰 발급/검증
* [ ] 손님 식사 수동 추가

---

### 4️⃣ 조회 및 통계

* [ ] 직원 본인 식사 기록 조회
* [ ] 오늘/월별 식수 인원 통계
* [ ] 식당/회계 전용 조회 API

---

### 5️⃣ 보안 & 배포

* [ ] Cloudflare Tunnel 연결
* [ ] 도메인 연결
* [ ] HTTPS 자동 인증서 적용
* [ ] IP 직접 노출 차단
* [ ] QR 코드용 최종 URL 확정

---

## ✨ 프로젝트 목표

> “직원은 귀찮지 않게,
> 관리자는 정확하게,
> 식당과 회계는 필요한 정보만.”

---