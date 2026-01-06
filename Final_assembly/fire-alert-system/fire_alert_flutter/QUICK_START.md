# Flutter项目快速开始

## ✅ 已完成

- [x] 所有代码已从React Native迁移到Flutter
- [x] 依赖包已安装（77个包）
- [x] 代码错误已修复
- [x] 项目结构完整

## 🚀 运行应用

### 方法1：使用Flutter CLI

```bash
cd fire-alert-system/fire_alert_flutter

# 查看可用设备
flutter devices

# 运行应用
flutter run
```

### 方法2：在Cursor中运行

1. 安装Flutter扩展（如果还没有）
   - 扩展ID: `Dart-Code.flutter`
   - 扩展ID: `Dart-Code.dart-code`

2. 按 `F5` 启动调试
   - 或点击左侧调试图标
   - 选择 "Flutter" 配置

3. 热重载
   - 按 `r` 键进行热重载
   - 按 `R` 键进行热重启

## 📱 功能列表

- ✅ 实时火点地图显示
- ✅ WebSocket实时通信
- ✅ 预警列表和弹窗
- ✅ 逃生路线规划
- ✅ 位置服务
- ✅ 一键求助
- ✅ 多语言支持

## 🔧 配置

### API地址

在 `lib/utils/constants.dart` 中修改：

```dart
static const String apiUrl = 'http://your-backend-url:3000';
static const String wsUrl = 'ws://your-backend-url:3000';
```

### Android权限

在 `android/app/src/main/AndroidManifest.xml` 中已配置：
- INTERNET
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION

## 📦 已安装的依赖

- `flutter_map` - 地图显示
- `web_socket_channel` - WebSocket通信
- `http` - HTTP请求
- `geolocator` - 位置服务
- `permission_handler` - 权限管理
- `provider` - 状态管理
- `shared_preferences` - 本地存储

## 🐛 故障排除

### 如果遇到网络问题

使用国内镜像源：
```bash
$env:PUB_HOSTED_URL="https://pub.flutter-io.cn"
$env:FLUTTER_STORAGE_BASE_URL="https://storage.flutter-io.cn"
flutter pub get
```

### 如果遇到Android构建问题

```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

## 📝 开发提示

1. **热重载**: 保存文件时自动重载，或按 `r` 键
2. **调试**: 使用 `print()` 或 Flutter DevTools
3. **代码格式化**: `flutter format .`
4. **代码分析**: `flutter analyze`

---

**项目已准备就绪，可以开始开发！** 🎉

