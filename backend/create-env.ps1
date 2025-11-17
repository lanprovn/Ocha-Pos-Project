# Script to create .env file from .env.example
# Run this script: .\create-env.ps1

if (Test-Path .env) {
    Write-Host "File .env already exists. Skipping..." -ForegroundColor Yellow
} else {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file successfully!" -ForegroundColor Green
        Write-Host "⚠️  Please update the values in .env file with your actual configuration." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: .env.example file not found!" -ForegroundColor Red
    }
}

