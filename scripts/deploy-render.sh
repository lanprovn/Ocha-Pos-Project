#!/bin/bash

# Script tự động deploy lên Render.com
# Chạy: bash scripts/deploy-render.sh

echo "🚀 Script Deploy Render.com - OCHA POS"
echo "======================================"
echo ""

# Kiểm tra đã đăng nhập Render CLI chưa
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI chưa được cài đặt"
    echo "📥 Cài đặt Render CLI:"
    echo "   npm install -g render-cli"
    echo ""
    echo "Hoặc deploy manual qua web: https://render.com"
    exit 1
fi

echo "✅ Render CLI đã được cài đặt"
echo ""

# Kiểm tra đã login chưa
if ! render whoami &> /dev/null; then
    echo "🔐 Chưa đăng nhập Render"
    echo "📝 Đang mở trình duyệt để đăng nhập..."
    render login
fi

echo "✅ Đã đăng nhập Render"
echo ""

# Deploy từ Blueprint
echo "📦 Đang deploy từ render.yaml..."
render blueprint launch

echo ""
echo "✅ Deploy thành công!"
echo ""
echo "📋 Bước tiếp theo:"
echo "1. Vào Render Dashboard → Services"
echo "2. Copy Backend URL (ví dụ: https://ocha-pos-backend.onrender.com)"
echo "3. Deploy Frontend:"
echo "   - New → Static Site"
echo "   - Connect GitHub repo"
echo "   - Build Command: cd frontend && npm install && npm run build"
echo "   - Publish Directory: frontend/dist"
echo "   - Environment: VITE_API_URL=<backend-url>"
echo "4. Cập nhật FRONTEND_URL trong Backend Environment"
echo ""

