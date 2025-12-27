# 개발환경 세팅

## 1. 패키지 업데이트
```
sudo apt update && sudo apt upgrade -y
```

## 2. Docker 설치

서버에서 Docker 설치
```
sudo apt install -y ca-certificates curl gnupg lsb-release
```

Docker GPG 키 등록
```
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo tee /etc/apt/keyrings/docker.gpg > /dev/null
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Docker 저장소 등록