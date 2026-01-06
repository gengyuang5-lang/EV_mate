# 🚀 服务启动状态

## ✅ 服务运行中

### 1. 后端服务 ✅
- **端口**: 3000
- **状态**: 运行中
- **进程ID**: 21968
- **API地址**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

**测试结果**: 
```bash
curl http://localhost:3000/api/alerts/active
# 返回: {"success":true,"data":[]}
```

### 2. Metro Bundler ✅
- **端口**: 8081
- **状态**: 运行中
- **进程ID**: 40424
- **地址**: http://localhost:8081

## 📱 查看演示

### 方式 1: Web 演示页面（推荐）

已创建 Web 演示页面，可以直接在浏览器中查看效果：

**文件位置**: `fire-alert-system/mobile_app/demo-web.html`

**打开方式**:
1. 双击 `demo-web.html` 文件
2. 或在浏览器中打开: `file:///E:/desktop/EV_mate/Final_assembly/fire-alert-system/mobile_app/demo-web.html`

**功能演示**:
- ✅ 实时显示服务状态（后端、Metro）
- ✅ 显示活跃预警数量
- ✅ 首页地图显示火点标记
- ✅ 预警列表页面
- ✅ 一键求助功能
- ✅ WebSocket 实时推送

### 方式 2: 使用 React Native（需要 Android/iOS 环境）

如果需要运行原生 App，需要先初始化项目：

```bash
cd fire-alert-system/mobile_app

# 初始化 Android 项目（如果还没有）
npx react-native init FireAlertApp --template react-native-template-typescript
# 然后复制 src 目录到新项目

# 或使用 Expo（更简单）
npx create-expo-app FireAlertApp
```

## 🧪 测试后端 API

### 获取活跃预警
```bash
curl http://localhost:3000/api/alerts/active
```

### 发送测试预警（通过传感器模拟器）
```bash
cd fire-alert-system/sensors
node sensorSimulator.js
```

### 测试 WebSocket 连接
在浏览器控制台中：
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 📊 服务监控

### 查看端口占用
```bash
netstat -ano | findstr ":3000 :8081"
```

### 查看服务日志
后端服务输出在启动它的终端窗口中。

### 停止服务
```powershell
# 停止后端服务
Stop-Process -Id 21968

# 停止 Metro Bundler
Stop-Process -Id 40424
```

## 🎯 下一步操作

1. **打开 Web 演示页面**
   - 双击 `demo-web.html`
   - 查看实时效果

2. **测试功能**
   - 启动传感器模拟器生成测试数据
   - 观察 Web 页面实时更新
   - 测试一键求助功能

3. **查看完整功能**
   - 首页地图显示火点
   - 预警列表实时更新
   - WebSocket 实时推送

## 📝 注意事项

- Web 演示页面会自动连接后端服务
- 如果后端服务未运行，页面会显示离线状态
- WebSocket 连接失败时会自动重连
- 需要允许浏览器通知权限以接收预警通知

---

**更新时间**: 2024-01-02  
**状态**: 所有服务运行正常 ✅

