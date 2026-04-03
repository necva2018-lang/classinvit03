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
| `AUTH_SECRET` 或 `NEXTAUTH_SECRET` | 正式站必填 | Auth.js／會員 Session 加密用，**擇一即可**（建議名稱用 `AUTH_SECRET`）。未設定時前台會出現「環境變數未就緒」說明頁（`EnvGate`）。 |
| `NEXT_PUBLIC_SITE_URL` | 強烈建議 | 正式網址，例如 `https://你的子網域.zeabur.app`。供 `metadataBase`、OG、canonical；**勿留空字串**。可先部署一次取得網址後再補，並 **Redeploy** 讓建置讀到新值。 |

### 二之一、`AUTH_SECRET` 怎麼產生（Windows 無 openssl 時）

本機有 Node 時（本專案必備），在 PowerShell／cmd 執行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

將輸出的**一整行**貼到 Zeabur（**勿加引號**）。**請自行在本機產生並保密**，不要把密鑰貼在 GitHub Issue、聊天或 commit 裡。

純 PowerShell（無 Node 時）：

```powershell
$b = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b)
```

### 二之二、在 Zeabur 設定 `AUTH_SECRET`

1. Zeabur → **你的專案** → 點 **Web** 服務（Next.js，不是 PostgreSQL）。
2. 開啟 **Variables**／**環境變數**。
3. **新增**：Key 為 `AUTH_SECRET`，Value 貼上你產生的字串。
4. **儲存**後對 Web 服務執行 **Redeploy**／**Restart**，變數才會進入執行中的容器。

**勿**在正式站設定 `NEXTAUTH_URL`，除非你真的要接 Google OAuth；設了會強制檢查 `GOOGLE_CLIENT_ID`／`GOOGLE_CLIENT_SECRET`，未填會無法通過環境檢查。見 `lib/env-check.ts` 的 `wantsAuth()`。

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
2. 若出現「伺服器缺少下列變數」清單，依畫面補齊 **Variables** 後 **Redeploy**（常見為缺 `AUTH_SECRET` 或 `DATABASE_URL`）。
3. 開啟 `/admin/courses` 確認後台可讀寫（**正式上線前請補強 `/admin` 權限**，見 `README.md`）。
4. 若首頁或課程頁仍有錯誤，檢查 `DATABASE_URL` 是否在 **Build + Runtime** 皆有值，並查看 Web 服務 **Logs**。

## 六、安全提醒

- **不要**把含密碼的 `.env` 提交到 Git（已在 `.gitignore`）。
- 正式站 **不要**設 `SKIP_ENV_CHECK=1`。

## 七、相關檔案

- `.env.example` — 變數說明與本機／Zeabur 對照  
- `lib/env-check.ts` — 啟動時檢查的變數規則  
- `next.config.ts` — `turbopack.root`（本機）、`serverExternalPackages`（Prisma）
