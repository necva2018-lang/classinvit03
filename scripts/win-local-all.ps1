#Requires -Version 5.1
<#
  Windows 一鍵：Docker Postgres → migrate → seed → next dev
  使用：npm run win:all
  前提：已安裝 Docker Desktop 且已啟動；本機 DB 連線字串見 .env.example
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$localDbUrl = "postgresql://classinvit:classinvit_local@localhost:5432/classinvit"

Write-Host "[win:all] 專案目錄: $root" -ForegroundColor Cyan

# 釋放 3000（舊的 next dev）
try {
  Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      Write-Host "[win:all] 結束佔用埠 3000 的程序 PID $($_.OwningProcess)" -ForegroundColor Yellow
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
} catch {}

# Docker
try {
  $null = Get-Command docker -ErrorAction Stop
} catch {
  Write-Host "[win:all] 找不到 docker。請安裝 Docker Desktop 並確認 PATH 後再執行。" -ForegroundColor Red
  exit 1
}

Write-Host "[win:all] docker compose up -d …" -ForegroundColor Cyan
docker compose up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[win:all] 等待 PostgreSQL …" -ForegroundColor Cyan
node scripts/wait-for-postgres.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:DATABASE_URL = $localDbUrl
Write-Host "[win:all] prisma migrate deploy …" -ForegroundColor Cyan
npm run db:deploy
if ($LASTEXITCODE -ne 0) { Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; exit $LASTEXITCODE }

Write-Host "[win:all] prisma seed …" -ForegroundColor Cyan
npm run db:seed
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[win:all] 若要以本機 Docker 資料庫開發，請將 .env 的 DATABASE_URL 設為：" -ForegroundColor DarkYellow
Write-Host "  $localDbUrl" -ForegroundColor DarkYellow

Write-Host "[win:all] 啟動 next dev …" -ForegroundColor Cyan
npm run dev
