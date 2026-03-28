# 部署指南

## 環境變數
- DATABASE_URL: postgresql://root:J38295Fztfeu1svcV6ao4jwlRh7TWC0O@35.194.224.187:30269/zeabur
- PORT: ${WEB_PORT}
- NEXT_PUBLIC_SITE_URL: https://2903412class.zeabur.app

## 部署步驟
1. 確認環境變數已在 Zeabur 設定
2. 點擊重新部署
3. 等待完成

## 自動化
- db:migrate: 自動執行 prisma migrate deploy
- db:seed: 自動執行種子
- postinstall: 自動在 npm install 後執行 db:init
