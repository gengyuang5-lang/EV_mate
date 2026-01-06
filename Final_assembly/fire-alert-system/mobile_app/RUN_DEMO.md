# App 运行演示指南

## ✅ 当前状态

- ✅ 依赖已安装完成
- ✅ Metro Bundler 已启动（后台运行）

## 🚀 运行 App 的三种方式

### 方式 1：Android 模拟器/真机

**前提条件：**
- 安装 Android Studio
- 配置 Android SDK
- 启动 Android 模拟器或连接真机

**运行命令：**
```bash
cd fire-alert-system/mobile_app
npm run android
```

### 方式 2：iOS 模拟器（仅 macOS）

**前提条件：**
- 安装 Xcode
- 安装 CocoaPods
- 运行 `cd ios && pod install`

**运行命令：**
```bash
cd fire-alert-system/mobile_app
npm run ios
```

### 方式 3：Expo Go（推荐用于快速演示）

如果项目支持 Expo，可以使用 Expo Go 应用：

```bash
npx expo start
# 然后扫描二维码在手机上运行
```

## 📱 演示功能清单

### 1. 首页 - 实时火点地图

**预期效果：**
- 地图显示（默认位置：北京天安门附近）
- 火点标记显示（如果有数据）
- 顶部显示活跃预警数量

**测试步骤：**
1. 打开 App，进入首页
2. 查看地图是否正常显示
3. 检查是否有火点标记

### 2. 预警列表页面

**预期效果：**
- 显示预警列表
- 新预警自动弹窗
- 可以下拉刷新

**测试步骤：**
1. 点击底部导航栏的"预警"标签
2. 查看预警列表
3. 如果有新预警，会弹出模态窗口

### 3. 一键求助功能

**预期效果：**
- 自动获取 GPS 位置
- 显示位置信息
- 点击按钮发送求助

**测试步骤：**
1. 点击底部导航栏的"求助"标签
2. 允许位置权限
3. 查看位置信息是否显示
4. 点击"发送求助请求"按钮

### 4. 设置页面

**预期效果：**
- 语言切换（中英文）
- 其他设置选项

**测试步骤：**
1. 点击底部导航栏的"设置"标签
2. 尝试切换语言
3. 查看界面是否更新

## 🔧 启动后端服务（必需）

App 需要后端服务才能正常工作：

```bash
# 在另一个终端窗口
cd fire-alert-system/backend
npm start
```

后端服务将运行在：
- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:3000`

## 🧪 模拟数据测试

### 启动传感器模拟器

```bash
# 在另一个终端窗口
cd fire-alert-system/sensors
node sensorSimulator.js
```

这将模拟传感器数据，触发预警，App 会实时接收并显示。

## 📊 功能演示流程

### 完整演示流程：

1. **启动后端服务**
   ```bash
   cd fire-alert-system/backend
   npm start
   ```

2. **启动传感器模拟器**（可选）
   ```bash
   cd fire-alert-system/sensors
   node sensorSimulator.js
   ```

3. **启动 App**
   ```bash
   cd fire-alert-system/mobile_app
   npm run android  # 或 npm run ios
   ```

4. **观察效果**
   - 首页地图显示火点
   - 预警列表实时更新
   - 新预警自动弹窗
   - 可以发送求助请求

## 🎯 预期界面效果

### 首页地图
```
┌─────────────────────────────┐
│ 🔥 活跃预警: 3               │
├─────────────────────────────┤
│                             │
│      🗺️ 地图区域             │
│                             │
│    🔴 (火点标记)             │
│                             │
└─────────────────────────────┘
```

### 预警弹窗
```
        ┌───────────────────┐
        │ 🔥 收到预警    ✕   │
        ├───────────────────┤
        │ 📍 位置: 3楼会议室 │
        │ ℹ️ 状态: 严重      │
        │                   │
        │ [✅ 已解决]        │
        └───────────────────┘
```

## ⚠️ 常见问题

### 1. Metro Bundler 连接失败

**解决方案：**
- 确保 Metro Bundler 正在运行
- 检查端口 8081 是否被占用
- 尝试 `npm start -- --reset-cache`

### 2. 无法连接到后端

**解决方案：**
- 确保后端服务正在运行
- 检查 `src/utils/constants.js` 中的 API 地址
- 如果是 Android 模拟器，使用 `10.0.2.2` 代替 `localhost`

### 3. 地图不显示

**解决方案：**
- 检查是否配置了 Google Maps API Key（Android）
- 检查网络连接
- 查看控制台错误信息

### 4. 位置权限被拒绝

**解决方案：**
- 在设备设置中手动授予位置权限
- Android: 设置 > 应用 > 权限 > 位置
- iOS: 设置 > 隐私 > 位置服务

## 📝 当前运行状态

- ✅ Metro Bundler: 运行中（后台）
- ⏳ 后端服务: 需要手动启动
- ⏳ App: 等待在模拟器/真机上运行

## 🎬 下一步操作

1. **启动后端服务**（必需）
   ```bash
   cd fire-alert-system/backend
   npm start
   ```

2. **在 Android/iOS 设备上运行 App**
   ```bash
   npm run android  # 或 npm run ios
   ```

3. **观察实时效果**
   - 查看地图上的火点标记
   - 查看预警列表
   - 测试求助功能

---

**提示**: 如果无法运行原生应用，可以考虑使用 React Native Web 或创建一个 Web 版本的演示。

