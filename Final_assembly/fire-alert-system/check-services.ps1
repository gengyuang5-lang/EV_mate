# 服务状态检查脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  火灾预警系统 - 服务状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查端口 3000 (后端服务)
Write-Host "检查后端服务 (端口 3000)..." -ForegroundColor Yellow
$backend = netstat -ano | findstr ":3000.*LISTENING"
if ($backend) {
    Write-Host "  ✅ 后端服务运行中" -ForegroundColor Green
    $backend | ForEach-Object {
        Write-Host "     $_" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ 后端服务未运行" -ForegroundColor Red
    Write-Host "     请运行: cd backend && npm start" -ForegroundColor Yellow
}
Write-Host ""

# 检查端口 8081 (Metro Bundler)
Write-Host "检查 Metro Bundler (端口 8081)..." -ForegroundColor Yellow
$metro = netstat -ano | findstr ":8081.*LISTENING"
if ($metro) {
    Write-Host "  ✅ Metro Bundler 运行中" -ForegroundColor Green
    $metro | ForEach-Object {
        Write-Host "     $_" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ Metro Bundler 未运行" -ForegroundColor Red
    Write-Host "     请运行: cd mobile_app && npm start" -ForegroundColor Yellow
}
Write-Host ""

# 测试后端 API
Write-Host "测试后端 API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/alerts" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ API 响应正常" -ForegroundColor Green
    Write-Host "     状态码: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️  API 测试失败 (可能正常，取决于API路径)" -ForegroundColor Yellow
    Write-Host "     错误: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# 检查 Android 设备
Write-Host "检查 Android 设备..." -ForegroundColor Yellow
$adb = Get-Command adb -ErrorAction SilentlyContinue
if ($adb) {
    $devices = adb devices 2>&1 | Select-String "device$"
    if ($devices) {
        Write-Host "  ✅ 检测到 Android 设备" -ForegroundColor Green
        $devices | ForEach-Object {
            Write-Host "     $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  未检测到 Android 设备" -ForegroundColor Yellow
        Write-Host "     请启动模拟器或连接真机" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  ADB 未找到" -ForegroundColor Yellow
    Write-Host "     请安装 Android SDK Platform Tools" -ForegroundColor Gray
}
Write-Host ""

# 总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务状态总结:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allRunning = $backend -and $metro
if ($allRunning) {
    Write-Host "✅ 核心服务运行正常" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步:" -ForegroundColor Yellow
    Write-Host "  1. 确保 Android 模拟器/真机已连接" -ForegroundColor White
    Write-Host "  2. 运行: cd mobile_app && npm run android" -ForegroundColor White
    Write-Host "  3. 等待 App 在设备上启动" -ForegroundColor White
} else {
    Write-Host "❌ 部分服务未运行" -ForegroundColor Red
    Write-Host ""
    Write-Host "请启动以下服务:" -ForegroundColor Yellow
    if (-not $backend) {
        Write-Host "  - 后端服务: cd backend && npm start" -ForegroundColor White
    }
    if (-not $metro) {
        Write-Host "  - Metro Bundler: cd mobile_app && npm start" -ForegroundColor White
    }
}

Write-Host ""

