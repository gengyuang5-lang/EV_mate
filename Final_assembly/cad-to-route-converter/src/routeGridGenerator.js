/**
 * 路径网格生成器
 * 将CAD几何数据转换为路径规划算法可用的网格数据
 */

class RouteGridGenerator {
  /**
   * 生成路径规划网格
   * @param {Object} cadData - CAD解析后的数据
   * @param {Object} options - 选项
   * @returns {Object} 网格数据
   */
  generateGrid(cadData, options = {}) {
    const {
      gridSize = 1.0, // 网格大小（米）
      padding = 5.0,  // 边距（米）
    } = options;

    const bounds = cadData.bounds;
    const gridWidth = Math.ceil(bounds.width / gridSize) + padding * 2;
    const gridHeight = Math.ceil(bounds.height / gridSize) + padding * 2;
    
    // 创建网格
    const grid = this.createGrid(gridWidth, gridHeight);
    
    // 标记障碍物（墙体）
    this.markObstacles(grid, cadData.walls, bounds, gridSize, padding);
    
    // 标记出口
    const exitNodes = this.markExits(grid, cadData.exits, bounds, gridSize, padding);
    
    // 标记门（可通行区域）
    this.markDoors(grid, cadData.doors, bounds, gridSize, padding);
    
    // 生成节点和边
    const { nodes, edges } = this.generateGraph(grid, gridSize, bounds, padding);
    
    return {
      grid,
      nodes,
      edges,
      exits: exitNodes,
      bounds: {
        minX: bounds.minX - padding,
        minY: bounds.minY - padding,
        maxX: bounds.maxX + padding,
        maxY: bounds.maxY + padding,
        gridWidth,
        gridHeight,
        gridSize
      }
    };
  }

  /**
   * 创建空网格
   */
  createGrid(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = {
          type: 'walkable', // walkable, obstacle, door, exit
          x: x,
          y: y
        };
      }
    }
    return grid;
  }

  /**
   * 标记障碍物
   */
  markObstacles(grid, walls, bounds, gridSize, padding) {
    walls.forEach(wall => {
      const points = wall.type === 'line' 
        ? [wall.start, wall.end]
        : wall.points;
      
      // 将墙体线段转换为网格坐标
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = this.worldToGrid(points[i], bounds, gridSize, padding);
        const p2 = this.worldToGrid(points[i + 1], bounds, gridSize, padding);
        
        // 标记线段经过的所有网格点
        this.markLine(grid, p1, p2, 'obstacle');
      }
    });
  }

  /**
   * 标记出口
   */
  markExits(grid, exits, bounds, gridSize, padding) {
    const exitNodes = [];
    
    exits.forEach((exit, index) => {
      const gridPos = this.worldToGrid(exit.position, bounds, gridSize, padding);
      
      if (this.isValidGridPosition(grid, gridPos.x, gridPos.y)) {
        grid[gridPos.y][gridPos.x].type = 'exit';
        grid[gridPos.y][gridPos.x].exitId = `exit_${index + 1}`;
        
        exitNodes.push({
          id: `exit_${index + 1}`,
          x: exit.position.x,
          y: exit.position.y,
          gridX: gridPos.x,
          gridY: gridPos.y,
          label: exit.label || `Exit ${index + 1}`
        });
      }
    });
    
    return exitNodes;
  }

  /**
   * 标记门（可通行区域）
   */
  markDoors(grid, doors, bounds, gridSize, padding) {
    doors.forEach(door => {
      const gridPos = this.worldToGrid(
        door.center || door.position,
        bounds,
        gridSize,
        padding
      );
      
      // 门周围区域标记为可通行
      const radius = Math.ceil((door.radius || 1.0) / gridSize);
      this.markCircle(grid, gridPos, radius, 'door');
    });
  }

  /**
   * 生成图（节点和边）
   */
  generateGraph(grid, gridSize, bounds, padding) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();
    
    // 创建节点（只包含可通行区域）
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.type !== 'obstacle') {
          const worldPos = this.gridToWorld({ x, y }, bounds, gridSize, padding);
          const nodeId = `node_${x}_${y}`;
          
          nodes.push({
            id: nodeId,
            x: worldPos.x,
            y: worldPos.y,
            gridX: x,
            gridY: y,
            type: cell.type,
            floor: 1 // 默认楼层，可以后续扩展
          });
          
          nodeMap.set(`${x},${y}`, nodeId);
        }
      }
    }
    
    // 创建边（连接相邻的可通行节点）
    const directions = [
      [0, 1],   // 上
      [1, 0],   // 右
      [0, -1],  // 下
      [-1, 0],  // 左
      [1, 1],   // 右上
      [1, -1],  // 右下
      [-1, -1], // 左下
      [-1, 1]   // 左上
    ];
    
    nodes.forEach(node => {
      directions.forEach(([dx, dy]) => {
        const neighborX = node.gridX + dx;
        const neighborY = node.gridY + dy;
        const neighborKey = `${neighborX},${neighborY}`;
        
        if (nodeMap.has(neighborKey)) {
          const neighborId = nodeMap.get(neighborKey);
          const distance = Math.sqrt(dx * dx + dy * dy) * gridSize;
          
          edges.push({
            from: node.id,
            to: neighborId,
            distance: distance,
            width: gridSize * 0.8 // 估算通道宽度
          });
        }
      });
    });
    
    return { nodes, edges };
  }

  /**
   * 世界坐标转网格坐标
   */
  worldToGrid(worldPos, bounds, gridSize, padding) {
    return {
      x: Math.floor((worldPos.x - bounds.minX + padding) / gridSize),
      y: Math.floor((worldPos.y - bounds.minY + padding) / gridSize)
    };
  }

  /**
   * 网格坐标转世界坐标
   */
  gridToWorld(gridPos, bounds, gridSize, padding) {
    return {
      x: gridPos.x * gridSize + bounds.minX - padding,
      y: gridPos.y * gridSize + bounds.minY - padding
    };
  }

  /**
   * 标记线段
   */
  markLine(grid, p1, p2, type) {
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const sx = p1.x < p2.x ? 1 : -1;
    const sy = p1.y < p2.y ? 1 : -1;
    let err = dx - dy;
    
    let x = p1.x;
    let y = p1.y;
    
    while (true) {
      if (this.isValidGridPosition(grid, x, y)) {
        grid[y][x].type = type;
      }
      
      if (x === p2.x && y === p2.y) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * 标记圆形区域
   */
  markCircle(grid, center, radius, type) {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        const dist = Math.sqrt(
          Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
        );
        if (dist <= radius && this.isValidGridPosition(grid, x, y)) {
          grid[y][x].type = type;
        }
      }
    }
  }

  /**
   * 检查网格位置是否有效
   */
  isValidGridPosition(grid, x, y) {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
  }
}

module.exports = RouteGridGenerator;

