# Script để push project lên GitHub
# Chạy: .\push-to-github.ps1

Write-Host "🚀 Chuẩn bị push project lên GitHub..." -ForegroundColor Cyan

# Kiểm tra đang ở đúng thư mục
if (-not (Test-Path "backend" -PathType Container) -or -not (Test-Path "frontend" -PathType Container)) {
    Write-Host "❌ Lỗi: Không tìm thấy thư mục backend hoặc frontend" -ForegroundColor Red
    Write-Host "Vui lòng chạy script này từ thư mục gốc của project" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra git đã được khởi tạo chưa
if (-not (Test-Path ".git" -PathType Container)) {
    Write-Host "📦 Khởi tạo git repository..." -ForegroundColor Yellow
    git init
}

# Kiểm tra remote
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔗 Thêm remote GitHub..." -ForegroundColor Yellow
    git remote add origin https://github.com/lanprovn/Ocha-Pos-Project.git
} else {
    Write-Host "✅ Remote đã được cấu hình: $remoteUrl" -ForegroundColor Green
}

# Kiểm tra file .env có bị commit không
Write-Host "🔍 Kiểm tra file nhạy cảm..." -ForegroundColor Cyan
$envFiles = git ls-files | Select-String -Pattern "\.env$|\.env\.local$"
if ($envFiles) {
    Write-Host "⚠️  Cảnh báo: Tìm thấy file .env trong git!" -ForegroundColor Red
    Write-Host "Đang xóa khỏi git cache..." -ForegroundColor Yellow
    git rm --cached backend/.env 2>$null
    git rm --cached frontend/.env.local 2>$null
    git rm --cached backend/.env.* 2>$null
    git rm --cached frontend/.env.* 2>$null
}

# Kiểm tra .env.example đã có chưa
if (-not (Test-Path "backend\.env.example")) {
    Write-Host "⚠️  Cảnh báo: backend\.env.example chưa tồn tại" -ForegroundColor Yellow
    Write-Host "File này đã được tạo tự động" -ForegroundColor Green
}

# Hiển thị status
Write-Host "`n📋 Trạng thái git:" -ForegroundColor Cyan
git status --short

Write-Host "`n📝 Các bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Kiểm tra các file sẽ được commit ở trên" -ForegroundColor White
Write-Host "2. Đảm bảo KHÔNG có file .env trong danh sách" -ForegroundColor White
Write-Host "3. Chạy các lệnh sau:" -ForegroundColor White
Write-Host ""
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host "   git commit -m 'feat: Complete OCHA POS Project with professional UI'" -ForegroundColor Yellow
Write-Host "   git push -u origin master" -ForegroundColor Yellow
Write-Host ""
Write-Host "Hoặc nếu branch là main:" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Bạn có muốn tự động thực hiện các bước trên không? (y/n)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host "`n📦 Đang add files..." -ForegroundColor Cyan
    git add .
    
    Write-Host "💾 Đang commit..." -ForegroundColor Cyan
    git commit -m "feat: Complete OCHA POS Project with professional UI

- Backend: Express + TypeScript + Prisma + PostgreSQL
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Features:
  - Professional POS interface
  - Stock Management (Products & Ingredients)
  - Order Management with real-time updates
  - Dashboard with analytics
  - Payment Gateway (VNPay + Bank QR Code)
  - Socket.io for real-time communication
  - Customer Display interface
  - Full CRUD operations
  - Environment setup with .env.example files"
    
    Write-Host "🚀 Đang push lên GitHub..." -ForegroundColor Cyan
    $branch = git branch --show-current
    if ([string]::IsNullOrEmpty($branch)) {
        $branch = "master"
    }
    git push -u origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push thành công!" -ForegroundColor Green
        Write-Host "🔗 Xem tại: https://github.com/lanprovn/Ocha-Pos-Project" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Push thất bại. Vui lòng kiểm tra:" -ForegroundColor Red
        Write-Host "- Đã đăng nhập GitHub chưa?" -ForegroundColor Yellow
        Write-Host "- Có quyền push vào repository không?" -ForegroundColor Yellow
        Write-Host "- Kiểm tra authentication: git config --global user.name và user.email" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ Đã chuẩn bị xong. Bạn có thể chạy các lệnh git thủ công." -ForegroundColor Green
}

