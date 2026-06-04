@echo off
chcp 65001 >nul
echo ========================================
echo    SmartDorm - 部署到阿里云一键脚本
echo ========================================
echo.
echo 请把项目文件夹放在 C:\SmartDorm 目录下
echo 按任意键开始部署...
pause >nul

cd /d C:\SmartDorm

echo [1/6] 配置 npm 镜像源（加速下载）...
call npm config set registry https://registry.npmmirror.com

echo [2/6] 安装后端依赖...
cd api
call npm install
if %errorlevel% neq 0 (
    echo 后端安装失败，请检查网络
    pause
    exit /b
)

echo [3/6] 安装前端依赖...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo 前端安装失败
    pause
    exit /b
)

echo [4/6] 构建前端...
call npm run build
if %errorlevel% neq 0 (
    echo 前端构建失败
    pause
    exit /b
)

echo [5/6] 开放 3001 端口（防火墙）...
netsh advfirewall firewall add rule name="SmartDorm" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1

echo [6/6] 启动服务...
cd api
start "SmartDorm-Server" cmd /c "npm run dev"

echo.
echo ========================================
echo   部署成功！
echo ========================================
echo.
echo  服务器已启动！
echo.
echo  本地访问: http://localhost:3001
echo  公网访问: http://你的公网IP:3001
echo.
echo  管理员: adm / 123456
echo  住户: 张三 / 123456
echo.
echo  ⚠ 关闭这个窗口 = 关闭网站
echo  要让它一直在线，请继续安装 PM2:
echo  1. 另开一个cmd运行: npm install -g pm2
echo  2. 然后运行: pm2 start api/node_modules/.bin/tsx --name smartdorm -- api/src/index.ts
echo  3. 最后: pm2 save
echo.
pause
