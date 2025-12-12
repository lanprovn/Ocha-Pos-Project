@echo off
REM Script to create .env file with default values based on backend configuration
REM Run this script: create-env.bat

echo ========================================
echo Creating .env file for OCHA POS Backend
echo ========================================
echo.

REM Check if .env already exists
if exist .env (
    echo ⚠️  File .env already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo ❌ Cancelled. Keeping existing .env file.
        pause
        exit /b
    )
    echo.
    echo 🗑️  Removing existing .env file...
    del .env
)

REM Prompt for database password
echo.
echo 📝 Please enter your PostgreSQL configuration:
echo.
set /p db_password="PostgreSQL password (default: 191200): "
if "%db_password%"=="" set db_password=191200

set /p db_user="PostgreSQL username (default: postgres): "
if "%db_user%"=="" set db_user=postgres

set /p db_name="Database name (default: ocha_pos): "
if "%db_name%"=="" set db_name=ocha_pos

set /p db_port="PostgreSQL port (default: 5432): "
if "%db_port%"=="" set db_port=5432

REM Generate JWT secret (32+ characters)
set jwt_secret=ocha_pos_jwt_secret_key_2024_secure_min_32_chars

REM Create .env file
echo.
echo 📄 Creating .env file...
(
echo # Environment
echo NODE_ENV=development
echo PORT=8080
echo.
echo # Database Configuration
echo DATABASE_URL="postgresql://%db_user%:%db_password%@localhost:%db_port%/%db_name%?schema=public"
echo.
echo # JWT Configuration
echo JWT_SECRET="%jwt_secret%"
echo JWT_EXPIRES_IN=7d
echo.
echo # Frontend ^& Backend URLs (support multiple origins separated by comma)
echo FRONTEND_URL=http://localhost:3000,http://localhost:5173
echo BACKEND_URL=http://localhost:8080
echo.
echo # Logging
echo LOG_LEVEL=info
echo.
echo # Bank QR Code (Optional)
echo BANK_CODE=
echo BANK_ACCOUNT_NUMBER=
echo BANK_ACCOUNT_NAME=
echo QR_TEMPLATE=print
echo.
echo # Cloudinary Configuration (Optional)
echo CLOUDINARY_CLOUD_NAME=
echo CLOUDINARY_API_KEY=
echo CLOUDINARY_API_SECRET=
) > .env

echo.
echo ✅ .env file created successfully!
echo.
echo 📋 Configuration summary:
echo    - Database: %db_name%
echo    - User: %db_user%
echo    - Port: %db_port%
echo    - Frontend URLs: http://localhost:3000, http://localhost:5173
echo.
echo ⚠️  Please verify the .env file and update if needed.
echo.
pause
