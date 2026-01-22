# 火灾预警系统 - 应用安装问题修复脚本
# 此脚本用于排查和修复 Android 应用安装问题

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  火灾预警系统 - 安装问题修复工具" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 ADB 连接
Write-Host "[1/6] 检查 ADB 连接..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✓ 检测到已连接的设备/模拟器" -ForegroundColor Green
    $deviceId = (adb devices | Select-String "device$" | Select-Object -First 1).ToString().Split("`t")[0]
    Write-Host "  设备ID: $deviceId" -ForegroundColor Gray
} else {
    Write-Host "✗ 未检测到已连接的设备或模拟器" -ForegroundColor Red
    Write-Host "  请确保:" -ForegroundColor Yellow
    Write-Host "  1. 模拟器已启动" -ForegroundColor Yellow
    Write-Host "  2. USB 调试已开启（如果是真机）" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "按 Enter 键继续..."
    exit 1
}

Write-Host ""

# 2. 卸载旧版本应用
Write-Host "[2/6] 卸载旧版本应用..." -ForegroundColor Yellow
$packageName = "com.firealertapp"
$uninstallResult = adb uninstall $packageName 2>&1
if ($uninstallResult -match "Success") {
    Write-Host "✓ 成功卸载旧版本应用" -ForegroundColor Green
} elseif ($uninstallResult -match "not found" -or $uninstallResult -match "does not exist") {
    Write-Host "○ 未检测到已安装的旧版本" -ForegroundColor Gray
} else {
    Write-Host "! 卸载过程出现警告: $uninstallResult" -ForegroundColor Yellow
}

Write-Host ""

# 3. 清理构建缓存
Write-Host "[3/6] 清理构建缓存..." -ForegroundColor Yellow
Set-Location android
if (Test-Path "build") {
    Remove-Item -Recurse -Force build
    Write-Host "✓ 已清理 build 目录" -ForegroundColor Green
}
if (Test-Path "app\build") {
    Remove-Item -Recurse -Force app\build
    Write-Host "✓ 已清理 app\build 目录" -ForegroundColor Green
}
Set-Location ..
Write-Host "✓ 构建缓存清理完成" -ForegroundColor Green
Write-Host ""

# 4. 清理 Gradle 缓存（可选）
Write-Host "[4/6] 清理 Gradle 缓存（可选）..." -ForegroundColor Yellow
$cleanGradle = Read-Host "是否清理 Gradle 缓存？这可能需要重新下载依赖 (y/n)"
if ($cleanGradle -eq "y" -or $cleanGradle -eq "Y") {
    Set-Location android
    .\gradlew clean --no-daemon
    Set-Location ..
    Write-Host "✓ Gradle 清理完成" -ForegroundColor Green
} else {
    Write-Host "○ 跳过 Gradle 缓存清理" -ForegroundColor Gray
}
Write-Host ""

# 5. 重新构建应用
Write-Host "[5/6] 重新构建应用..." -ForegroundColor Yellow
Write-Host "  这可能需要几分钟时间，请稍候..." -ForegroundColor Gray
Set-Location android
$buildResult = .\gradlew assembleDebug --no-daemon 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 应用构建成功" -ForegroundColor Green
} else {
    Write-Host "✗ 应用构建失败" -ForegroundColor Red
    Write-Host "错误信息:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Set-Location ..
    Read-Host "按 Enter 键退出..."
    exit 1
}
Set-Location ..
Write-Host ""

# 6. 安装应用
Write-Host "[6/6] 安装应用到设备..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $installResult = adb install -r $apkPath 2>&1
    if ($installResult -match "Success" -or $LASTEXITCODE -eq 0) {
        Write-Host "✓ 应用安装成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "===========================================" -ForegroundColor Cyan
        Write-Host "  安装完成！" -ForegroundColor Green
        Write-Host "===========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "现在可以在设备上启动应用了。" -ForegroundColor Yellow
        Write-Host "如果应用无法启动，请检查:" -ForegroundColor Yellow
        Write-Host "  1. Metro bundler 是否正在运行 (npm start)" -ForegroundColor Yellow
        Write-Host "  2. 设备/模拟器的网络连接是否正常" -ForegroundColor Yellow
        Write-Host "  3. 查看 logcat 日志: adb logcat *:E" -ForegroundColor Yellow
    } else {
        Write-Host "✗ 应用安装失败" -ForegroundColor Red
        Write-Host "错误信息:" -ForegroundColor Red
        Write-Host $installResult -ForegroundColor Red
        Write-Host ""
        Write-Host "常见解决方案:" -ForegroundColor Yellow
        Write-Host "  1. 检查设备存储空间是否充足" -ForegroundColor Yellow
        Write-Host "  2. 在设备上手动允许安装未知来源的应用" -ForegroundColor Yellow
        Write-Host "  3. 尝试先完全卸载: adb uninstall com.firealertapp" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 找不到 APK 文件: $apkPath" -ForegroundColor Red
    Write-Host "请检查构建过程是否成功完成" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按 Enter 键退出..."

