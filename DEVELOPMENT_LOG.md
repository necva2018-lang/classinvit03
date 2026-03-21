# NECVA（classinvit03）開發過程紀錄

本文件依時間與主題整理截至目前為止的架構決策、功能實作與操作方式，供延續開發或交接參考。

---

## 一、技術棧總覽

| 項目 | 版本／選型 |
|------|------------|
| 框架 | Next.js **16.2.1**（App Router、Turbopack dev） |
| 語言 | TypeScript 5 |
| UI | React 19、Tailwind CSS **4**、**Noto Sans TC**（`app/layout.tsx`） |
| 資料庫 | **PostgreSQL**（目標部署：**Zeabur**） |
| ORM | **Prisma 6**（刻意固定 6.x，避免 Prisma 7 datasource 設定變更） |
| 後台表格 | **TanStack Table**（`@tanstack/react-table`） |
| 元件基礎 | **Radix UI** + **class-variance-authority** + **tailwind-merge**（shadcn/ui 相容寫法；因環境無法連線 shadcn registry，改為手動建立 `components/ui/*`） |

---

## 二、資料層演進

### 2.1 從 Supabase 改為 Zeabur PostgreSQL

- 早期曾以 **Supabase**（`@supabase/supabase-js` + RLS）讀寫 `courses`。
- 後改為 **一般 PostgreSQL 連線字串** `DATABASE_URL`，伺服器端以 **`pg`** 查詢。
- 再改為 **Prisma**，移除 `pg`，統一由 `lib/db.ts` 的 `PrismaClient` 單例存取。

### 2.2 Prisma 設定

- **Schema**：`prisma/schema.prisma`
- **連線**：`datasource db { url = env("DATABASE_URL") }`
- **Client 單例**：`lib/db.ts`（利用 `globalThis` 避免 Next.js 開發熱重載重複建立連線）

### 2.3 資料模型（TibaMe／課程平台取向）

| 模型 | 用途摘要 |
|------|-----------|
| **User** | 會員；`UserRole`：`STUDENT` / `INSTRUCTOR` / `ADMIN`；可選 `phone`、`avatarUrl` |
| **Category** | 課程分類 |
| **Course** | 標題、描述、價格、原價、封面 URL、講師名稱、評分（Decimal）、評價數、slug、`filterTags`、關聯分類；可選 `instructorUserId` 綁講師帳號 |
| **Chapter** | 課程章節（排序、摘要、內文、影片 URL、試看旗標等） |
| **Order** | 訂單；金額、幣別、狀態字串；可選 `orderNumber`、`paidAt`、`paymentProvider`、`externalPaymentId` |

### 2.4 遷移檔

- `prisma/migrations/20250322130000_init/`：初始表（users, categories, courses, orders）
- `prisma/migrations/20250323140000_tibame_course_chapters_orders/`：User 角色與欄位、`chapters` 表、Course 講師 FK、Order 擴充欄位與索引
- `prisma/migrations/migration_lock.toml`：provider `postgresql`（位於 `migrations` 目錄內）

### 2.5 種子資料

- `prisma/seed.ts`：6 個分類、8 門課程（固定 UUID）、其中一門課 3 個章節範例
- 執行：`npm run db:seed`（需有效 `DATABASE_URL`）

### 2.6 已移除／取代的檔案

- 舊 **`db/migrations/001_courses.sql`**（純 SQL 種子）已刪除，改由 Prisma migrate + seed 管理
- **`lib/db/pool.ts`**（`pg`）已刪除
- **`lib/supabase/*`** 已刪除

---

## 三、環境變數與連線檢查

### 3.1 `.env` 與 Prisma

- **`DATABASE_URL`** 建議寫在專案根目錄 **`.env`**（Prisma CLI 預設讀取；**不讀** `.env.local`）
- Next.js 亦會載入 `.env`，與前台 API 共用
- **`.env.example`**：範本與註解（勿提交真實密碼）

### 3.2 連線字串格式檢查

- 腳本：`scripts/validate-database-url-format.mjs`
- 指令：`npm run check:db-url`
- 行為：驗證 `postgresql://` 可解析、有主機與資料庫路徑等，**不輸出完整連線字串**

### 3.3 Zeabur 部署相關

- `package.json` 的 **`engines.node`**：`>=20.9.0`
- **`.dockerignore`**：縮小建置上下文（略）
- 正式環境：在 Zeabur **Web 服務 Variables** 設定與資料庫一致的 `DATABASE_URL`；遷移建議在可信環境對同一 DB 執行 `npx prisma migrate deploy`

---

## 四、前台（學員端）功能

### 4.1 路由群組 `app/(site)/`

為與後台版型分離，將含 **Navbar + Footer** 的頁面置於 **`(site)`**：

