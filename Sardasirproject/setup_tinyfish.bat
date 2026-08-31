@echo off
echo.
echo ================================
echo TinyFish Setup Script
echo ================================
echo.

cd /d "%~dp0"

echo Checking Supabase CLI...
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Supabase CLI not found!
    echo.
    echo Please install Supabase CLI:
    echo   npm install -g supabase
    echo.
    echo Or run the SQL migration manually:
    echo   1. Go to: https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new
    echo   2. Paste and run: migrations/add_tinyfish_provider.sql
    echo.
    pause
    exit /b 1
)

echo [OK] Supabase CLI found
echo.

echo Running database migration...
echo.

supabase db push --db-url "postgresql://postgres.xfbbxtrzyeocbpwnjhcz:[YOUR_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" --file migrations/add_tinyfish_provider.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Migration failed!
    echo.
    echo Please run manually:
    echo   1. Go to: https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new
    echo   2. Copy contents from: migrations/add_tinyfish_provider.sql
    echo   3. Click "Run"
    echo.
    pause
    exit /b 1
)

echo.
echo ================================
echo Migration completed successfully!
echo ================================
echo.
echo Next steps:
echo   1. Go to LawMind AI Settings page
echo   2. Find "TinyFish Web Agent" card
echo   3. Paste API key: YOUR_TINYFISH_API_KEY
echo   4. Enable and Save
echo.
pause
