# 快速启动指南

## 安装步骤

### 1. 安装所有依赖

在项目根目录运行：

```bash
npm run install-all
```

或者分别安装：

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install

# 传感器模拟器依赖
cd ../sensors
npm install
```

## 启动系统

### 方式一：分别启动（推荐用于开发）

打开三个终端窗口：

**终端1 - 启动后端服务：**
```bash
cd fire-alert-system/backend
npm start
```

**终端2 - 启动传感器模拟器：**
```bash
cd fire-alert-system/sensors
npm start
```

**终端3 - 启动前端App：**
```bash
cd fire-alert-system/frontend
npm start
```

### 方式二：使用npm脚本

```bash
# 终端1
npm run start:backend

# 终端2
npm run start:sensors

# 终端3
npm run start:frontend
```

## 访问应用

- **前端App**: http://localhost:3000 (React默认端口，如果被占用会自动使用其他端口)
- **后端API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000

## 功能测试

1. **传感器数据采集**
   - 传感器模拟器会自动发送数据
   - 查看后端控制台确认数据接收

2. **预警触发**
   - 当温度>60℃时会自动触发预警
   - 前端会显示弹窗和播放语音提示

3. **火点显示**
   - 预警触发后，前端地图会显示红色火点标记

4. **一键求助**
   - 点击右侧"一键求助"按钮测试求助功能

5. **多语言切换**
   - 点击顶部语言选择器切换中英文

## 测试目标验证

### 数据上传延迟 < 1秒
- 传感器每500ms上传一次数据
- 查看浏览器控制台或后端日志确认延迟

### 预警触发准确率 > 95%
- 系统会记录所有预警触发
- 访问 `/api/alerts/statistics` 查看准确率统计

### 弱网环境测试
- 使用浏览器开发者工具模拟慢速网络
- 系统会自动重连WebSocket

## 故障排除

### 后端无法启动
- 检查端口3000是否被占用
- 确认已安装所有依赖

### 传感器无法连接
- 确保后端服务已启动
- 检查WebSocket连接地址

### 前端无法显示数据
- 检查浏览器控制台错误
- 确认后端服务正常运行
- 检查CORS设置

## 下一步

系统已包含基础功能，后续可以添加：
- 历史数据查询
- 用户管理
- 设备管理
- 数据分析报表
- 移动端App（React Native）

