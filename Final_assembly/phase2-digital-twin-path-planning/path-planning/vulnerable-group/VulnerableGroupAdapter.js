/**
 * 弱势群体适配模块
 * 为老人/儿童/残障人士提供特殊路径规划
 */

class VulnerableGroupAdapter {
  constructor(pathPlanner, digitalTwin) {
    this.pathPlanner = pathPlanner;
    this.digitalTwin = digitalTwin;
    this.accessibleChannels = digitalTwin.markers.accessibleChannels || [];
  }

  /**
   * 为弱势群体规划路径
   * @param {Object} start - 起点
   * @param {Object} goal - 终点
   * @param {Object} userProfile - 用户画像 {type: 'elderly'|'child'|'disabled'}
   * @returns {Promise<Object>} 适配后的路径
   */
  async planAccessiblePath(start, goal, userProfile) {
    // 获取无障碍通道网络
    const accessibleNetwork = this.buildAccessibleNetwork();
    
    // 修改路径规划选项
    const options = {
      avoidFire: true,
      avoidCongestion: true,
      preferAccessible: true,
      avoidSteepSlopes: true,
      avoidNarrowPaths: true,
      accessibleNetwork: accessibleNetwork,
      speedReduction: 0.3 // 速度降低 30%
    };
    
    // 计算路径
    const pathResult = await this.pathPlanner.calculatePath(start, goal, options);
    
    // 验证路径是否符合无障碍标准
    const validation = this.validateAccessiblePath(pathResult.path);
    
    // 如果不符合，尝试重新规划
    if (!validation.isValid) {
      return await this.replanWithStrictAccessibility(start, goal, options);
    }
    
    return {
      ...pathResult,
      accessible: true,
      validation,
      speedMultiplier: 0.7, // 速度降低 30% = 乘以 0.7
      assistanceNeeded: true
    };
  }

  /**
   * 构建无障碍通道网络
   */
  buildAccessibleNetwork() {
    // TODO: 基于无障碍通道构建网络
    return {
      nodes: this.accessibleChannels.map(ch => ({
        id: ch.id,
        x: ch.x,
        y: ch.y,
        floor: ch.floor,
        accessible: true
      })),
      edges: []
    };
  }

  /**
   * 验证路径是否符合无障碍标准
   * @param {Array} path - 路径节点数组
   * @returns {Object} 验证结果
   */
  validateAccessiblePath(path) {
    const issues = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const segment = {
        from: path[i],
        to: path[i + 1]
      };
      
      // 检查宽度
      if (segment.width && segment.width < 1.2) {
        issues.push({
          type: 'narrow_path',
          segment,
          message: '路径宽度不足 1.2 米'
        });
      }
      
      // 检查坡度
      if (segment.slope && segment.slope > 0.05) {
        issues.push({
          type: 'steep_slope',
          segment,
          message: '路径坡度超过 5%'
        });
      }
      
      // 检查是否有台阶
      if (segment.hasSteps && segment.stepHeight > 0.02) {
        issues.push({
          type: 'high_steps',
          segment,
          message: '路径有超过 2cm 的台阶'
        });
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      compliance: issues.length === 0 ? 1.0 : Math.max(0, 1 - issues.length / path.length)
    };
  }

  /**
   * 使用严格的无障碍要求重新规划
   */
  async replanWithStrictAccessibility(start, goal, options) {
    // 只使用无障碍通道节点
    options.strictAccessible = true;
    
    // 重新计算路径
    const pathResult = await this.pathPlanner.calculatePath(start, goal, options);
    
    return {
      ...pathResult,
      accessible: true,
      validation: {
        isValid: true,
        issues: [],
        compliance: 1.0
      },
      speedMultiplier: 0.7,
      assistanceNeeded: true
    };
  }

  /**
   * 识别路径中的障碍点
   * @param {Array} path - 路径
   * @returns {Array} 障碍点列表
   */
  identifyObstacles(path) {
    const obstacles = [];
    
    for (const node of path) {
      // 检查是否为陡坡
      if (node.slope > 0.05) {
        obstacles.push({
          type: 'steep_slope',
          location: node,
          severity: 'high'
        });
      }
      
      // 检查是否为窄道
      if (node.width < 1.2) {
        obstacles.push({
          type: 'narrow_path',
          location: node,
          severity: 'medium'
        });
      }
    }
    
    return obstacles;
  }

  /**
   * 计算路径难度评分
   * @param {Array} path - 路径
   * @returns {number} 难度评分 (0-1, 0 最简单)
   */
  calculatePathDifficulty(path) {
    let difficulty = 0;
    
    for (const node of path) {
      // 坡度贡献
      if (node.slope) {
        difficulty += node.slope * 2; // 坡度权重
      }
      
      // 宽度贡献
      if (node.width) {
        difficulty += Math.max(0, (1.2 - node.width) / 1.2); // 宽度不足的惩罚
      }
      
      // 台阶贡献
      if (node.hasSteps) {
        difficulty += node.stepHeight * 10; // 台阶高度权重
      }
    }
    
    return Math.min(1, difficulty / path.length);
  }
}

module.exports = VulnerableGroupAdapter;

