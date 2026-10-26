@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Deploy Talk with Emma
echo.
echo  ==== Dua app Talk with Emma len Vercel ====
echo.

where node >nul 2>nul
if errorlevel 1 goto :nonode

echo  [1/3] Kiem tra dang nhap Vercel...
call npx --yes vercel whoami >nul 2>nul
if not errorlevel 1 goto :key
echo        Chua dang nhap. Trinh duyet se mo ra de ban dang nhap Vercel.
call npx --yes vercel login
if errorlevel 1 goto :loginfail

:key
echo  [2/3] Dua Claude API key tu .env.local len Vercel (neu co)...
set "EMMA_KEY="
if not exist ".env.local" goto :nokey
for /f "usebackq tokens=1,* delims==" %%A in (".env.local") do if /i "%%A"=="ANTHROPIC_API_KEY" set "EMMA_KEY=%%B"
if not defined EMMA_KEY goto :nokey
set "EMMA_KEY=%EMMA_KEY:"=%"
call npx --yes vercel env rm ANTHROPIC_API_KEY production -y >nul 2>nul
<nul set /p "=%EMMA_KEY%" > "%TEMP%\emma_key.txt"
call npx --yes vercel env add ANTHROPIC_API_KEY production < "%TEMP%\emma_key.txt"
del "%TEMP%\emma_key.txt" >nul 2>nul
set "EMMA_KEY="
echo        Da cap nhat key tren Vercel.
goto :deploy

:nokey
echo        Khong thay key trong .env.local - app se chay che do co ban.

:deploy
echo  [3/3] Dang deploy...
call npx --yes vercel deploy --prod --yes
if errorlevel 1 goto :deployfail
echo.
echo  ==== XONG! Link app la dong "Production:" hoac "Aliased:" o tren ====
echo  Mo link do bang Chrome hoac Edge, cho phep micro la dung duoc.
echo.
pause
exit /b 0

:nonode
echo  [!] Chua cai Node.js. Tai tai https://nodejs.org roi chay lai file nay.
pause
exit /b 1

:loginfail
echo  [!] Dang nhap Vercel that bai. Thu lai nhe.
pause
exit /b 1

:deployfail
echo.
echo  [!] Deploy loi. Chup man hinh cua so nay gui cho Claude nhe.
pause
exit /b 1
