/**
 * 动态路径更新模块
 * 每 500 毫秒更新一次路径，响应环境变化
 */

class DynamicPathUpdater {
  constructor(aiAgent, updateInterval = 500) {
    this.aiAgent = aiAgent;
    this.updateInterval = updateInterval; // 更新间隔（毫秒）
    this.updateTimer = null;
    this.isUpdating = false;
    this.currentPath = null;
    this.pathHistory = []; // 路径历史记录
  }

  /**
   * 开始动态路径更新
   * @param {Object} firePoint - 火点信息
   * @param {Object} userLocation - 用户当前位置
   * @param {Object} userProfile - 用户画像
   * @param {Function} onPathUpdate - 路径更新回调
   */
  startDynamicUpdate(firePoint, userLocation, userProfile, onPathUpdate) {
    // 停止之前的更新
    this.stopDynamicUpdate();
    
    // 初始路径规划
    this.updatePath(firePoint, userLocation, userProfile, onPathUpdate);
    
    // 设置定时更新
    this.updateTimer = setInterval(() => {
      if (!this.isUpdating) {
        this.updatePath(firePoint, userLocation, userProfile, onPathUpdate);
      }
    }, this.updateInterval);
  }

  /**
   * 停止动态路径更新
   */
  stopDynamicUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.isUpdating = false;
  }

  /**
   * 更新路径
   */
  async updatePath(firePoint, userLocation, userProfile, onPathUpdate) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // 更新火点蔓延信息
      const updatedFirePoint = await this.updateFireSpread(firePoint);
      
      // 更新拥堵信息
      const congestionZones = await this.updateCongestionZones(userLocation);
      
      // 重新规划路径
      const pathResult = await this.aiAgent.planEscapeRoute(
        updatedFirePoint,
        userLocation,
        userProfile
      );
      
      // 检查路径是否发生变化
      const pathChanged = this.hasPathChanged(pathResult.path);
      
      if (pathChanged) {
        this.currentPath = pathResult.path;
        this.pathHistory.push({
          path: pathResult.path,
          timestamp: new Date(),
          reason: 'environment_change'
        });
        
        // 触发回调
        if (onPathUpdate) {
          onPathUpdate({
            path: pathResult.path,
            color: 'orange', // 橙色引导路径
            timestamp: new Date(),
            pathChanged: true
          });
        }
      }
    } catch (error) {
      console.error('路径更新失败:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 更新火点蔓延信息
   */
  async updateFireSpread(firePoint) {
    // TODO: 从火灾报警系统获取最新的火点蔓延信息
    // 模拟火点蔓延
    return {
      ...firePoint,
      spreadRadius: firePoint.spreadRadius * 1.1, // 蔓延半径增加
      intensity: firePoint.intensity || 1.0
    };
  }

  /**
   * 更新拥堵区域信息
   */
  async updateCongestionZones(userLocation) {
    // TODO: 从传感器或用户位置数据获取拥堵信息
    return [];
  }

  /**
   * 检查路径是否发生变化
   */
  hasPathChanged(newPath) {
    if (!this.currentPath) return true;
    
    // 简单比较：检查关键节点是否变化
    if (newPath.length !== this.currentPath.length) return true;
    
    // 检查前几个关键节点
    const keyNodes = Math.min(3, newPath.length);
    for (let i = 0; i < keyNodes; i++) {
      if (!this.isSameNode(newPath[i], this.currentPath[i])) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 判断是否为同一节点
   */
  isSameNode(nodeA, nodeB) {
    if (!nodeA || !nodeB) return false;
    const threshold = 1.0; // 1米阈值
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    return dx < threshold && dy < threshold;
  }

  /**
   * 获取当前路径
   */
  getCurrentPath() {
    return this.currentPath;
  }

  /**
   * 获取路径历史
   */
  getPathHistory() {
    return this.pathHistory;
  }
}

module.exports = DynamicPathUpdater;

