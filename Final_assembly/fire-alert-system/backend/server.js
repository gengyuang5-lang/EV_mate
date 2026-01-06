/**
 * 火灾预警系统 - 后端服务器
 * 提供RESTful API和WebSocket实时通信
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const SensorHandler = require('./sensorHandler');
const AlertManager = require('./alertManager');

const app = express();
const server = http.createServer(app);

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 初始化管理器
const alertManager = new AlertManager(null);
const sensorHandler = new SensorHandler(alertManager);

// 将WebSocket服务器传递给AlertManager
alertManager.io = {
  emit: (event, data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event, data }));
      }
    });
  }
};

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  console.log('新的客户端连接:', req.socket.remoteAddress);

  // 发送当前活跃预警
  const activeAlerts = alertManager.getActiveAlerts();
  if (activeAlerts.length > 0) {
    ws.send(JSON.stringify({
      event: 'active_alerts',
      data: activeAlerts
    }));
  }

  // 接收客户端消息
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'sensor_data':
          // 处理传感器数据
          sensorHandler.processSensorData(data.payload);
          break;
        
        case 'resolve_alert':
          // 解决预警
          alertManager.resolveAlert(data.alertId);
          break;
        
        case 'help_request':
          // 处理求助请求
          handleHelpRequest(data);
          break;
        
        default:
          console.log('未知消息类型:', data.type);
      }
    } catch (error) {
      console.error('处理WebSocket消息错误:', error);
    }
  });

  ws.on('close', () => {
    console.log('客户端断开连接');
  });

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

// 根路径 - 显示服务状态
app.get('/', (req, res) => {
  res.json({
    service: 'Fire Alert System Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'GET /api/alerts/active': '获取活跃预警',
      'GET /api/alerts/history': '获取预警历史',
      'GET /api/alerts/statistics': '获取预警统计',
      'POST /api/alerts/resolve': '解决预警',
      'POST /api/help/request': '发送求助请求',
      'POST /api/sensor/data': '接收传感器数据'
    },
    websocket: 'ws://localhost:3000',
    demo: 'http://localhost:8080/demo-web.html'
  });
});

// RESTful API

// 接收传感器数据
app.post('/api/sensor/data', (req, res) => {
  const data = req.body;
  const success = sensorHandler.processSensorData(data);
  
  if (success) {
    res.json({ 
      success: true, 
      message: '数据接收成功',
      timestamp: Date.now()
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: '数据格式错误' 
    });
  }
});

// 获取活跃预警
app.get('/api/alerts/active', (req, res) => {
  res.json({
    success: true,
    data: alertManager.getActiveAlerts()
  });
});

// 获取预警历史
app.get('/api/alerts/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    success: true,
    data: alertManager.getAlertHistory(limit)
  });
});

// 获取预警统计
app.get('/api/alerts/statistics', (req, res) => {
  res.json({
    success: true,
    data: alertManager.getAlertStatistics()
  });
});

// 解决预警
app.post('/api/alerts/resolve', (req, res) => {
  const { alertId } = req.body;
  const success = alertManager.resolveAlert(alertId);
  
  res.json({
    success,
    message: success ? '预警已解决' : '预警不存在'
  });
});

// 一键求助
app.post('/api/help/request', (req, res) => {
  const { location, coordinates, message, userId } = req.body;
  
  const helpRequest = {
    id: `help-${Date.now()}`,
    location,
    coordinates,
    message,
    userId,
    timestamp: Date.now(),
    status: 'pending'
  };

  // 广播求助请求
  alertManager.io.emit('help_request', helpRequest);

  res.json({
    success: true,
    data: helpRequest,
    message: '求助请求已发送'
  });
});

// 获取传感器统计数据
app.get('/api/sensor/statistics', (req, res) => {
  const stats = sensorHandler.getStatistics();
  res.json({
    success: true,
    data: stats
  });
});

// 获取最近传感器数据
app.get('/api/sensor/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({
    success: true,
    data: sensorHandler.getRecentData(limit)
  });
});

// 处理求助请求
function handleHelpRequest(data) {
  const helpRequest = {
    id: `help-${Date.now()}`,
    ...data,
    timestamp: Date.now(),
    status: 'pending'
  };

  // 广播求助请求
  alertManager.io.emit('help_request', helpRequest);
  console.log(`[HELP] 求助请求: ${data.location}`);
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🔥 火灾预警系统后端服务已启动`);
  console.log(`📡 HTTP服务器: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket服务器: ws://localhost:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  console.log(`=================================`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