- `app/(site)/layout.tsx`：`NavbarShell`、`<main id="main-content">`、`Footer`
- `app/(site)/page.tsx`：首頁
- `app/(site)/courses/`：課程列表、課程詳情 `[id]`（UUID）
- `app/(site)/search/`：搜尋（伺服端讀課程後比對）
- `app/(site)/opengraph-image.tsx`：OG 圖

### 4.2 根版面 `app/layout.tsx`

- 僅保留 `html` / `body`、字體、`SkipToMain`、`globals.css`、**不再**包前台導覽列（避免後台重複導覽）

### 4.3 課程資料流

- **伺服端查詢**：`lib/courses-queries.ts`（`fetchCourses`、`fetchCourseById`）使用 **Prisma**
- **列表頁客戶端**：`components/courses/course-list-client.tsx` 透過 **`GET /api/courses`** 取 JSON（因 `DATABASE_URL` 不可暴露於瀏覽器）
- **API**：`app/api/courses/route.ts`（`runtime = "nodejs"`）
- **對外課程型別**：`lib/types/course.ts`、`lib/course-mapper.ts`（`mapPrismaCourse`，含 `category.name`）

### 4.4 圖片遠端網域（`next/image`）

`next.config.ts` 的 `images.remotePatterns` 已設定：

- `images.unsplash.com`
- `images.pexels.com`（後續因課程封面使用 Pexels 而加入）

變更 `next.config` 後需**重啟** `npm run dev`。

---

## 五、後台 `/admin`

### 5.1 路由與版型

- `app/(admin)/admin/layout.tsx`：`AdminShell`、metadata `robots: noindex`
- `app/(admin)/admin/page.tsx`：導向 `/admin/courses`
- **側邊欄**：`components/admin/admin-shell.tsx`、`admin-nav-links.tsx`；手機以 **Sheet**（`components/ui/sheet.tsx`）收合選單
- **注意**：目前**無登入／權限**，上線前應補驗證與 `UserRole.ADMIN` 檢查

### 5.2 課程管理

| 路徑 | 說明 |
|------|------|
| `/admin/courses` | **DataTable** 列出所有課程；**新增課程**按鈕 |
| `/admin/courses/new` | 新增表單 |
| `/admin/courses/[id]` | 編輯表單；列表列點擊導向此頁 |

- **Server Actions**：`app/(admin)/admin/courses/actions.ts`（`createCourse`、`updateCourse`）
- **後台查詢**：`lib/admin/courses-server.ts`
- **slug**：`lib/slug.ts`；新建課程會在 slug 後加短 UUID 後綴以降低唯一性衝突

### 5.3 RSC → Client 序列化修正

- **問題**：Prisma 的 **`Decimal`**（如 `rating`）與 **`Category` 上的 `Date`** 不可直接作為 props 傳入 Client Component
- **解法**：`lib/admin/course-form-serialize.ts` 的 `toCourseFormInitialValues`、`toCategoryFormOptions`
- **表單元件**：`components/admin/course-form.tsx`（僅接受純值型別）

### 5.4 shadcn 風格 UI（手動建立）

- `lib/utils.ts`：`cn()`
- `tailwind.config.ts`：shadcn 色票、`sidebar.*`、`necva` 品牌色保留
- `app/globals.css`：`@plugin "tailwindcss-animate"`、CSS 變數（HSL）
- `components/ui/`：`button`、`table`、`input`、`label`、`separator`、`sheet`
- `components.json`：記錄別名與風格（供日後對齊官方 CLI）

---

## 六、常用指令速查

```bash
npm install
npm run dev

# 連線字串檢查（不顯示密碼）
npm run check:db-url

# 資料庫（需 DATABASE_URL）
npx prisma migrate deploy   # 套用遷移（上線／共用 DB）
npx prisma migrate dev      # 本機開發產生並套用遷移
npm run db:seed
npm run db:studio

npm run build
npm run start
```

---

## 七、已知限制與後續建議

1. **後台無驗證**：需接入登入與角色控管。
2. **訂單／章節後台**：模型已有，UI 尚未做完整 CRUD。
3. **Prisma 7**：`package.json` 的 `prisma.seed` 設定日後可能需遷移至 `prisma.config.ts`（目前為 Prisma 6）。
4. **遠端圖片**：若再使用新 CDN，須同步擴充 `next.config.ts` 的 `remotePatterns`。

---

## 八、文件維護

- 本檔路徑：**`DEVELOPMENT_LOG.md`**
- 重大架構或流程變更時，建議同步更新本檔與 **`.env.example`** 註解。

*最後更新：依目前程式庫狀態整理（Next 16.2.1 + Prisma 6 + Zeabur 取向）。*
