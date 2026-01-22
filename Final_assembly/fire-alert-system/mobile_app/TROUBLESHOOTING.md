# 应用安装问题排查指南

## 常见问题及解决方案

### 1. Gradle Sync 失败

**症状**: Android Studio 显示 "Gradle Sync issues"

**解决方案**:
```bash
# 在 android 目录下执行
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

或者在 Android Studio 中:
- 点击 "Sync Project with Gradle Files"
- 如果仍然失败，点击 "Invalidate Caches / Restart"

### 2. 应用无法安装

**症状**: 安装时提示 "应用未安装" 或安装失败

**解决方案**:

#### 方法一：使用修复脚本（推荐）
```powershell
# Windows PowerShell
.\fix-installation.ps1
```

#### 方法二：手动步骤
```bash
# 1. 卸载旧版本
adb uninstall com.firealertapp

# 2. 清理构建
cd android
./gradlew clean

# 3. 重新构建
./gradlew assembleDebug

# 4. 安装
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 3. 应用安装后无法启动或闪退

**可能原因**:
1. Metro bundler 未运行
2. 网络连接问题
3. 代码错误

**解决方案**:
```bash
# 1. 确保 Metro bundler 正在运行
npm start

# 在另一个终端窗口执行步骤 2-4

# 2. 查看错误日志
adb logcat *:E

# 3. 重启应用
adb shell am force-stop com.firealertapp
adb shell am start -n com.firealertapp/.MainActivity

# 4. 如果仍然有问题，尝试清除应用数据
adb shell pm clear com.firealertapp
```

### 4. 版本冲突问题

**症状**: 提示 "versionCode" 冲突

**解决方案**:
1. 编辑 `android/app/build.gradle`
2. 增加 `versionCode` 值（例如从 1 改为 2）
3. 重新构建和安装

### 5. 签名问题

**症状**: 安装时提示签名错误

**解决方案**:
```bash
# 完全卸载旧版本（包括数据）
adb uninstall com.firealertapp

# 重新安装
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 6. 依赖问题

**症状**: 构建时提示找不到某些依赖

**解决方案**:
```bash
# 清理并重新下载依赖
cd android
./gradlew clean
./gradlew build --refresh-dependencies

# 或者删除 Gradle 缓存（谨慎使用）
rm -rf ~/.gradle/caches/
```

### 7. 设备/模拟器连接问题

**检查设备连接**:
```bash
adb devices
```

**如果没有设备**:
- Android 模拟器: 确保模拟器已启动
- 真机: 
  - 启用 USB 调试
  - 允许 USB 安装
  - 安装 USB 驱动

### 8. 快速诊断命令

```bash
# 检查设备
adb devices

# 查看应用是否已安装
adb shell pm list packages | grep firealert

# 查看应用信息
adb shell dumpsys package com.firealertapp

# 查看实时日志
adb logcat -s ReactNativeJS:V ReactNative:V *:S

# 查看错误日志
adb logcat *:E
```

## 完整重新安装流程

如果以上方法都不行，尝试完整重新安装:

```bash
# 1. 停止 Metro bundler (Ctrl+C)

# 2. 卸载应用
adb uninstall com.firealertapp

# 3. 清理所有构建产物
cd android
./gradlew clean
cd ..
rm -rf node_modules/.cache
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# 4. 重新安装依赖（如果需要）
npm install

# 5. 重新构建
cd android
./gradlew assembleDebug

# 6. 安装
adb install -r app/build/outputs/apk/debug/app-debug.apk

# 7. 启动 Metro bundler
cd ..
npm start

# 8. 在另一个终端启动应用
adb shell am start -n com.firealertapp/.MainActivity
```

## 联系支持

如果问题仍然存在，请提供以下信息:
1. 错误日志 (`adb logcat *:E`)
2. 构建日志 (`./gradlew assembleDebug` 的输出)
3. Android Studio 的 Gradle Sync 错误信息
4. 设备/模拟器信息 (`adb shell getprop ro.build.version.release`)

