# Script để start backend server
Write-Host "=== OCHA POS Backend Server ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra .env
if (-not (Test-Path .env)) {
    Write-Host "❌ File .env không tồn tại!" -ForegroundColor Red
    Write-Host "Vui lòng tạo file .env từ .env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ File .env đã có" -ForegroundColor Green

# Kiểm tra node_modules
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Đang cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Dependencies đã sẵn sàng" -ForegroundColor Green
Write-Host ""

# Kiểm tra Prisma
Write-Host "🔍 Kiểm tra Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma đã sẵn sàng" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Lỗi Prisma: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Đang khởi động backend server..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8080" -ForegroundColor Gray
Write-Host "   Health Check: http://localhost:8080/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

# Start server
npm run dev

