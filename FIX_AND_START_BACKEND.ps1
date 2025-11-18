# Script to fix and start backend
Write-Host "🔧 Fixing and Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "📁 Backend directory: $(Get-Location)" -ForegroundColor Green

# Step 1: Stop all Node processes
Write-Host ""
Write-Host "🛑 Step 1: Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ All Node processes stopped" -ForegroundColor Green

# Step 2: Check .env file
Write-Host ""
Write-Host "📋 Step 2: Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "⚠️  Please create .env file with DATABASE_URL and PORT=8080" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ .env file exists" -ForegroundColor Green

# Step 3: Install dependencies if needed
Write-Host ""
Write-Host "📦 Step 3: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ node_modules exists" -ForegroundColor Green
}

# Step 4: Generate Prisma client
Write-Host ""
Write-Host "🔧 Step 4: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Step 5: Check port 8080
Write-Host ""
Write-Host "🔍 Step 5: Checking port 8080..." -ForegroundColor Yellow
$port8080 = netstat -ano | findstr :8080
if ($port8080) {
    Write-Host "⚠️  Port 8080 is still in use!" -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        Write-Host "🛑 Stopping process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}
Write-Host "✅ Port 8080 is available" -ForegroundColor Green

# Step 6: Start backend
Write-Host ""
Write-Host "🚀 Step 6: Starting backend server..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📡 Backend will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 API endpoint: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Starting server... (This may take a few seconds)" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

Write-Host ""
Write-Host "✅ Backend server started in new window!" -ForegroundColor Green
Write-Host "📝 Check the new PowerShell window for server logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Wait 5-10 seconds for the server to fully start" -ForegroundColor Cyan
Write-Host "💡 Then refresh your frontend browser" -ForegroundColor Cyan


