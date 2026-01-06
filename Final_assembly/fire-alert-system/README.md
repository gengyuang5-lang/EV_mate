# 火灾预警系统 (Fire Alert System)

## 项目简介

一个完整的火灾预警系统，包含传感器数据采集、实时预警、移动端App等功能。

## 功能特性

### 基础感知与预警功能
- ✅ 传感器数据实时采集（烟雾、温度、CO）
- ✅ 阈值触发预警（温度>60℃自动报警）
- ✅ 数据上传延迟<1秒
- ✅ 预警触发准确率>95%

### App基础版功能
- ✅ 实时火点显示（红点标记）
- ✅ 预警推送（弹窗+语音）
- ✅ 一键求助功能
- ✅ 多语言支持（中英文）

## 项目结构

```
fire-alert-system/
├── backend/          # 后端服务
│   ├── server.js     # 主服务器
│   ├── sensorHandler.js  # 传感器数据处理
│   └── alertManager.js   # 预警管理
├── frontend/         # 前端Web应用
│   ├── src/          # 源代码
│   ├── public/       # 静态资源
│   └── package.json  # 依赖配置
├── mobile_app/       # 移动端App
│   ├── src/          # 源代码
│   ├── android/      # Android原生代码
│   ├── ios/          # iOS原生代码
│   └── package.json  # 依赖配置
├── sensors/          # 传感器模拟
│   └── sensorSimulator.js  # 传感器数据模拟器
├── config/           # 配置文件
│   └── thresholds.json     # 预警阈值配置
└── README.md         # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 2. 启动服务

```bash
# 启动后端服务
cd backend
node server.js

# 启动传感器模拟器
cd ../sensors
node sensorSimulator.js

# 启动前端App
cd ../frontend
npm start
```

## 技术栈

- **后端**: Node.js + Express + WebSocket
- **前端**: React + React Native (可选)
- **通信**: WebSocket (实时数据传输)
- **数据库**: (可选) MongoDB/MySQL

## 测试目标

- ✅ 传感器数据上传延迟 < 1秒
- ✅ 预警触发准确率 > 95%
- ✅ App在弱网环境下正常接收信息

## 后续功能规划

- 历史数据查询
- 多用户管理
- 设备管理
- 数据分析报表

