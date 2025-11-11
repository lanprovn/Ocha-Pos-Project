# Script để khởi động cả Backend và Frontend
# Chạy từ thư mục root: .\START_ALL.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KHOI DONG BACKEND & FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Tạo .env.local cho frontend
Write-Host "[1/3] Tao file .env.local..." -ForegroundColor Yellow
$frontendEnvPath = "frontend\.env.local"
if (-not (Test-Path $frontendEnvPath)) {
    $envContent = @"
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true

# App Configuration
VITE_APP_NAME=Ocha Việt POS
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
"@
    $envContent | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "  ✅ Đã tạo file .env.local" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  File .env.local đã tồn tại" -ForegroundColor Gray
}
Write-Host ""

# Bước 2: Khởi động Backend
Write-Host "[2/3] Khoi dong Backend..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== BACKEND SERVER ===' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 2
Set-Location ..
Write-Host "  ✅ Backend đang khởi động..." -ForegroundColor Green
Write-Host "     URL: http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Bước 3: Đợi backend sẵn sàng
Write-Host "[3/3] Doi backend san sang..." -ForegroundColor Yellow
$maxAttempts = 10
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "  ✅ Backend đã sẵn sàng!" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⏳ Đang đợi... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host "  ⚠️  Backend chưa sẵn sàng sau $maxAttempts lần thử" -ForegroundColor Yellow
    Write-Host "     Vui lòng kiểm tra backend thủ công" -ForegroundColor Gray
}
Write-Host ""

# Bước 4: Khởi động Frontend
Write-Host "[4/4] Khoi dong Frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== FRONTEND SERVER ===' -ForegroundColor Cyan; npm run dev"
Set-Location ..
Write-Host "  ✅ Frontend đang khởi động..." -ForegroundColor Green
Write-Host "     URL: http://localhost:3000 (hoặc port khác)" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ HOAN TAT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 TRANG THAI:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000 (hoặc port khác)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 KIEM TRA:" -ForegroundColor Yellow
Write-Host "  1. Mở browser và truy cập frontend URL" -ForegroundColor White
Write-Host "  2. Mở DevTools (F12) -> Console" -ForegroundColor White
Write-Host "  3. Tìm: 'Loading products from API...'" -ForegroundColor White
Write-Host "  4. Network tab -> Xem request /api/products" -ForegroundColor White
Write-Host ""

