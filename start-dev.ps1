Write-Host "Starting Angular development server with increased memory allocation..." -ForegroundColor Green
Write-Host ""
Write-Host "Memory allocation: 8GB" -ForegroundColor Yellow
Write-Host "Configuration: Development" -ForegroundColor Yellow
Write-Host ""

try {
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng serve --configuration=development --open
}
catch {
    Write-Host "Error starting development server: $_" -ForegroundColor Red
    Read-Host "Press Enter to continue"
}
