/**
 * 路径规划服务
 * 为移动应用提供逃生路线规划功能
 */

import { API_URL } from '../utils/constants';

/**
 * 简化的A*路径规划算法（用于移动端）
 */
class SimplePathPlanner {
  /**
   * 计算逃生路线
   * @param {Object} start - 起点 {latitude, longitude}
   * @param {Object} goal - 终点 {latitude, longitude}
   * @param {Array} obstacles - 障碍物列表（火点位置）
   * @returns {Promise<Object>} 路径结果
   */
  async calculateEscapeRoute(start, goal, obstacles = []) {
    try {
      // 调用后端API进行路径规划
      const response = await fetch(`${API_URL}/api/path/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: {
            x: start.longitude,
            y: start.latitude,
            floor: start.floor || 0
          },
          goal: {
            x: goal.longitude,
            y: goal.latitude,
            floor: goal.floor || 0
          },
          obstacles: obstacles.map(ob => ({
            x: ob.longitude || ob.coordinates?.lng || ob.lng,
            y: ob.latitude || ob.coordinates?.lat || ob.lat,
            radius: ob.radius || 50 // 避让半径（米）
          }))
        })
      });

      if (!response.ok) {
        throw new Error('路径规划请求失败');
      }

      const data = await response.json();
      
      // 转换路径点格式
      if (data.success && data.path) {
        return {
          success: true,
          path: data.path.map(point => ({
            latitude: point.y || point.lat || point.latitude,
            longitude: point.x || point.lng || point.longitude,
            floor: point.floor || 0
          })),
          distance: data.distance || 0,
          estimatedTime: data.estimatedTime || 0
        };
      }

      // 如果后端不可用，使用简化算法
      return this.simpleRoute(start, goal, obstacles);
    } catch (error) {
      console.warn('后端路径规划失败，使用简化算法:', error);
      // 使用简化的直线路径（避开障碍物）
      return this.simpleRoute(start, goal, obstacles);
    }
  }

  /**
   * 简化的路径规划（直线路径，避开障碍物）
   */
  simpleRoute(start, goal, obstacles) {
    // 计算直线距离
    const distance = this.calculateDistance(start, goal);
    
    // 检查是否有障碍物在路径上
    const pathBlocked = obstacles.some(ob => {
      const obPoint = {
        latitude: ob.latitude || ob.coordinates?.lat || ob.lat,
        longitude: ob.longitude || ob.coordinates?.lng || ob.lng
      };
      return this.isPointOnPath(start, goal, obPoint, ob.radius || 50);
    });

    if (!pathBlocked) {
      // 直线路径
      return {
        success: true,
        path: [start, goal],
        distance,
        estimatedTime: Math.ceil(distance / 1.4) // 假设步行速度1.4m/s
      };
    }

    // 如果有障碍物，计算绕行路径
    return this.calculateDetourRoute(start, goal, obstacles);
  }

  /**
   * 计算绕行路径
   */
  calculateDetourRoute(start, goal, obstacles) {
    // 简化的绕行算法：在起点和终点之间插入中间点，避开障碍物
    const path = [start];
    
    // 找到路径上最近的障碍物
    let nearestObstacle = null;
    let minDistance = Infinity;
    
    obstacles.forEach(ob => {
      const obPoint = {
        latitude: ob.latitude || ob.coordinates?.lat || ob.lat,
        longitude: ob.longitude || ob.coordinates?.lng || ob.lng
      };
      const dist = this.distanceToLine(start, goal, obPoint);
      if (dist < minDistance && dist < (ob.radius || 50)) {
        minDistance = dist;
        nearestObstacle = obPoint;
      }
    });

    if (nearestObstacle) {
      // 计算绕行点（垂直于路径方向偏移）
      const midPoint = this.midPoint(start, goal);
      const bearing = this.calculateBearing(start, goal);
      const offset = 100; // 偏移100米
      
      // 右侧绕行点
      const detourPoint = this.calculateDestination(
        midPoint,
        bearing + 90, // 垂直方向
        offset
      );
      
      path.push(detourPoint);
    }
    
    path.push(goal);
    
    const totalDistance = this.calculatePathDistance(path);
    
    return {
      success: true,
      path,
      distance: totalDistance,
      estimatedTime: Math.ceil(totalDistance / 1.4)
    };
  }

  /**
   * 计算两点间距离（米）
   */
  calculateDistance(point1, point2) {
    const R = 6371000; // 地球半径（米）
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) *
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * 计算路径总距离
   */
  calculatePathDistance(path) {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += this.calculateDistance(path[i - 1], path[i]);
    }
    return total;
  }

  /**
   * 判断点是否在路径上
   */
  isPointOnPath(start, end, point, radius) {
    const distToLine = this.distanceToLine(start, end, point);
    return distToLine < radius;
  }

  /**
   * 计算点到直线的距离
   */
  distanceToLine(start, end, point) {
    const A = point.latitude - start.latitude;
    const B = point.longitude - start.longitude;
    const C = end.latitude - start.latitude;
    const D = end.longitude - start.longitude;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = start.latitude;
      yy = start.longitude;
    } else if (param > 1) {
      xx = end.latitude;
      yy = end.longitude;
    } else {
      xx = start.latitude + param * C;
      yy = start.longitude + param * D;
    }

    const dx = point.latitude - xx;
    const dy = point.longitude - yy;
    return Math.sqrt(dx * dx + dy * dy) * 111000; // 转换为米（近似）
  }

  /**
   * 计算中点
   */
  midPoint(point1, point2) {
    return {
      latitude: (point1.latitude + point2.latitude) / 2,
      longitude: (point1.longitude + point2.longitude) / 2
    };
  }

  /**
   * 计算方位角
   */
  calculateBearing(start, end) {
    const dLon = this.toRad(end.longitude - start.longitude);
    const lat1 = this.toRad(start.latitude);
    const lat2 = this.toRad(end.latitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return this.toDeg(Math.atan2(y, x));
  }

  /**
   * 计算目标点（给定起点、方位角和距离）
   */
  calculateDestination(start, bearing, distance) {
    const R = 6371000; // 地球半径（米）
    const lat1 = this.toRad(start.latitude);
    const lon1 = this.toRad(start.longitude);
    const brng = this.toRad(bearing);
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
      latitude: this.toDeg(lat2),
      longitude: this.toDeg(lon2)
    };
  }

  /**
   * 角度转弧度
   */
  toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * 弧度转角度
   */
  toDeg(radians) {
    return radians * 180 / Math.PI;
  }
}

const pathPlanner = new SimplePathPlanner();

/**
 * 获取最近的出口位置
 */
export const getNearestExit = async (currentLocation, exits = []) => {
  // 优先使用室内地图数据
  try {
    const { getNearestExitFromMap } = require('./buildingMap');
    const baseLocation = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude
    };
    const exit = getNearestExitFromMap(currentLocation, baseLocation);
    if (exit) {
      return exit;
    }
  } catch (error) {
    console.warn('使用室内地图失败，使用默认逻辑:', error);
  }

  if (!exits || exits.length === 0) {
    // 默认出口位置（如果没有提供）
    return {
      latitude: currentLocation.latitude + 0.001,
      longitude: currentLocation.longitude + 0.001,
      name: '最近出口'
    };
  }

  let nearest = exits[0];
  let minDistance = pathPlanner.calculateDistance(currentLocation, exits[0]);

  exits.forEach(exit => {
    const distance = pathPlanner.calculateDistance(currentLocation, exit);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = exit;
    }
  });

  return { ...nearest, distance: minDistance };
};

/**
 * 计算逃生路线
 */
export const calculateEscapeRoute = async (start, goal, obstacles) => {
  // 优先使用室内地图路径规划
  try {
    const { generateEscapeRoute } = require('./buildingMap');
    const baseLocation = {
      latitude: start.latitude,
      longitude: start.longitude
    };
    const route = generateEscapeRoute(start, baseLocation);
    if (route && route.success) {
      return route;
    }
  } catch (error) {
    console.warn('使用室内地图路径规划失败，使用默认算法:', error);
  }

  // 回退到原有算法
  return await pathPlanner.calculateEscapeRoute(start, goal, obstacles);
};

export default pathPlanner;

