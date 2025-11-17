# Script để sửa commit messages theo format: type (EN) + mô tả (VI)
# Format: feat: Cập nhật tính năng

Write-Host "Đang sửa commit messages..." -ForegroundColor Cyan

# Sửa commit gần nhất về UI
git commit --amend -m "feat: Cập nhật giao diện chuyên nghiệp"

# Sửa commit về docs
git commit --amend -m "docs: Cập nhật tài liệu" --no-edit

Write-Host "Đã cập nhật commit messages!" -ForegroundColor Green
Write-Host "Format: <type>: <mô tả tiếng Việt>" -ForegroundColor Yellow

