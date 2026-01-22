# 修复 react-native-maps 编译错误

## 问题
`react-native-maps@1.8.0` 与 React Native 0.72.6 不兼容，导致 `ViewManagerWithGeneratedInterface` 找不到。

## 解决方案
已降级 `react-native-maps` 到 `1.7.1` 版本，该版本与 React Native 0.72.6 兼容。

## 下一步操作

1. **重新安装依赖**：
```bash
cd Final_assembly/fire-alert-system/mobile_app
npm install
```

2. **清理并重新构建**：
在 Android Studio 中：
- Build → Clean Project
- Build → Rebuild Project

或者使用命令行：
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

3. **重新同步项目**：
- File → Sync Project with Gradle Files

## 版本兼容性参考

| React Native | react-native-maps |
|--------------|-------------------|
| 0.72.x       | 1.7.1             |
| 0.73.x       | 1.8.0+            |

当前项目使用 React Native 0.72.6，所以应该使用 `react-native-maps@1.7.1`。
