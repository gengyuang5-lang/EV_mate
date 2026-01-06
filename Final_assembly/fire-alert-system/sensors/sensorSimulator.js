/**
 * 传感器数据模拟器
 * 模拟烟雾、温度、CO传感器的数据采集
 */

const WebSocket = require('ws');

// 传感器配置
const SENSORS = [
  { id: 'sensor-001', location: '一楼大厅', coordinates: { lat: 39.9042, lng: 116.4074 } },
  { id: 'sensor-002', location: '二楼走廊', coordinates: { lat: 39.9043, lng: 116.4075 } },
  { id: 'sensor-003', location: '三楼办公室', coordinates: { lat: 39.9044, lng: 116.4076 } },
  { id: 'sensor-004', location: '地下室', coordinates: { lat: 39.9041, lng: 116.4073 } }
];

// WebSocket连接
const ws = new WebSocket('ws://localhost:3000');

let isConnected = false;

ws.on('open', () => {
  console.log('✅ 已连接到服务器');
  isConnected = true;
  startSimulation();
});

ws.on('error', (error) => {
  console.error('❌ WebSocket连接错误:', error.message);
  console.log('💡 请确保后端服务器已启动 (node backend/server.js)');
  isConnected = false;
});

ws.on('close', () => {
  console.log('🔌 与服务器断开连接');
  isConnected = false;
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    if (message.event === 'alert') {
      console.log('🚨 收到预警:', message.data.message.zh);
    }
  } catch (error) {
    console.error('解析消息错误:', error);
  }
});

/**
 * 生成模拟传感器数据
 */
function generateSensorData(sensor) {
  const now = Date.now();
  
  // 基础值（正常范围）
  let temperature = 20 + Math.random() * 10; // 20-30°C
  let smoke = 5 + Math.random() * 10; // 5-15 ppm
  let co = 2 + Math.random() * 5; // 2-7 ppm

  // 随机触发预警（用于测试）- 降低概率，避免频繁预警
  if (Math.random() < 0.01) { // 1%概率触发预警（降低频率）
    temperature = 60 + Math.random() * 20; // 60-80°C
    smoke = 50 + Math.random() * 30; // 50-80 ppm
    co = 50 + Math.random() * 30; // 50-80 ppm
    console.log(`⚠️  模拟预警数据: ${sensor.location}`);
  }

  return {
    sensorId: sensor.id,
    location: sensor.location,
    coordinates: sensor.coordinates,
    temperature: parseFloat(temperature.toFixed(2)),
    smoke: parseFloat(smoke.toFixed(2)),
    co: parseFloat(co.toFixed(2)),
    timestamp: now
  };
}

/**
 * 开始模拟
 */
function startSimulation() {
  console.log('🚀 开始模拟传感器数据采集...');
  console.log(`📊 传感器数量: ${SENSORS.length}`);
  console.log(`⏱️  上传间隔: 500ms`);
  console.log('');

  setInterval(() => {
    if (!isConnected) return;

    // 为每个传感器生成数据
    SENSORS.forEach(sensor => {
      const data = generateSensorData(sensor);
      
      // 通过WebSocket发送数据
      ws.send(JSON.stringify({
        type: 'sensor_data',
        payload: data
      }));

      // 显示数据（可选）
      // console.log(`📡 ${sensor.location}: 温度=${data.temperature}°C, 烟雾=${data.smoke}ppm, CO=${data.co}ppm`);
    });
  }, 500); // 每500ms上传一次，确保延迟<1秒
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止传感器模拟器...');
  ws.close();
  process.exit(0);
});

console.log('🔌 正在连接服务器...');

