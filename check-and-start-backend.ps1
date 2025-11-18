# Script để kiểm tra và khởi động Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA VA KHOI DONG BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra xem backend có đang chạy không
Write-Host "[1/4] Kiem tra backend co dang chay..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend đang chạy tại http://localhost:8080" -ForegroundColor Green
        Write-Host "  Vui lòng kiểm tra lại frontend!" -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "  ❌ Backend không chạy hoặc không kết nối được" -ForegroundColor Red
    Write-Host "  Lỗi: $_" -ForegroundColor Gray
}
Write-Host ""

# Kiểm tra file .env
Write-Host "[2/4] Kiem tra file .env..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path .env)) {
    Write-Host "  ⚠️  File .env không tồn tại!" -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Write-Host "  📝 Đang tạo file .env từ .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "  ✅ Đã tạo file .env" -ForegroundColor Green
        Write-Host "  ⚠️  VUI LÒNG CẬP NHẬT CÁC GIÁ TRỊ TRONG FILE .env!" -ForegroundColor Red
        Write-Host "  Đặc biệt là DATABASE_URL và JWT_SECRET" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Nhấn Enter để tiếp tục sau khi đã cập nhật .env..." -ForegroundColor Cyan
        Read-Host
    } else {
        Write-Host "  ❌ File .env.example không tồn tại!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "  ✅ File .env đã tồn tại" -ForegroundColor Green
}
Write-Host ""

# Kiểm tra node_modules
Write-Host "[3/4] Kiem tra dependencies..." -ForegroundColor Yellow
if (-not (Test-Path node_modules)) {
    Write-Host "  📦 Đang cài đặt dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "  ✅ Dependencies đã sẵn sàng" -ForegroundColor Green
}
Write-Host ""

# Kiểm tra Prisma
Write-Host "[4/4] Kiem tra Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "  ✅ Prisma đã sẵn sàng" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Có thể có lỗi với Prisma: $_" -ForegroundColor Yellow
}
Write-Host ""

# Khởi động backend
Write-Host "========================================" -ForegroundColor Green
Write-Host "KHOI DONG BACKEND SERVER..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Health Check: http://localhost:8080/health" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:8080/api-docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host ""

# Start server
npm run dev

