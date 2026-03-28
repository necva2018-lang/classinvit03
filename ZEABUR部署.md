# Zeabur 部署清單（classinvit03）

本專案為 **Next.js 16 + Prisma + PostgreSQL**。依 [Zeabur Next.js 說明](https://zeabur.com/docs/en-US/guides/nodejs/nextjs) 與 [Node.js 指南](https://zeabur.com/docs/en-US/guides/nodejs) 整理如下。

## 一、在 Zeabur 建立資源（建議順序）

1. **建立專案**（Project）。
2. **新增 PostgreSQL** 服務。
3. **新增 Web** 服務 → 選「從 GitHub 部署」→ 連結倉庫 [necva2018-lang/classinvit03](https://github.com/necva2018-lang/classinvit03)。
4. 在 **Web 服務**將 PostgreSQL **綁定／連結（Bind）**，讓平台注入 **`DATABASE_URL`**（優先使用 **Internal／內網** 連線字串）。

## 二、環境變數（Web 服務 → Variables）

| 變數 | 必填 | 說明 |
|------|------|------|
| `DATABASE_URL` | 是 | 綁定 PostgreSQL 後通常會自動帶入；請確認 **Build 階段**也有值（`prisma generate` 在 `postinstall` / `build` 會用到）。 |
| `NEXT_PUBLIC_SITE_URL` | 強烈建議 | 正式網址，例如 `https://你的子網域.zeabur.app`。供 `metadataBase`、OG、canonical；**勿留空字串**。可先部署一次取得網址後再補，並 **Redeploy** 讓建置讀到新值。 |

**關於 `NEXT_PUBLIC_*`：** Next.js 會在 **建置（build）** 時把 `NEXT_PUBLIC_SITE_URL` 編進前端；若只在 Runtime 設定、未重建映像，部分 SEO／絕對網址可能仍為舊值。

可選：若 Zeabur 已提供 `${ZEABUR_WEB_URL}`，可在 Variables 設：

```env
NEXT_PUBLIC_SITE_URL=${ZEABUR_WEB_URL}
```

（以控制台實際可用的變數名稱為準，見 [Zeabur Variables 文件](https://zeabur.com/docs/en-US/deploy/variables)。）

## 三、Node 與建置指令

- `package.json` 已宣告 `"engines": { "node": ">=20.9.0" }`，Zeabur 會依此選用相容 Node 版本。
- 專案根目錄已放 **`zbpack.json`**，明確使用：
  - **Build：** `npm run build`（內含 `prisma generate && next build`）
  - **Start：** `npm run start`（`next start` 會讀 **`PORT`**，與 Zeabur 注入一致）

若你改用 pnpm／yarn，請在 Zeabur 改 **Build / Start** 或調整 `zbpack.json`。

## 四、資料庫遷移（必做一次）

映像建置 **不會** 自動執行 `migrate deploy`；需在「能連到**同一個** `DATABASE_URL`」的環境執行一次：

```bash
npx prisma migrate deploy
```

選用種子：

```bash
npm run db:seed
```

常見做法：

- 本機 `.env` 暫時使用 Zeabur PostgreSQL 的 **Public** 連線字串執行上述指令；或  
- 使用 Zeabur 提供的終端機／一次性指令連線同一資料庫。

## 五、部署後驗證

1. 開啟 Web 服務網址首頁。
2. 開啟 `/admin/courses` 確認後台可讀寫（**正式上線前請補強 `/admin` 權限**，見 `README.md`）。
3. 若首頁或課程頁報「環境變數」錯誤，檢查 `DATABASE_URL` 是否在 **Build + Runtime** 皆有值。

## 六、安全提醒

- **不要**把含密碼的 `.env` 提交到 Git（已在 `.gitignore`）。
- 正式站 **不要**設 `SKIP_ENV_CHECK=1`。

## 七、相關檔案

- `.env.example` — 變數說明與本機／Zeabur 對照  
- `lib/env-check.ts` — 啟動時檢查的變數規則  
- `next.config.ts` — `turbopack.root`（本機）、`serverExternalPackages`（Prisma）
