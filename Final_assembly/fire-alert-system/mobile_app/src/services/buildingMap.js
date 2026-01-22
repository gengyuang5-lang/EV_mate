/**
 * 简化的建筑平面图数据服务
 * 创建一个简单的矩形建筑，包含走廊和出口
 */

/**
 * 简化的建筑结构：
 * - 一个简单的矩形建筑
 * - 一条主走廊
 * - 两个出口（前门和后门）
 */
export const BUILDING_MAP = {
  // 简化的节点定义（相对坐标，单位：米）
  nodes: [
    // 走廊节点（从左上到右下）
    { id: 'node-1', x: 0, y: 0, type: 'corridor', name: '走廊起点' },
    { id: 'node-2', x: 0, y: 20, type: 'corridor', name: '走廊中段' },
    { id: 'node-3', x: 0, y: 40, type: 'corridor', name: '走廊末端' },
    
    // 出口节点
    { id: 'exit-1', x: 0, y: 0, type: 'exit', name: '前门出口' },
    { id: 'exit-2', x: 0, y: 40, type: 'exit', name: '后门出口' },
  ],

  // 连接关系
  connections: [
    { from: 'node-1', to: 'node-2', distance: 20 },
    { from: 'node-2', to: 'node-3', distance: 20 },
    { from: 'node-1', to: 'exit-1', distance: 0 },
    { from: 'node-3', to: 'exit-2', distance: 0 },
  ]
};

/**
 * 将相对坐标转换为GPS坐标
 */
export function convertToGPS(x, y, baseLocation = { latitude: 37.421998, longitude: -122.084000 }) {
  // 1单位 = 1米
  // 纬度：1度 ≈ 111,000米
  // 经度：1度 ≈ 111,000 * cos(纬度)米
  const latOffset = y / 111000;
  const lngOffset = x / (111000 * Math.cos(baseLocation.latitude * Math.PI / 180));
  
  return {
    latitude: baseLocation.latitude + latOffset,
    longitude: baseLocation.longitude + lngOffset
  };
}

/**
 * 计算两点间距离（米）
 */
function calculateDistance(point1, point2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) *
            Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * 获取最近的出口
 */
export function getNearestExitFromMap(currentLocation, baseLocation) {
  const exits = [
    { id: 'exit-1', x: 0, y: 0, name: '前门出口' },
    { id: 'exit-2', x: 0, y: 40, name: '后门出口' }
  ].map(exit => ({
    ...exit,
    ...convertToGPS(exit.x, exit.y, baseLocation)
  }));

  let nearest = exits[0];
  let minDistance = calculateDistance(currentLocation, nearest);

  exits.forEach(exit => {
    const distance = calculateDistance(currentLocation, exit);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = exit;
    }
  });

  return {
    ...nearest,
    distance: minDistance
  };
}

/**
 * 根据当前位置找到最近的节点
 */
export function findNearestNode(currentLocation, baseLocation) {
  const nodes = BUILDING_MAP.nodes.map(node => ({
    ...node,
    ...convertToGPS(node.x, node.y, baseLocation)
  }));

  let nearest = nodes[0];
  let minDistance = calculateDistance(currentLocation, nearest);

  nodes.forEach(node => {
    const distance = calculateDistance(currentLocation, node);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = node;
    }
  });

  return nearest;
}

/**
 * 简化的路径规划（使用Dijkstra算法）
 */
function findPath(startNodeId, goalNodeId, baseLocation) {
  const nodes = BUILDING_MAP.nodes.map(node => ({
    ...node,
    ...convertToGPS(node.x, node.y, baseLocation)
  }));

  const startNode = nodes.find(n => n.id === startNodeId);
  const goalNode = nodes.find(n => n.id === goalNodeId);

  if (!startNode || !goalNode) {
    return null;
  }

  // 简化的Dijkstra算法
  const distances = {};
  const previous = {};
  const unvisited = [...nodes];
  
  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
  });

  while (unvisited.length > 0) {
    // 找到距离最小的未访问节点
    const current = unvisited.reduce((min, node) => 
      distances[node.id] < distances[min.id] ? node : min
    );

    if (current.id === goalNodeId) {
      // 重建路径
      const path = [];
      let node = goalNode;
      while (node) {
        path.unshift(node);
        node = previous[node.id] ? nodes.find(n => n.id === previous[node.id]) : null;
      }
      return path;
    }

    unvisited.splice(unvisited.indexOf(current), 1);

    // 检查所有连接
    const neighbors = BUILDING_MAP.connections
      .filter(conn => conn.from === current.id)
      .map(conn => nodes.find(n => n.id === conn.to))
      .filter(n => n && unvisited.includes(n));

    neighbors.forEach(neighbor => {
      const alt = distances[current.id] + calculateDistance(current, neighbor);
      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = current.id;
      }
    });
  }

  return null;
}

/**
 * 生成完整的逃生路线（简化版）
 */
export function generateEscapeRoute(currentLocation, baseLocation) {
  try {
    // 找到最近的节点
    const startNode = findNearestNode(currentLocation, baseLocation);
    
    // 获取最近的出口
    const exit = getNearestExitFromMap(currentLocation, baseLocation);
    
    // 找到出口对应的节点
    const exitNode = BUILDING_MAP.nodes.find(n => 
      n.type === 'exit' && n.id === exit.id
    );

    if (!exitNode) {
      // 如果找不到出口节点，创建简单路径
      const exitGPS = convertToGPS(exit.x, exit.y, baseLocation);
      const distance = calculateDistance(currentLocation, exitGPS);
      
      return {
        success: true,
        path: [currentLocation, exitGPS],
        distance: distance,
        estimatedTime: Math.ceil(distance / 1.4),
        exit: exit
      };
    }

    // 计算路径
    const path = findPath(startNode.id, exitNode.id, baseLocation);
    
    if (!path || path.length === 0) {
      // 如果路径规划失败，使用直线路径
      const exitGPS = convertToGPS(exit.x, exit.y, baseLocation);
      const distance = calculateDistance(currentLocation, exitGPS);
      
      return {
        success: true,
        path: [currentLocation, exitGPS],
        distance: distance,
        estimatedTime: Math.ceil(distance / 1.4),
        exit: exit
      };
    }

    // 在路径前添加当前位置
    const fullPath = [currentLocation, ...path.map(node => ({
      latitude: node.latitude,
      longitude: node.longitude
    }))];

    // 计算总距离
    let totalDistance = 0;
    for (let i = 1; i < fullPath.length; i++) {
      totalDistance += calculateDistance(fullPath[i - 1], fullPath[i]);
    }

    return {
      success: true,
      path: fullPath,
      distance: totalDistance,
      estimatedTime: Math.ceil(totalDistance / 1.4), // 假设步行速度1.4m/s
      exit: exit
    };
  } catch (error) {
    console.error('生成逃生路线错误:', error);
    return null;
  }
}

export default BUILDING_MAP;
