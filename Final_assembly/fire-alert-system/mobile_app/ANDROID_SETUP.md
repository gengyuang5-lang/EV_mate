# Android项目初始化完成

## ✅ 已完成

1. ✅ Android原生代码目录已创建
2. ✅ 包名已更新为 `com.firealertapp`
3. ✅ 应用名称已更新为 `FireAlertApp`
4. ✅ 位置权限已添加到AndroidManifest.xml
5. ✅ 所有Java文件包名已更新

## 📱 运行Android应用

### 前提条件

1. **安装Android Studio**
   - 下载：https://developer.android.com/studio
   - 安装Android SDK

2. **配置环境变量**
   ```bash
   # 设置ANDROID_HOME环境变量
   # Windows:
   set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   
   # 添加到PATH:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

3. **启动Android模拟器或连接真机**
   - 在Android Studio中创建AVD（Android Virtual Device）
   - 或连接Android手机并启用USB调试

### 运行步骤

1. **启动后端服务**（必需）
```bash
cd fire-alert-system/backend
npm start
```

2. **启动Metro Bundler**
```bash
cd fire-alert-system/mobile_app
npm start
```

3. **运行Android应用**
```bash
# 在新终端窗口
cd fire-alert-system/mobile_app
npm run android
```

### 首次运行可能需要

```bash
# 清理构建缓存
cd android
./gradlew clean
cd ..

# 重新运行
npm run android
```

## 📝 配置说明

- **包名**: `com.firealertapp`
- **应用名称**: `FireAlertApp` (火灾预警系统)
- **主组件**: `FireAlertApp` (在index.js中注册)
- **最低SDK版本**: 23 (Android 6.0)
- **目标SDK版本**: 根据React Native版本自动设置

## ⚠️ 注意事项

1. **Google Maps API Key**（如果使用地图功能）
   - 在 `android/app/src/main/AndroidManifest.xml` 中添加：
   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="YOUR_API_KEY"/>
   ```

2. **网络权限**
   - 已自动添加INTERNET权限
   - 位置权限已添加（ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION）

3. **构建问题**
   - 如果遇到构建错误，可能需要运行 `cd android && ./gradlew clean`
   - 确保Android SDK和Build Tools版本正确

## 🔍 验证安装

```bash
# 检查Android环境
adb devices

# 检查React Native CLI
npx react-native --version
```

