/**
 * 响应时间测试
 * 目标：路径规划响应时间 < 1 秒
 */

const PathPlanner = require('../path-planning/core/PathPlanner');
const ObstacleMap = require('../path-planning/obstacle-avoidance/ObstacleMap');

describe('路径规划响应时间测试', () => {
  let pathPlanner;
  let obstacleMap;

  beforeEach(() => {
    obstacleMap = new ObstacleMap();
    // TODO: 初始化导航网格
    const navMesh = {
      nodes: [],
      edges: []
    };
    pathPlanner = new PathPlanner(navMesh, obstacleMap);
  });

  test('基础路径规划响应时间应 < 1 秒', async () => {
    const start = { x: 0, y: 0, floor: 0 };
    const goal = { x: 100, y: 100, floor: 0 };

    const startTime = Date.now();
    const result = await pathPlanner.calculatePath(start, goal);
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(1000); // < 1 秒
    expect(result.responseTime).toBeLessThan(1000);
  });

  test('复杂环境下的响应时间应 < 1 秒', async () => {
    // 添加多个火点
    obstacleMap.updateFireZone({ x: 50, y: 50, floor: 0, spreadRadius: 20 });
    obstacleMap.updateFireZone({ x: 150, y: 150, floor: 0, spreadRadius: 15 });
    
    // 添加拥堵区域
    obstacleMap.updateCongestionZones([
      {
        polygon: [
          { x: 80, y: 80 },
          { x: 120, y: 80 },
          { x: 120, y: 120 },
          { x: 80, y: 120 }
        ],
        severity: 'high'
      }
    ]);

    const start = { x: 0, y: 0, floor: 0 };
    const goal = { x: 200, y: 200, floor: 0 };

    const startTime = Date.now();
    const result = await pathPlanner.calculatePath(start, goal);
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(1000);
  });

  test('多楼层路径规划响应时间应 < 1 秒', async () => {
    const start = { x: 0, y: 0, floor: 0 };
    const goal = { x: 100, y: 100, floor: 2 }; // 不同楼层

    const startTime = Date.now();
    const result = await pathPlanner.calculatePath(start, goal);
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(1000);
  });

  test('批量测试响应时间', async () => {
    const testCases = [
      { start: { x: 0, y: 0, floor: 0 }, goal: { x: 50, y: 50, floor: 0 } },
      { start: { x: 10, y: 10, floor: 0 }, goal: { x: 150, y: 150, floor: 0 } },
      { start: { x: 20, y: 20, floor: 1 }, goal: { x: 200, y: 200, floor: 1 } },
    ];

    const results = [];
    
    for (const testCase of testCases) {
      const startTime = Date.now();
      await pathPlanner.calculatePath(testCase.start, testCase.goal);
      const endTime = Date.now();
      
      results.push(endTime - startTime);
    }

    const avgResponseTime = results.reduce((a, b) => a + b, 0) / results.length;
    const maxResponseTime = Math.max(...results);

    expect(avgResponseTime).toBeLessThan(1000);
    expect(maxResponseTime).toBeLessThan(1000);
  });
});

