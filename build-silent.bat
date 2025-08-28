@echo off
echo Building Angular application with suppressed warnings...
set NODE_OPTIONS=--max_old_space_size=8192
npm run build 2>&1 | findstr /v "CommonJS or AMD dependencies can cause optimization bailouts" | findstr /v "Warning:"
echo Build completed!
