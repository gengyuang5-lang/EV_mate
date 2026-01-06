# 🌐 访问网址

## 📱 App 演示页面

### Web 演示页面
**网址**: http://localhost:8080/demo-web.html

**功能**:
- ✅ 实时显示服务状态
- ✅ 首页地图显示火点标记
- ✅ 预警列表实时更新
- ✅ 一键求助功能
- ✅ WebSocket 实时推送

### 直接访问
在浏览器中打开：
```
http://localhost:8080/demo-web.html
```

## 🔧 后端服务 API

### RESTful API
**基础地址**: http://localhost:3000

**主要端点**:
- `GET http://localhost:3000/api/alerts/active` - 获取活跃预警
- `GET http://localhost:3000/api/alerts/history` - 获取预警历史
- `GET http://localhost:3000/api/alerts/statistics` - 获取预警统计
- `POST http://localhost:3000/api/alerts/resolve` - 解决预警
- `POST http://localhost:3000/api/help/request` - 发送求助请求

### WebSocket
**地址**: ws://localhost:3000

**事件**:
- `alert` - 新预警
- `fire_point` - 新火点
- `alert_resolved` - 预警已解决

## 📊 Metro Bundler

**地址**: http://localhost:8081

**用途**: React Native JavaScript 打包服务

## 🚀 快速访问

### 方式 1: 浏览器直接访问
```
http://localhost:8080/demo-web.html
```

### 方式 2: 命令行打开
```powershell
Start-Process "http://localhost:8080/demo-web.html"
```

### 方式 3: 在代码中测试
```javascript
// 获取活跃预警
fetch('http://localhost:3000/api/alerts/active')
  .then(res => res.json())
  .then(data => console.log(data));

// WebSocket 连接
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 📝 服务端口总结

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| Web 演示 | 8080 | HTTP | App 演示页面 |
| 后端服务 | 3000 | HTTP/WebSocket | API 和实时通信 |
| Metro Bundler | 8081 | HTTP | React Native 打包 |

## ⚠️ 注意事项

1. **本地访问**: 所有服务都在本地运行，只能通过 `localhost` 访问
2. **防火墙**: 如果无法访问，检查防火墙设置
3. **端口占用**: 如果端口被占用，可以修改配置使用其他端口

---

**更新时间**: 2024-01-02

