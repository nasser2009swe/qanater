@echo off
echo.
echo ===================================
echo   القناطر الخيرية - تشغيل الموقع
echo ===================================
echo.
echo جاري تشغيل الموقع على المتصفح...
echo الرابط: http://localhost:8080
echo.
echo اضغط Ctrl+C لإيقاف الموقع
echo.
python -m http.server 8080
pause
