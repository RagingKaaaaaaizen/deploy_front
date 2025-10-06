@echo off
echo ========================================
echo Testing Render Build Process Locally
echo ========================================
echo.

echo Step 1: Cleaning previous build...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules

echo Step 2: Installing dependencies with --include=dev...
call npm ci --include=dev --legacy-peer-deps

echo.
echo Step 3: Checking if @angular/cli is installed...
if exist node_modules\@angular\cli (
    echo [SUCCESS] Angular CLI found!
) else (
    echo [ERROR] Angular CLI not found!
    exit /b 1
)

echo.
echo Step 4: Counting installed packages...
for /f %%i in ('dir /b /s node_modules 2^>nul ^| find /c /v ""') do set count=%%i
echo Installed packages: %count%

echo.
echo Step 5: Building for production...
set NODE_OPTIONS=--max_old_space_size=8192
call npm run build:prod

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] Build completed successfully!
    echo ========================================
    echo.
    echo Build output location: dist\angular-signup-verification-boilerplate
    if exist dist\angular-signup-verification-boilerplate (
        echo Verifying build output...
        dir dist\angular-signup-verification-boilerplate
    )
) else (
    echo.
    echo ========================================
    echo [ERROR] Build failed!
    echo ========================================
    exit /b 1
)

