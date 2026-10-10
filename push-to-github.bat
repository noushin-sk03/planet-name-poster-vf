@echo off
echo ================================================
echo  Planet Name Poster - Push to GitHub
echo ================================================
echo.
cd /d "%~dp0"
echo Pushing to GitHub... (a login window may pop up)
echo.
".mingit\cmd\git.exe" push origin main
echo.
if %ERRORLEVEL% EQU 0 (
  echo SUCCESS! Your site is now on GitHub.
  echo.
  echo To deploy on Netlify, go to:
  echo   https://app.netlify.com
  echo   Add new site ^> Import from GitHub ^> planet-name-poster
) else (
  echo FAILED. Check your internet connection and try again.
)
echo.
pause
