# 移动端App快速开始指南

## 环境要求

- Node.js >= 18
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)

## 安装步骤

### 1. 安装依赖

```bash
cd mobile_app
npm install
```

### 2. iOS开发环境设置

```bash
cd ios
pod install
cd ..
```

### 3. 配置API地址

编辑 `src/utils/constants.js`，修改API地址：

```javascript
export const API_URL = 'http://your-backend-url:3000';
export const WS_URL = 'ws://your-backend-url:3000';
```

## 运行应用

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## 功能说明

### 1. 实时火点显示
- 首页地图显示所有活跃火点
- 红点标记表示不同级别的预警
- 点击标记查看详细信息

### 2. 预警推送
- 实时接收预警信息
- 自动弹出预警弹窗
- 语音播报预警内容

### 3. 一键求助
- 获取GPS位置
- 发送求助请求
- 显示求助状态

### 4. 多语言支持
- 支持中文和英文
- 在设置页面切换语言
- 所有界面文本支持国际化

## 开发注意事项

1. **位置权限**: 应用需要位置权限才能使用求助功能
2. **网络连接**: 确保设备可以访问后端服务器
3. **WebSocket**: 需要保持WebSocket连接以接收实时预警

## 后续功能开发

### 火场逃生路径规划
- 需要集成路径规划算法
- 需要建筑物平面图数据
- 需要实时导航功能

