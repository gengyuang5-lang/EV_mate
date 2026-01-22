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
      'GET /api/firepoints': '获取火点数据（地图显示）',
      'POST /api/alerts/resolve': '解决预警',
      'POST /api/help/request': '发送求助请求',
      'POST /api/sensor/data': '接收传感器数据',
      'POST /api/path/calculate': '计算逃生路径'
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

// 获取火点数据（用于地图显示）
app.get('/api/firepoints', (req, res) => {
  const alerts = alertManager.getActiveAlerts();
  const firePoints = alerts
    .filter(alert => alert.coordinates && alert.coordinates.lat && alert.coordinates.lng)
    .map(alert => ({
      id: alert.id,
      location: alert.location,
      coordinates: alert.coordinates,
      level: alert.level,
      type: alert.type,
      temperature: alert.temperature,
      smoke: alert.smoke,
      co: alert.co,
      timestamp: alert.timestamp || alert.triggeredAt,
      message: alert.message
    }));
  
  res.json({
    success: true,
    data: firePoints,
    count: firePoints.length
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

// 路径规划API
app.post('/api/path/calculate', (req, res) => {
  try {
    const { start, goal, obstacles = [] } = req.body;
    
    if (!start || !goal) {
      return res.status(400).json({
        success: false,
        message: '起点和终点是必需的'
      });
    }

    // 简化的路径规划算法
    const path = calculatePath(start, goal, obstacles);
    const distance = calculatePathDistance(path);
    const estimatedTime = Math.ceil(distance / 1.4); // 假设步行速度1.4m/s

    res.json({
      success: true,
      path: path,
      distance: distance,
      estimatedTime: estimatedTime
    });
  } catch (error) {
    console.error('路径规划错误:', error);
    res.status(500).json({
      success: false,
      message: '路径规划失败',
      error: error.message
    });
  }
});

// 计算路径（简化的A*算法）
function calculatePath(start, goal, obstacles) {
  // 计算直线距离
  const directDistance = haversineDistance(
    { lat: start.y || start.latitude, lng: start.x || start.longitude },
    { lat: goal.y || goal.latitude, lng: goal.x || goal.longitude }
  );

  // 检查是否有障碍物在路径上
  const blockedObstacles = obstacles.filter(ob => {
    const obPoint = {
      lat: ob.y || ob.latitude || ob.coordinates?.lat,
      lng: ob.x || ob.longitude || ob.coordinates?.lng
    };
    const radius = ob.radius || 50; // 避让半径（米）
    return isPointNearPath(
      { lat: start.y || start.latitude, lng: start.x || start.longitude },
      { lat: goal.y || goal.latitude, lng: goal.x || goal.longitude },
      obPoint,
      radius
    );
  });

  if (blockedObstacles.length === 0) {
    // 直线路径
    return [
      { x: start.x || start.longitude, y: start.y || start.latitude, floor: start.floor || 0 },
      { x: goal.x || goal.longitude, y: goal.y || goal.latitude, floor: goal.floor || 0 }
    ];
  }

  // 计算绕行路径
  const path = [];
  path.push({ x: start.x || start.longitude, y: start.y || start.latitude, floor: start.floor || 0 });

  // 为每个障碍物添加绕行点
  blockedObstacles.forEach(ob => {
    const obPoint = {
      lat: ob.y || ob.latitude || ob.coordinates?.lat,
      lng: ob.x || ob.longitude || ob.coordinates?.lng
    };
    const offset = (ob.radius || 50) + 20; // 额外偏移20米

    // 计算绕行点（垂直于路径方向）
    const midPoint = {
      lat: ((start.y || start.latitude) + (goal.y || goal.latitude)) / 2,
      lng: ((start.x || start.longitude) + (goal.x || goal.longitude)) / 2
    };
    
    const bearing = calculateBearing(
      { lat: start.y || start.latitude, lng: start.x || start.longitude },
      { lat: goal.y || goal.latitude, lng: goal.x || goal.longitude }
    );

    // 右侧绕行
    const detourPoint = calculateDestinationPoint(midPoint, bearing + 90, offset);
    path.push({ x: detourPoint.lng, y: detourPoint.lat, floor: 0 });
  });

  path.push({ x: goal.x || goal.longitude, y: goal.y || goal.latitude, floor: goal.floor || 0 });
  return path;
}

// 计算两点间距离（Haversine公式）
function haversineDistance(point1, point2) {
  const R = 6371000; // 地球半径（米）
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) *
            Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

// 计算路径总距离
function calculatePathDistance(path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversineDistance(
      { lat: path[i - 1].y, lng: path[i - 1].x },
      { lat: path[i].y, lng: path[i].x }
    );
  }
  return total;
}

// 判断点是否靠近路径
function isPointNearPath(start, end, point, radius) {
  const distance = distanceToLine(start, end, point);
  return distance < radius;
}

// 计算点到直线的距离
function distanceToLine(start, end, point) {
  const A = point.lat - start.lat;
  const B = point.lng - start.lng;
  const C = end.lat - start.lat;
  const D = end.lng - start.lng;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;
  if (param < 0) {
    xx = start.lat;
    yy = start.lng;
  } else if (param > 1) {
    xx = end.lat;
    yy = end.lng;
  } else {
    xx = start.lat + param * C;
    yy = start.lng + param * D;
  }

  const dx = point.lat - xx;
  const dy = point.lng - yy;
  return Math.sqrt(dx * dx + dy * dy) * 111000; // 转换为米（近似）
}

// 计算方位角
function calculateBearing(start, end) {
  const dLon = toRad(end.lng - start.lng);
  const lat1 = toRad(start.lat);
  const lat2 = toRad(end.lat);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  return toDeg(Math.atan2(y, x));
}

// 计算目标点（给定起点、方位角和距离）
function calculateDestinationPoint(start, bearing, distance) {
  const R = 6371000; // 地球半径（米）
  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const brng = toRad(bearing);
  const d = distance / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    lat: toDeg(lat2),
    lng: toDeg(lon2)
  };
}

// 角度转弧度
function toRad(degrees) {
  return degrees * Math.PI / 180;
}

// 弧度转角度
function toDeg(radians) {
  return radians * 180 / Math.PI;
}

// 初始化模拟数据（启动时创建一些模拟火点）
function initializeMockData() {
  // 创建一些模拟的火点预警（北京地区，围绕天安门广场）
  const mockAlerts = [
    {
      location: '1号楼3层会议室',
      coordinates: { lat: 39.9042, lng: 116.4074 },
      level: 'warning',
      type: 'temperature',
      temperature: 65,
      smoke: 120,
      co: 15,
      message: { zh: '1号楼3层会议室温度异常', en: 'Abnormal temperature in Building 1, 3F Meeting Room' }
    },
    {
      location: '2号楼1层大厅',
      coordinates: { lat: 39.9062, lng: 116.4094 },
      level: 'alert',
      type: 'temperature',
      temperature: 75,
      smoke: 180,
      co: 25,
      message: { zh: '2号楼1层大厅发现火情', en: 'Fire detected in Building 2, 1F Hall' }
    },
    {
      location: '3号楼5层走廊',
      coordinates: { lat: 39.9022, lng: 116.4054 },
      level: 'warning',
      type: 'smoke',
      temperature: 70,
      smoke: 150,
      co: 20,
      message: { zh: '3号楼5层走廊烟雾浓度异常', en: 'Abnormal smoke concentration in Building 3, 5F Corridor' }
    },
    {
      location: '4号楼2层办公室',
      coordinates: { lat: 39.9082, lng: 116.4094 },
      level: 'alert',
      type: 'temperature',
      temperature: 80,
      smoke: 200,
      co: 30,
      message: { zh: '4号楼2层办公室高温预警', en: 'High temperature alert in Building 4, 2F Office' }
    },
    {
      location: '5号楼地下室',
      coordinates: { lat: 39.9002, lng: 116.4034 },
      level: 'critical',
      type: 'smoke',
      temperature: 85,
      smoke: 250,
      co: 35,
      message: { zh: '5号楼地下室严重烟雾报警', en: 'Critical smoke alarm in Building 5 Basement' }
    },
    {
      location: '6号楼顶层',
      coordinates: { lat: 39.9102, lng: 116.4114 },
      level: 'warning',
      type: 'co',
      temperature: 68,
      smoke: 130,
      co: 22,
      message: { zh: '6号楼顶层一氧化碳浓度偏高', en: 'High CO concentration in Building 6 Top Floor' }
    }
  ];

  // 直接通过 alertManager 创建预警，确保立即可用
  mockAlerts.forEach((alertData, index) => {
    setTimeout(() => {
      // 直接触发预警，不通过传感器处理流程
      alertManager.triggerAlert({
        type: alertData.type || 'temperature',
        level: alertData.level,
        value: alertData.temperature,
        location: alertData.location,
        coordinates: alertData.coordinates,
        message: alertData.message,
        temperature: alertData.temperature,
        smoke: alertData.smoke,
        co: alertData.co,
        timestamp: Date.now() - (index * 1000) // 让它们有稍微不同的时间戳
      });
      console.log(`[MOCK] ✅ 已创建模拟火点: ${alertData.location} (${alertData.level})`);
    }, index * 500); // 每0.5秒创建一个，更快
  });
  
  console.log(`[MOCK] 📍 共创建 ${mockAlerts.length} 个模拟火点数据`);
}

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网络接口，允许Android模拟器通过10.0.2.2访问

server.listen(PORT, HOST, () => {
  console.log(`=================================`);
  console.log(`🔥 火灾预警系统后端服务已启动`);
  console.log(`📡 HTTP服务器: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`📱 Android模拟器访问: http://10.0.2.2:${PORT}`);
  console.log(`🔌 WebSocket服务器: ws://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`🌐 监听地址: ${HOST}:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  console.log(`=================================`);
  
  // 初始化模拟数据（可选，用于测试）
  // 如果需要模拟数据，取消下面的注释
  setTimeout(() => {
    initializeMockData();
  }, 2000); // 延迟2秒后初始化
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

