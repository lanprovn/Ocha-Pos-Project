# Script để seed database từ frontend data
# Chạy: .\seed-database.ps1

Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SEED DATABASE TỪ FRONTEND DATA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ File .env không tồn tại!" -ForegroundColor Red
    Write-Host "   Vui lòng tạo file .env với DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra file products.json
$productsJsonPath = "..\frontend\src\assets\products.json"
if (-not (Test-Path $productsJsonPath)) {
    Write-Host "❌ File products.json không tồn tại!" -ForegroundColor Red
    Write-Host "   Đường dẫn: $productsJsonPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ File products.json OK" -ForegroundColor Green
Write-Host ""

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules chưa có, đang cài đặt..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Kiểm tra Prisma Client
Write-Host "📦 Kiểm tra Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
Write-Host ""

# Chạy seed
Write-Host "🌱 Đang seed database..." -ForegroundColor Yellow
Write-Host "   (Đọc dữ liệu từ: $productsJsonPath)" -ForegroundColor Gray
Write-Host ""

try {
    npm run prisma:seed
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SEED THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Dữ liệu đã được import:" -ForegroundColor Cyan
    Write-Host "   - Categories từ frontend" -ForegroundColor White
    Write-Host "   - Products từ frontend (với sizes & toppings)" -ForegroundColor White
    Write-Host "   - Stock records cho tất cả products" -ForegroundColor White
    Write-Host "   - Orders mẫu" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Bây giờ bạn có thể:" -ForegroundColor Yellow
    Write-Host "   1. Test APIs: GET http://localhost:8080/api/products" -ForegroundColor White
    Write-Host "   2. Xem trong Prisma Studio: npm run prisma:studio" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ LỖI KHI SEED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Kiểm tra:" -ForegroundColor Yellow
    Write-Host "   - Database đã được tạo chưa?" -ForegroundColor White
    Write-Host "   - Migration đã chạy chưa? (npm run prisma:migrate)" -ForegroundColor White
    Write-Host "   - DATABASE_URL trong .env đúng chưa?" -ForegroundColor White
    exit 1
}

