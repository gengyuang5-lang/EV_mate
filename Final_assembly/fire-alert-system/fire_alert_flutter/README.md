# 火灾预警系统 - Flutter版本

这是从React Native迁移到Flutter的移动应用版本。

## 功能特性

- ✅ 实时火点地图显示
- ✅ 预警列表和弹窗
- ✅ 逃生路线规划
- ✅ 一键求助
- ✅ 多语言支持

## 项目结构

```
lib/
├── main.dart                    # 应用入口
├── screens/                     # 页面
│   ├── home_screen.dart
│   ├── alert_screen.dart
│   ├── escape_route_screen.dart
│   ├── help_screen.dart
│   └── settings_screen.dart
├── services/                    # 服务
│   ├── api_service.dart
│   ├── websocket_service.dart
│   ├── path_planning_service.dart
│   └── location_service.dart
├── widgets/                     # 组件
│   ├── fire_point_marker.dart
│   └── alert_popup.dart
└── utils/                       # 工具
    └── constants.dart
```

## 安装和运行

### 1. 安装Flutter SDK

访问 https://flutter.dev/docs/get-started/install/windows

### 2. 检查环境

```bash
flutter doctor
```

### 3. 安装依赖

```bash
cd fire_alert_flutter
flutter pub get
```

### 4. 运行应用

```bash
# 查看可用设备
flutter devices

# 运行到Android
flutter run

# 运行到特定设备
flutter run -d emulator-5554
```

## 配置

### Android权限配置

在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### API配置

在 `lib/utils/constants.dart` 中修改API地址：

```dart
static const String apiUrl = 'http://your-backend-url:3000';
static const String wsUrl = 'ws://your-backend-url:3000';
```

## 迁移说明

从React Native迁移的主要变化：

1. **语言**: JavaScript → Dart
2. **状态管理**: React Hooks → Flutter StatefulWidget
3. **导航**: React Navigation → Flutter Navigator
4. **地图**: react-native-maps → flutter_map
5. **网络**: axios → http package
6. **WebSocket**: 原生WebSocket → web_socket_channel

## 开发

### 热重载

在运行应用时：
- 按 `r` 键进行热重载
- 按 `R` 键进行热重启

### 调试

- 使用 `flutter run` 运行调试版本
- 使用Android Studio或VS Code的Flutter扩展进行调试

## 依赖说明

主要依赖包：
- `flutter_map`: 地图显示
- `web_socket_channel`: WebSocket通信
- `http`: HTTP请求
- `geolocator`: 位置服务
- `permission_handler`: 权限管理

查看 `pubspec.yaml` 了解完整依赖列表。

