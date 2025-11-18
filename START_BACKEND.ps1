# Script to start backend with visible output
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 KHỞI ĐỘNG BACKEND SERVER" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "📁 Thư mục: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "🔍 Kiểm tra prerequisites..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "❌ LỖI: File .env không tồn tại!" -ForegroundColor Red
    Write-Host "💡 Vui lòng tạo file .env với DATABASE_URL và PORT=8080" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "✅ File .env: OK" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Cài đặt dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
        pause
        exit 1
    }
}
Write-Host "✅ node_modules: OK" -ForegroundColor Green

# Generate Prisma
Write-Host "🔧 Generate Prisma Client..." -ForegroundColor Yellow
npx prisma generate | Out-Null
Write-Host "✅ Prisma Client: OK" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 ĐANG KHỞI ĐỘNG SERVER..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Backend sẽ chạy tại: http://localhost:8080" -ForegroundColor Green
Write-Host "🔗 API endpoint: http://localhost:8080/api" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

# Start server
npm run dev

