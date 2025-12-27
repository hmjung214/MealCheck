# 보안 기준 충족: Node.js LTS 20.19.4
FROM node:20.19.4

# 앱 실행 디렉터리
WORKDIR /app

# 의존성 파일만 먼저 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm install --production

# 나머지 소스 복사
COPY . .

# 서비스 포트
EXPOSE 3000

# 실행 명령
CMD ["npm", "start"]
