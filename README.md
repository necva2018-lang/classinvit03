# NECVA 線上課程平台（classinvit03）

Next.js App Router 前台 + Prisma（PostgreSQL）+ `/admin` 課程管理後台。資料庫目標部署於 **Zeabur**。

## 環境需求

- **Node.js** ≥ 20.9（見 `package.json` 的 `engines`）
- **PostgreSQL**（本機或 Zeabur 等雲端）

## 快速開始

```bash
git clone https://github.com/necva2018-lang/classinvit03.git
cd classinvit03
npm install
```

1. 複製環境變數範本並編輯（**勿將含密碼的檔案提交**）：

   ```bash
   cp .env.example .env
   ```

   在 `.env` 填入 Zeabur（或本機）的 **`DATABASE_URL`**。

2. 套用資料庫結構與（選用）種子資料：

   ```bash
   npm run check:db-url
   npx prisma migrate deploy
   npm run db:seed
   ```

3. 啟動開發伺服器：

   ```bash
   npm run dev
   ```

   瀏覽 [http://localhost:3000](http://localhost:3000)；後台：[http://localhost:3000/admin/courses](http://localhost:3000/admin/courses)

## npm 指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式 |
| `npm run build` / `npm run start` | 正式建置與執行 |
| `npm run check:db-url` | 檢查 `DATABASE_URL` 格式（不顯示密碼） |
| `npm run db:generate` | 產生 Prisma Client |
| `npm run db:migrate` | 本機開發遷移（`migrate dev`） |
| `npm run db:deploy` | 上線／共用 DB 套用遷移（`migrate deploy`） |
| `npm run db:seed` | 種子資料 |
| `npm run db:studio` | Prisma Studio |

## 專案結構摘要

- `app/(site)/` — 前台（首頁、課程列表、搜尋等），含 Navbar / Footer
- `app/(admin)/admin/` — 後台（側邊欄、課程 CRUD）
- `app/api/courses/` — 課程列表 JSON（供前台 Client 元件）
- `prisma/` — `schema.prisma`、遷移、`seed.ts`
- `components/ui/` — shadcn 相容基礎元件
- `DEVELOPMENT_LOG.md` — 開發過程與架構紀錄

## 部署（Zeabur 等）

- 在託管平台設定 **`DATABASE_URL`**
- 建置前需執行 `prisma generate`（本專案 `postinstall` 已包含）
- 對**同一資料庫**在可信環境執行 `npx prisma migrate deploy` 後再發布 Web

## 安全提醒

- **`.env`、`.env.local` 已列於 `.gitignore`，不應提交。**
- 若曾誤將內含密碼的環境檔推上遠端，請**立即更換**資料庫密碼並從歷史清除敏感檔（如 `git filter-repo`）。
- 後台 `/admin` 目前**無登入驗證**，正式上線前請補強權限。

## 授權

若未另附 `LICENSE` 檔，預設為專有或未宣告；請依團隊需求自行新增授權條款。
