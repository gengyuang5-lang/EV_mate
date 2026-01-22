# EV_mate - EvaMate: AI-Powered Personalized Fire Evacuation & Vigilance Assistant

## 项目简介

EvaMate 是一个基于AI的个性化火灾疏散与预警助手系统，提供实时火灾监控、智能逃生路线规划和紧急求助功能。

## 项目结构

```
EV_mate/
├── Final_assembly/
│   └── fire-alert-system/          # 火灾预警系统主项目
│       ├── backend/                 # 后端服务 (Node.js + Express + WebSocket)
│       ├── frontend/                # Web前端 (React)
│       ├── mobile_app/              # 移动端应用 (React Native)
│       └── fire_alert_flutter/      # Flutter版本 (可选)
├── fire_way/                       # 路径规划相关
├── sensors&warning/                # 传感器和预警模块
└── graph/                          # 项目结构图和文档
```

## 主要功能

### 🔥 实时火灾监控
- 多传感器数据采集（温度、烟雾、一氧化碳）
- 实时预警推送
- WebSocket实时通信

### 🗺️ 智能逃生路线规划
- 建筑平面图可视化
- 基于A*算法的路径规划
- 实时路线更新
- 避开火点区域

### 📱 移动端应用
- Android应用（React Native）
- 一键求助功能
- 位置服务集成
- 多语言支持（中文/英文）

### 🌐 Web管理界面
- 实时监控仪表板
- 预警管理
- 数据统计
- 系统配置

## 技术栈

### 后端
- Node.js + Express
- WebSocket (ws)
- CORS支持

### 前端
- React 18.2.0
- React Scripts 5.0.1
- WebSocket客户端

### 移动端
- React Native 0.72.6
- React Navigation
- React Native Maps
- React Native Vector Icons

## 快速开始

### 后端服务
```bash
cd Final_assembly/fire-alert-system/backend
npm install
npm start
# 服务运行在 http://localhost:3000
```

### Web前端
```bash
cd Final_assembly/fire-alert-system/frontend
npm install
npm start
# 应用运行在 http://localhost:3001
```

### 移动端应用
```bash
cd Final_assembly/fire-alert-system/mobile_app
npm install
# Android
npm run android
# iOS
npm run ios
```

## 环境要求

- Node.js >= 18
- npm 或 yarn
- Android Studio (移动端开发)
- Java JDK 17+ (Android开发)

## 主要更新

### 最新版本 (2026-01-22)
- ✅ 修复图标显示问题
- ✅ 添加建筑平面图逃生路线功能
- ✅ 修复i18n多语言配置
- ✅ 优化WebSocket连接处理
- ✅ 改进错误处理和容错机制

## 许可证

本项目采用 MIT 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

项目仓库: https://github.com/gengyuang5-lang/EV_mate

