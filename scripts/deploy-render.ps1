# Script tự động deploy lên Render.com (PowerShell)
# Chạy: .\scripts\deploy-render.ps1

Write-Host "🚀 Script Deploy Render.com - OCHA POS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra đã cài Render CLI chưa
try {
    $renderVersion = render --version 2>$null
    Write-Host "✅ Render CLI đã được cài đặt" -ForegroundColor Green
} catch {
    Write-Host "❌ Render CLI chưa được cài đặt" -ForegroundColor Red
    Write-Host "📥 Cài đặt Render CLI:" -ForegroundColor Yellow
    Write-Host "   npm install -g render-cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hoặc deploy manual qua web: https://render.com" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Kiểm tra đã login chưa
try {
    render whoami 2>$null | Out-Null
    Write-Host "✅ Đã đăng nhập Render" -ForegroundColor Green
} catch {
    Write-Host "🔐 Chưa đăng nhập Render" -ForegroundColor Yellow
    Write-Host "📝 Đang mở trình duyệt để đăng nhập..." -ForegroundColor Yellow
    render login
}

Write-Host ""

# Hướng dẫn deploy manual
Write-Host "📋 Hướng dẫn Deploy:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vào https://render.com → New → Blueprint" -ForegroundColor White
Write-Host "2. Connect GitHub repository: lanprovn/Ocha-Pos-Project" -ForegroundColor White
Write-Host "3. Render sẽ tự động detect render.yaml và deploy" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc deploy manual:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  - New → Web Service" -ForegroundColor White
Write-Host "  - Connect GitHub → Chọn repo" -ForegroundColor White
Write-Host "  - Root Directory: backend" -ForegroundColor White
Write-Host "  - Build Command: npm install && npm run build" -ForegroundColor White
Write-Host "  - Start Command: npm run start:prod" -ForegroundColor White
Write-Host ""
Write-Host "Database:" -ForegroundColor Cyan
Write-Host "  - New → PostgreSQL" -ForegroundColor White
Write-Host "  - Plan: Free" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  - New → Static Site" -ForegroundColor White
Write-Host "  - Connect GitHub → Chọn repo" -ForegroundColor White
Write-Host "  - Build Command: cd frontend && npm install && npm run build" -ForegroundColor White
Write-Host "  - Publish Directory: frontend/dist" -ForegroundColor White
Write-Host "  - Environment: VITE_API_URL=<backend-url>" -ForegroundColor White
Write-Host ""

