/**
 * 预警管理模块
 * 管理预警触发、推送和冷却期
 */

class AlertManager {
  constructor(io) {
    this.io = io;
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.cooldownMap = new Map();
    this.thresholds = require('../config/thresholds.json');
  }

  /**
   * 触发预警
   * @param {Object} alertData - 预警数据
   */
  triggerAlert(alertData) {
    const alertKey = `${alertData.location}-${alertData.type}`;
    const now = Date.now();

    // 检查冷却期
    if (this.isInCooldown(alertKey, now)) {
      return false;
    }

    // 创建预警对象
    const alert = {
      id: `${alertKey}-${now}`,
      ...alertData,
      status: 'active',
      triggeredAt: now
    };

    // 存储预警
    this.activeAlerts.set(alertKey, alert);
    this.alertHistory.push(alert);

    // 限制历史记录数量
    if (this.alertHistory.length > 1000) {
      this.alertHistory.shift();
    }

    // 设置冷却期
    this.cooldownMap.set(alertKey, now + this.thresholds.alertCooldown);

    // 广播预警到所有连接的客户端
    this.broadcastAlert(alert);

    console.log(`[ALERT] ${alert.message?.zh || alert.message || '预警已触发'}`);
    return true;
  }

  /**
   * 检查是否在冷却期内
   */
  isInCooldown(alertKey, now) {
    const cooldownEnd = this.cooldownMap.get(alertKey);
    return cooldownEnd && now < cooldownEnd;
  }

  /**
   * 广播预警
   */
  broadcastAlert(alert) {
    if (this.io) {
      // 通过WebSocket广播预警（直接发送alert对象）
      this.io.emit('alert', alert);

      // 同时发送火点位置信息
      this.io.emit('fire_point', {
        location: alert.location,
        coordinates: alert.coordinates || { lat: 0, lng: 0 },
        level: alert.level,
        timestamp: alert.timestamp
      });
    }
  }

  /**
   * 解决预警
   */
  resolveAlert(alertId) {
    for (const [key, alert] of this.activeAlerts.entries()) {
      if (alert.id === alertId) {
        alert.status = 'resolved';
        alert.resolvedAt = Date.now();
        this.activeAlerts.delete(key);
        
        if (this.io) {
          this.io.emit('alert_resolved', {
            alertId: alertId,
            location: alert.location
          });
        }
        return true;
      }
    }
    return false;
  }

  /**
   * 自动解决预警（当传感器数据恢复正常时）
   * @param {string} location - 位置
   * @param {string} type - 预警类型
   */
  autoResolveAlert(location, type) {
    const alertKey = `${location}-${type}`;
    const alert = this.activeAlerts.get(alertKey);
    
    if (alert) {
      // 只有当预警存在超过一定时间后才自动清除（避免数据波动导致频繁清除）
      const alertAge = Date.now() - alert.triggeredAt;
      if (alertAge > 5000) { // 预警存在超过5秒后才自动清除
        alert.status = 'resolved';
        alert.resolvedAt = Date.now();
        alert.autoResolved = true;
        this.activeAlerts.delete(alertKey);
        
        if (this.io) {
          this.io.emit('alert_resolved', {
            alertId: alert.id,
            location: alert.location
          });
        }
        console.log(`[AUTO-RESOLVE] ${location} 的 ${type} 预警已自动清除（数据已恢复正常）`);
        return true;
      }
    }
    return false;
  }

  /**
   * 获取活跃预警列表
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * 获取预警历史
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * 获取预警统计
   */
  getAlertStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAlerts = this.alertHistory.filter(
      alert => new Date(alert.timestamp) >= today
    );

    return {
      total: this.alertHistory.length,
      active: this.activeAlerts.size,
      today: todayAlerts.length,
      byType: {
        temperature: todayAlerts.filter(a => a.type === 'temperature').length,
        smoke: todayAlerts.filter(a => a.type === 'smoke').length,
        co: todayAlerts.filter(a => a.type === 'co').length
      },
      accuracy: this.calculateAccuracy()
    };
  }

  /**
   * 计算预警准确率
   * 基于预警触发后的数据验证
   */
  calculateAccuracy() {
    if (this.alertHistory.length === 0) return 100;
    
    // 简化的准确率计算：假设所有触发的预警都是有效的
    // 实际应用中需要更复杂的验证逻辑
    const recentAlerts = this.alertHistory.slice(-100);
    const validAlerts = recentAlerts.filter(alert => {
      // 这里可以添加更复杂的验证逻辑
      return alert.level === 'critical' || alert.level === 'alert';
    });
    
    return (validAlerts.length / recentAlerts.length * 100).toFixed(2);
  }
}

module.exports = AlertManager;

