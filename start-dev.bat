@echo off
echo Starting Angular development server with increased memory allocation...
echo.
echo Memory allocation: 8GB
echo Configuration: Development
echo.
node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng serve --configuration=development --open
pause
