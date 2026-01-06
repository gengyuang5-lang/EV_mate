/**
 * AI Agent 实现
 * 负责智能决策和环境感知
 */

class AIAgent {
  constructor(pathPlanner, digitalTwin) {
    this.pathPlanner = pathPlanner;
    this.digitalTwin = digitalTwin;
    this.currentPath = null;
    this.userProfile = null; // 用户画像（普通/老人/儿童/残障）
  }

  /**
   * 火点触发后的路径规划
   * @param {Object} firePoint - 火点信息 {x, y, floor, spreadRadius}
   * @param {Object} userLocation - 用户当前位置
   * @param {Object} userProfile - 用户画像
   * @returns {Promise<Object>} 路径规划结果
   */
  async planEscapeRoute(firePoint, userLocation, userProfile = null) {
    this.userProfile = userProfile;
    
    // 更新障碍物地图（火点区域）
    this.pathPlanner.obstacleMap.updateFireZone(firePoint);
    
    // 查找最近的安全出口
    const nearestExit = this.findNearestExit(userLocation, firePoint);
    
    // 根据用户画像选择路径规划策略
    const options = this.getPathPlanningOptions(userProfile);
    
    // 计算路径
    const pathResult = await this.pathPlanner.calculatePath(
      userLocation,
      nearestExit,
      options
    );
    
    this.currentPath = pathResult.path;
    
    // 如果是弱势群体，推送协助信号
    if (this.isVulnerableGroup(userProfile)) {
      await this.sendAssistanceSignal(userLocation, userProfile);
    }
    
    return {
      path: pathResult.path,
      exit: nearestExit,
      distance: pathResult.distance,
      responseTime: pathResult.responseTime,
      userProfile,
      needsAssistance: this.isVulnerableGroup(userProfile)
    };
  }

  /**
   * 查找最近的安全出口
   */
  findNearestExit(userLocation, firePoint) {
    const exits = this.digitalTwin.markers.safetyExits;
    let nearestExit = null;
    let minDistance = Infinity;
    
    for (const exit of exits) {
      // 排除被火点影响的出口
      if (this.isExitAffectedByFire(exit, firePoint)) continue;
      
      const distance = this.calculateDistance(userLocation, exit);
      if (distance < minDistance) {
        minDistance = distance;
        nearestExit = exit;
      }
    }
    
    return nearestExit;
  }

  /**
   * 判断出口是否受火点影响
   */
  isExitAffectedByFire(exit, firePoint) {
    const distance = this.calculateDistance(exit, firePoint);
    return distance < firePoint.spreadRadius;
  }

  /**
   * 计算两点间距离
   */
  calculateDistance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = (pointA.floor || 0) - (pointB.floor || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz * 10);
  }

  /**
   * 获取路径规划选项（根据用户画像）
   */
  getPathPlanningOptions(userProfile) {
    if (!userProfile) {
      return {
        avoidFire: true,
        avoidCongestion: true,
        preferAccessible: false
      };
    }
    
    // 弱势群体选项
    if (this.isVulnerableGroup(userProfile)) {
      return {
        avoidFire: true,
        avoidCongestion: true,
        preferAccessible: true, // 优先无障碍通道
        avoidSteepSlopes: true, // 避开陡坡
        avoidNarrowPaths: true, // 避开窄道
        speedReduction: 0.3 // 速度降低 30%
      };
    }
    
    return {
      avoidFire: true,
      avoidCongestion: true,
      preferAccessible: false
    };
  }

  /**
   * 判断是否为弱势群体
   */
  isVulnerableGroup(userProfile) {
    if (!userProfile) return false;
    return ['elderly', 'child', 'disabled'].includes(userProfile.type);
  }

  /**
   * 发送协助信号
   */
  async sendAssistanceSignal(userLocation, userProfile) {
    // TODO: 实现信号推送逻辑
    // 推送到管理后台
    
    const signal = {
      type: 'assistance_needed',
      userLocation,
      userProfile,
      timestamp: new Date(),
      message: `需要协助：${userProfile.type} 用户位于 ${userLocation.x}, ${userLocation.y}`
    };
    
    // 推送到后台
    // await this.pushToBackend(signal);
    
    console.log('协助信号已发送:', signal);
  }
}

module.exports = AIAgent;

