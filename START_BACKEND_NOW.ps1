# Script to start backend server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "⚠️  Please create .env file first" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client!" -ForegroundColor Red
    exit 1
}

# Check if port 8080 is in use
$port8080 = netstat -ano | findstr :8080
if ($port8080) {
    Write-Host "⚠️  Port 8080 is already in use!" -ForegroundColor Yellow
    Write-Host "🔄 Stopping existing processes on port 8080..." -ForegroundColor Yellow
    
    $processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        Write-Host "🛑 Stopping process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    
    Start-Sleep -Seconds 2
}

# Start backend server
Write-Host "✅ Starting backend server on port 8080..." -ForegroundColor Green
Write-Host "📡 Backend will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 API endpoint: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
