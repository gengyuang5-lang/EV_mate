/**
 * 障碍物地图管理
 * 管理火点区域、拥堵路段等障碍物信息
 */

class ObstacleMap {
  constructor() {
    this.fireZones = []; // 火点区域列表
    this.congestionZones = []; // 拥堵区域列表
    this.staticObstacles = []; // 静态障碍物
  }

  /**
   * 更新火点区域
   * @param {Object} firePoint - 火点信息 {x, y, floor, spreadRadius}
   */
  updateFireZone(firePoint) {
    // 移除旧的相同火点
    this.fireZones = this.fireZones.filter(
      zone => zone.id !== firePoint.id
    );
    
    // 添加新的火点区域
    this.fireZones.push({
      id: firePoint.id || `fire_${Date.now()}`,
      center: {
        x: firePoint.x,
        y: firePoint.y,
        floor: firePoint.floor || 0
      },
      radius: firePoint.spreadRadius || 10,
      intensity: firePoint.intensity || 1.0,
      timestamp: new Date()
    });
  }

  /**
   * 更新拥堵区域
   * @param {Array} congestionZones - 拥堵区域列表
   */
  updateCongestionZones(congestionZones) {
    this.congestionZones = congestionZones.map(zone => ({
      id: zone.id || `congestion_${Date.now()}`,
      polygon: zone.polygon, // 多边形区域
      severity: zone.severity || 'medium', // low, medium, high
      timestamp: new Date()
    }));
  }

  /**
   * 检查点是否在火点区域内
   * @param {Object} point - 点坐标 {x, y, floor}
   * @returns {boolean}
   */
  isInFireZone(point) {
    for (const zone of this.fireZones) {
      const distance = this.calculateDistance(point, zone.center);
      if (distance <= zone.radius && 
          (point.floor || 0) === (zone.center.floor || 0)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查点是否在拥堵区域内
   * @param {Object} point - 点坐标 {x, y, floor}
   * @returns {boolean}
   */
  isInCongestionZone(point) {
    for (const zone of this.congestionZones) {
      if (this.isPointInPolygon(point, zone.polygon)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查点是否在障碍物区域内
   * @param {Object} point - 点坐标
   * @returns {boolean}
   */
  isObstacle(point) {
    return this.isInFireZone(point) || 
           this.isInCongestionZone(point) ||
           this.isStaticObstacle(point);
  }

  /**
   * 检查是否为静态障碍物
   */
  isStaticObstacle(point) {
    // TODO: 检查静态障碍物（墙体、固定设施等）
    return false;
  }

  /**
   * 计算两点间距离
   */
  calculateDistance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 判断点是否在多边形内（射线法）
   */
  isPointInPolygon(point, polygon) {
    if (!polygon || polygon.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
                       (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  /**
   * 获取所有障碍物
   */
  getAllObstacles() {
    return {
      fireZones: this.fireZones,
      congestionZones: this.congestionZones,
      staticObstacles: this.staticObstacles
    };
  }

  /**
   * 清除过期的障碍物（超过一定时间）
   * @param {number} maxAge - 最大年龄（毫秒）
   */
  clearExpiredObstacles(maxAge = 300000) { // 默认 5 分钟
    const now = Date.now();
    
    this.fireZones = this.fireZones.filter(
      zone => now - zone.timestamp.getTime() < maxAge
    );
    
    this.congestionZones = this.congestionZones.filter(
      zone => now - zone.timestamp.getTime() < maxAge
    );
  }
}

module.exports = ObstacleMap;

