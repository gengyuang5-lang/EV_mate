# 使用Flutter开发Android应用指南

## Flutter vs React Native 对比

### Flutter优势
✅ **性能更好** - 编译为原生代码，性能接近原生应用
✅ **UI一致性** - 自绘UI，在不同平台上外观完全一致
✅ **热重载更快** - 开发体验流畅
✅ **丰富的组件库** - Material Design和Cupertino组件
✅ **Dart语言** - 现代化的语言，类型安全

### React Native优势
✅ **JavaScript生态** - 可以复用大量JS库
✅ **学习曲线平缓** - 如果熟悉React
✅ **社区成熟** - 更多第三方库和解决方案
✅ **代码共享** - 可以与Web代码共享逻辑

## 在Cursor中配置Flutter开发

### 1. 安装Flutter SDK

1. **下载Flutter SDK**
   - 访问：https://flutter.dev/docs/get-started/install/windows
   - 下载Flutter SDK zip文件
   - 解压到：`C:\src\flutter`（或其他位置）

2. **配置环境变量**
   - 添加到PATH：`C:\src\flutter\bin`
   - 验证安装：`flutter doctor`

### 2. 安装Android Studio（必需）
- Flutter需要Android Studio来管理Android SDK
- 已安装的话可以跳过

### 3. 安装Cursor扩展

#### 必需扩展：
- **Flutter** (`Dart-Code.flutter`)
  - Flutter开发支持
  - Dart语言支持
  - 热重载、调试等功能

- **Dart** (`Dart-Code.dart-code`)
  - Dart语言智能提示
  - 代码格式化

#### 推荐扩展：
- **Error Lens** (`usernamehw.errorlens`)
  - 实时显示错误和警告

- **Flutter Widget Snippets** (`alexisvt.flutter-snippets`)
  - Flutter组件代码片段

## 创建Flutter项目

### 方法1：使用Flutter CLI

```bash
# 在项目目录中
cd fire-alert-system
flutter create fire_alert_app
cd fire_alert_app
```

### 方法2：使用Cursor命令

1. 按 `Ctrl + Shift + P`
2. 输入 "Flutter: New Project"
3. 选择项目类型
4. 输入项目名称

## 项目结构

```
fire_alert_app/
├── lib/
│   ├── main.dart                 # 应用入口
│   ├── screens/                  # 页面
│   │   ├── home_screen.dart
│   │   ├── alert_screen.dart
│   │   ├── escape_route_screen.dart
│   │   ├── help_screen.dart
│   │   └── settings_screen.dart
│   ├── widgets/                  # 组件
│   │   ├── fire_point_marker.dart
│   │   └── alert_popup.dart
│   ├── services/                 # 服务
│   │   ├── api_service.dart
│   │   ├── websocket_service.dart
│   │   └── path_planning_service.dart
│   └── utils/                    # 工具
│       ├── constants.dart
│       └── i18n.dart
├── android/                      # Android原生代码
├── ios/                          # iOS原生代码
├── pubspec.yaml                  # 依赖配置
└── README.md
```

## 依赖配置 (pubspec.yaml)

```yaml
name: fire_alert_app
description: 火灾预警系统移动端应用
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # UI组件
  cupertino_icons: ^1.0.2
  flutter_map: ^6.1.0          # 地图
  web_socket_channel: ^2.4.0   # WebSocket
  http: ^1.1.0                  # HTTP请求
  geolocator: ^10.1.0           # 位置服务
  permission_handler: ^11.0.0   # 权限管理
  
  # 状态管理
  provider: ^6.0.5
  
  # 国际化
  intl: ^0.18.1
  flutter_localizations:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
```

## 运行和调试

### 1. 检查环境

```bash
flutter doctor
```

### 2. 运行应用

```bash
# 查看可用设备
flutter devices

# 运行到Android
flutter run

# 运行到特定设备
flutter run -d emulator-5554
```

### 3. 在Cursor中调试

1. **启动调试**
   - 按 `F5`
   - 或点击左侧调试图标
   - 选择 "Flutter" 配置

2. **热重载**
   - 按 `Ctrl + \` 或 `r` 键
   - 保存文件时自动热重载

3. **热重启**
   - 按 `R` 键
   - 完全重启应用

## 代码示例

### main.dart (入口文件)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const FireAlertApp());
}

class FireAlertApp extends StatelessWidget {
  const FireAlertApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '火灾预警系统',
      theme: ThemeData(
        primarySwatch: Colors.red,
        useMaterial3: true,
      ),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('zh', 'CN'),
        Locale('en', 'US'),
      ],
      home: const HomeScreen(),
    );
  }
}
```

### 地图显示示例 (home_screen.dart)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final MapController _mapController = MapController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('火灾预警系统'),
      ),
      body: FlutterMap(
        mapController: _mapController,
        options: MapOptions(
          initialCenter: LatLng(39.9042, 116.4074), // 北京
          initialZoom: 13.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.example.fire_alert_app',
          ),
          MarkerLayer(
            markers: [
              // 火点标记
              Marker(
                point: LatLng(39.9042, 116.4074),
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.local_fire_department,
                  color: Colors.red,
                  size: 40,
                ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // 导航到逃生路线页面
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const EscapeRouteScreen(),
            ),
          );
        },
        child: const Icon(Icons.directions_run),
      ),
    );
  }
}
```

## Cursor配置

### .vscode/settings.json

```json
{
  "dart.flutterSdkPath": "C:\\src\\flutter",
  "dart.debugExternalPackageLibraries": false,
  "dart.debugSdkLibraries": false,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "Dart-Code.dart-code",
  "[dart]": {
    "editor.formatOnSave": true,
    "editor.selectionHighlight": false,
    "editor.suggest.snippetsPreventQuickSuggestions": false,
    "editor.suggestSelection": "first",
    "editor.tabCompletion": "onlySnippets",
    "editor.wordBasedSuggestions": "off"
  }
}
```

### .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter",
      "request": "launch",
      "type": "dart"
    },
    {
      "name": "Flutter (Profile Mode)",
      "request": "launch",
      "type": "dart",
      "flutterMode": "profile"
    },
    {
      "name": "Flutter (Release Mode)",
      "request": "launch",
      "type": "dart",
      "flutterMode": "release"
    }
  ]
}
```

## 迁移建议

如果要从React Native迁移到Flutter：

### 1. 创建新项目
```bash
flutter create fire_alert_app
```

### 2. 迁移代码结构
- React组件 → Flutter Widgets
- JavaScript服务 → Dart类
- React Navigation → Flutter Navigator
- React Native Maps → flutter_map 或 google_maps_flutter

### 3. 复用逻辑
- API调用逻辑可以复用
- 数据结构可以复用
- 业务逻辑可以复用（需要重写为Dart）

## 优势总结

✅ **性能优异** - 编译为原生代码
✅ **开发体验好** - 热重载快速
✅ **UI精美** - Material Design内置
✅ **跨平台** - Android、iOS、Web、Desktop
✅ **类型安全** - Dart语言

## 下一步

1. 安装Flutter SDK
2. 安装Cursor扩展（Flutter、Dart）
3. 运行 `flutter doctor` 检查环境
4. 创建新项目或迁移现有项目
5. 开始开发！

---

**总结**：Flutter是开发Android/iOS应用的优秀选择，性能好、开发体验佳，完全可以在Cursor中开发！

