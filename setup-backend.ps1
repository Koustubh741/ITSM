# Asset Management Platform - Quick Start
# This script helps you set up the backend

Write-Host "🚀 Asset Management Backend Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "✓ Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
$backendPath = "C:\Users\HP\OneDrive\Desktop\Asset management\asset-management\backend"
Set-Location $backendPath
Write-Host "✓ Changed directory to backend" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
try {
    pip install -r requirements.txt
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Some packages may have failed to install" -ForegroundColor Yellow
}
Write-Host ""

# Check if .env exists
Write-Host "🔧 Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .env file not found! Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  ⚠️  IMPORTANT: Please edit .env and add your PostgreSQL password!" -ForegroundColor Red
}
Write-Host ""

# Test database connection
Write-Host "🗄️  Testing database connection..." -ForegroundColor Yellow
try {
    $result = python -c "from database import test_connection; success, msg = test_connection(); print(msg); exit(0 if success else 1)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Database connection failed!" -ForegroundColor Red
        Write-Host "  $result" -ForegroundColor Red
        Write-Host "  Please check your .env file and ensure PostgreSQL is running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not test database connection" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Completion message
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env and add your PostgreSQL password" -ForegroundColor White
Write-Host "2. Create admin user in pgAdmin (see INTEGRATION_GUIDE.md)" -ForegroundColor White
Write-Host "3. Run: python main.py" -ForegroundColor White
Write-Host "4. Visit: http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - backend\README.md" -ForegroundColor White
Write-Host "   - INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
