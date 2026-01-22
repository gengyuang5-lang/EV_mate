# 新版本应用配置说明

## 版本信息

### 新版本应用
- **包名**: `com.firealertapp.v2`
- **应用名称**: `火灾预警系统 (新版本)`
- **版本号**: `2.0`
- **版本代码**: `2`

### 旧版本应用（保留）
- **包名**: `com.firealertapp`
- **应用名称**: `火灾预警系统`
- **版本号**: `1.0`
- **版本代码**: `1`

## 已完成的修改

### 1. 构建配置 (`android/app/build.gradle`)
- ✅ 修改 `namespace`: `com.firealertapp` → `com.firealertapp.v2`
- ✅ 修改 `applicationId`: `com.firealertapp` → `com.firealertapp.v2`
- ✅ 更新 `versionCode`: `1` → `2`
- ✅ 更新 `versionName`: `"1.0"` → `"2.0"`

### 2. 应用名称 (`android/app/src/main/res/values/strings.xml`)
- ✅ 修改 `app_name`: `火灾预警系统` → `火灾预警系统 (新版本)`

### 3. Java 源代码
- ✅ 更新 `MainActivity.java` 包声明: `package com.firealertapp.v2;`
- ✅ 更新 `MainApplication.java` 包声明: `package com.firealertapp.v2;`
- ✅ 更新 `ReactNativeFlipper.java` (debug) 包声明: `package com.firealertapp.v2;`
- ✅ 更新 `ReactNativeFlipper.java` (release) 包声明: `package com.firealertapp.v2;`
- ✅ 移动所有 Java 文件到新包目录结构: `com/firealertapp/v2/`

## 安装新版本应用

### 方法一：使用自动安装脚本（推荐）

```powershell
cd Final_assembly/fire-alert-system/mobile_app
.\install-new-version.ps1
```

脚本会自动：
1. 检查设备连接
2. 检查已安装的应用
3. 清理构建缓存
4. 构建新版本应用
5. 安装到设备

### 方法二：手动安装

```bash
# 1. 清理并构建
cd android
./gradlew clean
./gradlew assembleDebug

# 2. 安装（不会卸载旧版本）
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 验证安装

安装成功后，在设备/模拟器上应该能看到：

1. **旧版本应用图标**: `火灾预警系统` (包名: com.firealertapp)
2. **新版本应用图标**: `火灾预警系统 (新版本)` (包名: com.firealertapp.v2)

两个应用可以同时安装和运行，互不干扰。

## 检查已安装的应用

```bash
# 查看所有已安装的应用
adb shell pm list packages | grep firealert

# 应该看到:
# package:com.firealertapp
# package:com.firealertapp.v2
```

## 启动应用

### 启动新版本应用
```bash
adb shell am start -n com.firealertapp.v2/.MainActivity
```

### 启动旧版本应用
```bash
adb shell am start -n com.firealertapp/.MainActivity
```

## 注意事项

1. **Metro Bundler**: 确保在运行应用前启动了 Metro bundler (`npm start`)
2. **网络连接**: 确保设备/模拟器能够连接到开发服务器
3. **数据隔离**: 两个版本的应用数据是隔离的，互不影响
4. **同时运行**: 两个版本可以同时安装和运行

## 卸载

### 卸载新版本
```bash
adb uninstall com.firealertapp.v2
```

### 卸载旧版本
```bash
adb uninstall com.firealertapp
```

## 回滚到旧配置

如果需要回滚到原来的配置，可以：
1. 将 `build.gradle` 中的配置改回 `com.firealertapp`
2. 将 `strings.xml` 中的名称改回 `火灾预警系统`
3. 将 Java 文件的包声明改回 `package com.firealertapp;`
4. 将 Java 文件移回原来的目录位置

或者使用 Git 回滚相关更改。

