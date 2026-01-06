/**
 * 传感器数据处理模块
 * 处理烟雾、温度、CO数据的实时采集和验证
 */

class SensorHandler {
  constructor(alertManager) {
    this.alertManager = alertManager;
    this.dataBuffer = [];
    this.lastUploadTime = Date.now();
  }

  /**
   * 处理传感器数据
   * @param {Object} data - 传感器数据 {temperature, smoke, co, location, timestamp}
   */
  processSensorData(data) {
    const now = Date.now();
    
    // 验证数据完整性
    if (!this.validateData(data)) {
      console.warn('Invalid sensor data received:', data);
      return false;
    }

    // 添加时间戳
    data.timestamp = data.timestamp || now;
    data.receivedAt = now;

    // 计算上传延迟
    const uploadDelay = now - data.timestamp;
    if (uploadDelay > 1000) {
      console.warn(`High upload delay detected: ${uploadDelay}ms`);
    }

    // 检查阈值并触发预警
    this.checkThresholds(data);

    // 存储数据
    this.dataBuffer.push(data);
    
    // 限制缓冲区大小
    if (this.dataBuffer.length > 1000) {
      this.dataBuffer.shift();
    }

    return true;
  }

  /**
   * 验证传感器数据
   */
  validateData(data) {
    return (
      data &&
      typeof data.temperature === 'number' &&
      typeof data.smoke === 'number' &&
      typeof data.co === 'number' &&
      data.location &&
      data.temperature >= -50 && data.temperature <= 200 &&
      data.smoke >= 0 && data.smoke <= 1000 &&
      data.co >= 0 && data.co <= 1000
    );
  }

  /**
   * 检查阈值并触发预警
   */
  checkThresholds(data) {
    const thresholds = require('../config/thresholds.json');
    
    // 检查温度阈值（主要预警条件：>60℃）
    if (data.temperature > thresholds.temperature.alert) {
      this.alertManager.triggerAlert({
        type: 'temperature',
        level: data.temperature > thresholds.temperature.critical ? 'critical' : 'alert',
        value: data.temperature,
        threshold: thresholds.temperature.alert,
        location: data.location,
        timestamp: Date.now(),
        message: {
          zh: `温度预警：${data.location} 温度达到 ${data.temperature.toFixed(1)}°C，超过预警阈值 ${thresholds.temperature.alert}°C`,
          en: `Temperature Alert: ${data.location} temperature reached ${data.temperature.toFixed(1)}°C, exceeding threshold of ${thresholds.temperature.alert}°C`
        }
      });
    } else {
      // 温度恢复正常，自动清除预警
      this.alertManager.autoResolveAlert(data.location, 'temperature');
    }

    // 检查烟雾阈值
    if (data.smoke > thresholds.smoke.alert) {
      this.alertManager.triggerAlert({
        type: 'smoke',
        level: data.smoke > thresholds.smoke.critical ? 'critical' : 'alert',
        value: data.smoke,
        threshold: thresholds.smoke.alert,
        location: data.location,
        timestamp: Date.now(),
        message: {
          zh: `烟雾预警：${data.location} 烟雾浓度达到 ${data.smoke.toFixed(1)}ppm，超过预警阈值 ${thresholds.smoke.alert}ppm`,
          en: `Smoke Alert: ${data.location} smoke concentration reached ${data.smoke.toFixed(1)}ppm, exceeding threshold of ${thresholds.smoke.alert}ppm`
        }
      });
    } else {
      // 烟雾恢复正常，自动清除预警
      this.alertManager.autoResolveAlert(data.location, 'smoke');
    }

    // 检查CO阈值
    if (data.co > thresholds.co.alert) {
      this.alertManager.triggerAlert({
        type: 'co',
        level: data.co > thresholds.co.critical ? 'critical' : 'alert',
        value: data.co,
        threshold: thresholds.co.alert,
        location: data.location,
        timestamp: Date.now(),
        message: {
          zh: `一氧化碳预警：${data.location} CO浓度达到 ${data.co.toFixed(1)}ppm，超过预警阈值 ${thresholds.co.alert}ppm`,
          en: `CO Alert: ${data.location} CO concentration reached ${data.co.toFixed(1)}ppm, exceeding threshold of ${thresholds.co.alert}ppm`
        }
      });
    } else {
      // CO恢复正常，自动清除预警
      this.alertManager.autoResolveAlert(data.location, 'co');
    }
  }

  /**
   * 获取最近的数据
   */
  getRecentData(limit = 100) {
    return this.dataBuffer.slice(-limit);
  }

  /**
   * 获取统计数据
   */
  getStatistics() {
    const recent = this.dataBuffer.slice(-100);
    if (recent.length === 0) return null;

    return {
      totalRecords: this.dataBuffer.length,
      recentRecords: recent.length,
      avgTemperature: recent.reduce((sum, d) => sum + d.temperature, 0) / recent.length,
      avgSmoke: recent.reduce((sum, d) => sum + d.smoke, 0) / recent.length,
      avgCO: recent.reduce((sum, d) => sum + d.co, 0) / recent.length,
      lastUpdate: recent[recent.length - 1].timestamp
    };
  }
}

module.exports = SensorHandler;

