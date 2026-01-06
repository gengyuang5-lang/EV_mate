/**
 * 格式转换器
 * 将网格数据转换为不同格式（JSON、GeoJSON等）
 */

class FormatConverter {
  /**
   * 转换为路径规划算法格式（JSON）
   */
  toRoutePlanningFormat(gridData) {
    return {
      metadata: {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        gridSize: gridData.bounds.gridSize,
        bounds: gridData.bounds
      },
      nodes: gridData.nodes,
      edges: gridData.edges,
      exits: gridData.exits.map(exit => ({
        id: exit.id,
        x: exit.x,
        y: exit.y,
        floor: 1,
        label: exit.label
      })),
      obstacles: this.extractObstacles(gridData.grid, gridData.bounds)
    };
  }

  /**
   * 转换为GeoJSON格式（用于地图显示）
   */
  toGeoJSON(gridData, options = {}) {
    const features = [];
    
    // 添加房间/区域
    const rooms = this.extractRooms(gridData.grid, gridData.bounds);
    rooms.forEach((room, index) => {
      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [room.coordinates]
        },
        properties: {
          type: "room",
          id: `room_${index + 1}`,
          area: room.area || 0
        }
      });
    });
    
    // 添加障碍物（墙体）
    const obstacles = this.extractObstacles(gridData.grid, gridData.bounds);
    obstacles.forEach((obstacle, index) => {
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: obstacle.coordinates
        },
        properties: {
          type: "wall",
          id: `wall_${index + 1}`
        }
      });
    });
    
    // 添加出口点
    gridData.exits.forEach(exit => {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [exit.x, exit.y]
        },
        properties: {
          type: "exit",
          id: exit.id,
          label: exit.label
        }
      });
    });
    
    // 添加路径网络（可选）
    if (options.includeRoutes) {
      const routes = this.extractRoutes(gridData.edges, gridData.nodes);
      routes.forEach((route, index) => {
        features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: route.coordinates
          },
          properties: {
            type: "route",
            id: `route_${index + 1}`,
            distance: route.distance
          }
        });
      });
    }
    
    return {
      type: "FeatureCollection",
      features: features,
      metadata: {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        bounds: gridData.bounds
      }
    };
  }

  /**
   * 转换为移动应用格式（简化的JSON）
   */
  toMobileAppFormat(gridData) {
    return {
      floors: [{
        floor: 1,
        name: "Floor 1",
        bounds: gridData.bounds,
        exits: gridData.exits.map(exit => ({
          id: exit.id,
          latitude: exit.y, // 注意：需要根据实际坐标系统转换
          longitude: exit.x,
          name: exit.label
        })),
        rooms: this.extractRoomsForMobile(gridData.grid, gridData.bounds),
        routes: this.extractRoutesForMobile(gridData.edges, gridData.nodes)
      }]
    };
  }

  /**
   * 提取障碍物
   */
  extractObstacles(grid, bounds) {
    const obstacles = [];
    const visited = new Set();
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x].type === 'obstacle' && !visited.has(`${x},${y}`)) {
          // 找到连续的障碍物区域
          const coordinates = this.traceObstacle(grid, x, y, bounds, visited);
          if (coordinates.length > 0) {
            obstacles.push({
              type: "wall",
              coordinates: coordinates
            });
          }
        }
      }
    }
    
    return obstacles;
  }

  /**
   * 追踪障碍物轮廓
   */
  traceObstacle(grid, startX, startY, bounds, visited) {
    const coordinates = [];
    const stack = [[startX, startY]];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (!this.isValidGridPosition(grid, x, y)) continue;
      if (grid[y][x].type !== 'obstacle') continue;
      
      visited.add(key);
      const worldPos = this.gridToWorld({ x, y }, bounds);
      coordinates.push([worldPos.x, worldPos.y]);
      
      // 添加邻居
      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
      neighbors.forEach(([nx, ny]) => {
        if (!visited.has(`${nx},${ny}`)) {
          stack.push([nx, ny]);
        }
      });
    }
    
    return coordinates;
  }

  /**
   * 提取房间
   */
  extractRooms(grid, bounds) {
    // 简化实现：将可通行区域分组为房间
    const rooms = [];
    const visited = new Set();
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x].type === 'walkable' && !visited.has(`${x},${y}`)) {
          const room = this.traceRoom(grid, x, y, bounds, visited);
          if (room.coordinates.length > 0) {
            rooms.push(room);
          }
        }
      }
    }
    
    return rooms;
  }

  /**
   * 追踪房间边界
   */
  traceRoom(grid, startX, startY, bounds, visited) {
    const coordinates = [];
    const stack = [[startX, startY]];
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (!this.isValidGridPosition(grid, x, y)) continue;
      if (grid[y][x].type !== 'walkable' && grid[y][x].type !== 'door') continue;
      
      visited.add(key);
      const worldPos = this.gridToWorld({ x, y }, bounds);
      coordinates.push([worldPos.x, worldPos.y]);
      
      minX = Math.min(minX, worldPos.x);
      minY = Math.min(minY, worldPos.y);
      maxX = Math.max(maxX, worldPos.x);
      maxY = Math.max(maxY, worldPos.y);
      
      // 添加邻居
      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
      neighbors.forEach(([nx, ny]) => {
        if (!visited.has(`${nx},${ny}`)) {
          stack.push([nx, ny]);
        }
      });
    }
    
    // 创建矩形边界
    const roomCoords = [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
      [minX, minY]
    ];
    
    return {
      coordinates: roomCoords,
      area: (maxX - minX) * (maxY - minY)
    };
  }

  /**
   * 提取路径网络
   */
  extractRoutes(edges, nodes) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const routes = [];
    
    // 只提取主要路径（简化）
    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      
      if (fromNode && toNode) {
        routes.push({
          coordinates: [
            [fromNode.x, fromNode.y],
            [toNode.x, toNode.y]
          ],
          distance: edge.distance
        });
      }
    });
    
    return routes;
  }

  /**
   * 提取房间（移动应用格式）
   */
  extractRoomsForMobile(grid, bounds) {
    const rooms = this.extractRooms(grid, bounds);
    return rooms.map((room, index) => ({
      id: `room_${index + 1}`,
      coordinates: room.coordinates,
      area: room.area
    }));
  }

  /**
   * 提取路径（移动应用格式）
   */
  extractRoutesForMobile(edges, nodes) {
    // 返回简化的路径数据
    return {
      nodes: nodes.slice(0, 100), // 限制节点数量
      edges: edges.slice(0, 200)  // 限制边数量
    };
  }

  /**
   * 网格坐标转世界坐标
   */
  gridToWorld(gridPos, bounds) {
    return {
      x: gridPos.x * bounds.gridSize + bounds.minX,
      y: gridPos.y * bounds.gridSize + bounds.minY
    };
  }

  /**
   * 检查网格位置是否有效
   */
  isValidGridPosition(grid, x, y) {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
  }
}

module.exports = FormatConverter;

