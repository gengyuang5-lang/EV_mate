# 服务运行状态

## ✅ 服务已启动

### 1. 后端服务 (端口 3000)
- **状态**: ✅ 运行中
- **进程ID**: 21968
- **地址**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

**API 端点：**
- `GET /api/alerts` - 获取活跃预警
- `POST /api/alerts/resolve` - 解决预警
- `POST /api/help` - 发送求助请求
- WebSocket - 实时推送预警和火点数据

### 2. Metro Bundler (端口 8081)
- **状态**: ✅ 运行中
- **进程ID**: 40424
- **地址**: http://localhost:8081
- **功能**: React Native JavaScript 打包服务

## 📱 启动 App

### Android
```bash
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm run android
```

### iOS (仅 macOS)
```bash
npm run ios
```

## 🔍 测试服务

### 测试后端 API
```bash
# 获取活跃预警
curl http://localhost:3000/api/alerts

# 发送测试预警（如果有测试脚本）
```

### 测试 Metro Bundler
打开浏览器访问：http://localhost:8081/status

## 📊 服务监控

### 查看端口占用
```bash
netstat -ano | findstr ":3000 :8081"
```

### 停止服务
```powershell
# 停止后端服务
Stop-Process -Id 21968

# 停止 Metro Bundler
Stop-Process -Id 40424
```

## 🎯 下一步

1. **启动 App**（在模拟器或真机上）
   ```bash
   npm run android
   ```

2. **测试功能**
   - 查看首页地图
   - 查看预警列表
   - 测试一键求助
   - 测试设置页面

3. **模拟数据**（可选）
   ```bash
   cd ../sensors
   node sensorSimulator.js
   ```

## ⚠️ 注意事项

- 确保 Android Studio 已安装并配置
- 确保 Android 模拟器已启动或真机已连接
- 如果使用 Android 模拟器，App 中的 `localhost` 需要改为 `10.0.2.2`

---

**更新时间**: 2024-01-02  
**状态**: 服务运行正常 ✅
