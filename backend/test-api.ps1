# PowerShell Script để Test Backend APIs
# Chạy: .\test-api.ps1

$baseUrl = "http://localhost:8080"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST BACKEND APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "   ✅ Health Check OK" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Products
Write-Host "2. Testing GET /api/products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get
    Write-Host "   ✅ Get Products OK" -ForegroundColor Green
    Write-Host "   Số lượng sản phẩm: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Products Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get Categories
Write-Host "3. Testing GET /api/categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/categories" -Method Get
    Write-Host "   ✅ Get Categories OK" -ForegroundColor Green
    Write-Host "   Số lượng danh mục: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Categories Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Orders
Write-Host "4. Testing GET /api/orders..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method Get
    Write-Host "   ✅ Get Orders OK" -ForegroundColor Green
    Write-Host "   Số lượng đơn hàng: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Orders Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Today Orders
Write-Host "5. Testing GET /api/orders/today..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/orders/today" -Method Get
    Write-Host "   ✅ Get Today Orders OK" -ForegroundColor Green
    Write-Host "   Số lượng đơn hàng hôm nay: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Today Orders Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Dashboard Stats
Write-Host "6. Testing GET /api/dashboard/stats..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method Get
    Write-Host "   ✅ Get Dashboard Stats OK" -ForegroundColor Green
    Write-Host "   Total Products: $($response.overview.totalProducts)" -ForegroundColor Gray
    Write-Host "   Total Orders: $($response.overview.totalOrders)" -ForegroundColor Gray
    Write-Host "   Today Revenue: $($response.overview.todayRevenue)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Dashboard Stats Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get Stock Products
Write-Host "7. Testing GET /api/stock/products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/stock/products" -Method Get
    Write-Host "   ✅ Get Stock Products OK" -ForegroundColor Green
    Write-Host "   Số lượng stock: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Get Stock Products Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST HOÀN TẤT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Để test tạo data:" -ForegroundColor Yellow
Write-Host "   - Dùng Postman hoặc Thunder Client" -ForegroundColor White
Write-Host "   - Hoặc mở file test.http trong VS Code" -ForegroundColor White
Write-Host "   - Hoặc dùng curl commands" -ForegroundColor White
Write-Host ""

