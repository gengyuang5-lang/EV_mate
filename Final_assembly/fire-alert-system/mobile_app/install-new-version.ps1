# 安装新版本火灾预警系统应用
# 包名: com.firealertapp.v2
# 应用名称: 火灾预警系统 (新版本)

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  安装新版本应用" -ForegroundColor Cyan
Write-Host "  包名: com.firealertapp.v2" -ForegroundColor Cyan
Write-Host "  应用名称: 火灾预警系统 (新版本)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 ADB 连接
Write-Host "[1/5] 检查 ADB 连接..." -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") {
    Write-Host "✓ 检测到已连接的设备/模拟器" -ForegroundColor Green
    $deviceId = (adb devices | Select-String "device$" | Select-Object -First 1).ToString().Split("`t")[0]
    Write-Host "  设备ID: $deviceId" -ForegroundColor Gray
} else {
    Write-Host "✗ 未检测到已连接的设备或模拟器" -ForegroundColor Red
    Write-Host "  请确保模拟器已启动或真机已连接" -ForegroundColor Yellow
    Read-Host "按 Enter 键退出..."
    exit 1
}

Write-Host ""

# 2. 检查是否已安装旧版本
Write-Host "[2/5] 检查已安装的应用..." -ForegroundColor Yellow
$oldApp = adb shell pm list packages | Select-String "com.firealertapp$" | ForEach-Object { $_.ToString().Split(":")[1] }
$newApp = adb shell pm list packages | Select-String "com.firealertapp.v2" | ForEach-Object { $_.ToString().Split(":")[1] }

if ($oldApp) {
    Write-Host "○ 检测到旧版本应用 (com.firealertapp)" -ForegroundColor Gray
    Write-Host "  旧版本将保留，可以同时运行" -ForegroundColor Gray
} else {
    Write-Host "○ 未检测到旧版本应用" -ForegroundColor Gray
}

if ($newApp) {
    Write-Host "○ 检测到新版本应用已安装 (com.firealertapp.v2)" -ForegroundColor Gray
    Write-Host "  将重新安装以更新..." -ForegroundColor Gray
    adb uninstall com.firealertapp.v2 | Out-Null
}

Write-Host ""

# 3. 清理构建缓存
Write-Host "[3/5] 清理构建缓存..." -ForegroundColor Yellow
Set-Location android
if (Test-Path "app\build") {
    Remove-Item -Recurse -Force app\build
    Write-Host "✓ 已清理 app\build 目录" -ForegroundColor Green
}
Set-Location ..
Write-Host "✓ 构建缓存清理完成" -ForegroundColor Green
Write-Host ""

# 4. 构建应用
Write-Host "[4/5] 构建新版本应用..." -ForegroundColor Yellow
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

# 5. 安装应用
Write-Host "[5/5] 安装新版本应用到设备..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host "  安装包路径: $apkPath" -ForegroundColor Gray
    $installResult = adb install -r $apkPath 2>&1
    if ($installResult -match "Success" -or $LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host "  ✓ 新版本应用安装成功！" -ForegroundColor Green
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "应用信息:" -ForegroundColor Yellow
        Write-Host "  包名: com.firealertapp.v2" -ForegroundColor Gray
        Write-Host "  应用名称: 火灾预警系统 (新版本)" -ForegroundColor Gray
        Write-Host "  版本号: 2.0" -ForegroundColor Gray
        Write-Host ""
        if ($oldApp) {
            Write-Host "提示: 旧版本应用 (火灾预警系统) 仍然保留在设备上，" -ForegroundColor Cyan
            Write-Host "     现在可以在设备上同时看到两个应用图标。" -ForegroundColor Cyan
            Write-Host "     旧版本: 火灾预警系统 (com.firealertapp)" -ForegroundColor Gray
            Write-Host "     新版本: 火灾预警系统 (新版本) (com.firealertapp.v2)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "下一步:" -ForegroundColor Yellow
        Write-Host "  1. 在设备上找到应用图标 '火灾预警系统 (新版本)'" -ForegroundColor Gray
        Write-Host "  2. 确保 Metro bundler 正在运行 (npm start)" -ForegroundColor Gray
        Write-Host "  3. 启动新版本应用进行测试" -ForegroundColor Gray
    } else {
        Write-Host "✗ 应用安装失败" -ForegroundColor Red
        Write-Host "错误信息:" -ForegroundColor Red
        Write-Host $installResult -ForegroundColor Red
        Write-Host ""
        Write-Host "常见解决方案:" -ForegroundColor Yellow
        Write-Host "  1. 检查设备存储空间是否充足" -ForegroundColor Yellow
        Write-Host "  2. 在设备上手动允许安装未知来源的应用" -ForegroundColor Yellow
        Write-Host "  3. 尝试先卸载: adb uninstall com.firealertapp.v2" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 找不到 APK 文件: $apkPath" -ForegroundColor Red
    Write-Host "请检查构建过程是否成功完成" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按 Enter 键退出..."

