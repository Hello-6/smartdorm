@echo off
chcp 65001 >nul
echo ========================================
echo    SmartDorm 一键部署脚本
echo    阿里云 Windows Server
echo ========================================
echo.

cd /d C:\SmartDorm

echo [1/4] 安装后端依赖...
cd api
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败
    echo 尝试切换镜像源...
    call npm config set registry https://registry.npmmirror.com
    call npm install
    if %errorlevel% neq 0 (
        echo 仍然失败，请检查网络连接
        pause
        exit /b
    )
)

echo [2/4] 构建前端...
cd ..
call npm install
echo 构建中，请稍候...
call npm run build
if %errorlevel% neq 0 (
    echo 前端构建失败
    pause
    exit /b
)

echo [3/4] 配置防火墙（允许 3001 端口）...
netsh advfirewall firewall add rule name="SmartDorm" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1
echo 防火墙规则已添加

echo [4/4] 启动服务...
cd api
start "SmartDorm" cmd /c "npm run dev"

echo.
echo ========================================
echo   部署成功！
echo ========================================
echo.
echo  本地访问: http://localhost:3001
echo.
:: 获取公网IP并显示
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do set IP=%%a
echo  请在阿里云控制台查看公网IP
echo  然后访问: http://公网IP:3001
echo.
echo  管理员账号: adm / 123456
echo  普通用户: 张三 / 123456
echo.
echo  提示: 关闭此窗口前服务会一直运行
echo        如需后台运行，请安装 PM2
echo.
pause
