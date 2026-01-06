/**
 * 路径准确性和动态调整测试
 * 目标：动态调整准确率 > 90%
 */

const AIAgent = require('../path-planning/agent/AIAgent');
const DynamicPathUpdater = require('../path-planning/dynamic-updater/DynamicPathUpdater');
const ObstacleMap = require('../path-planning/obstacle-avoidance/ObstacleMap');

describe('路径准确性测试', () => {
  let aiAgent;
  let dynamicUpdater;
  let mockDigitalTwin;

  beforeEach(() => {
    mockDigitalTwin = {
      markers: {
        safetyExits: [
          { x: 100, y: 100, floor: 0, id: 'exit1' },
          { x: 200, y: 200, floor: 0, id: 'exit2' }
        ],
        accessibleChannels: []
      }
    };

    const PathPlanner = require('../path-planning/core/PathPlanner');
    const navMesh = { nodes: [], edges: [] };
    const obstacleMap = new ObstacleMap();
    const pathPlanner = new PathPlanner(navMesh, obstacleMap);
    
    aiAgent = new AIAgent(pathPlanner, mockDigitalTwin);
    dynamicUpdater = new DynamicPathUpdater(aiAgent, 500);
  });

  test('路径应避开火点区域', async () => {
    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 30 };
    const userLocation = { x: 0, y: 0, floor: 0 };

    const result = await aiAgent.planEscapeRoute(firePoint, userLocation);

    // 验证路径不经过火点区域
    const pathInFireZone = result.path.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.x - firePoint.x, 2) + 
        Math.pow(node.y - firePoint.y, 2)
      );
      return distance < firePoint.spreadRadius;
    });

    expect(pathInFireZone).toBe(false);
    expect(result.path.length).toBeGreaterThan(0);
  });

  test('路径应到达安全出口', async () => {
    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 20 };
    const userLocation = { x: 0, y: 0, floor: 0 };

    const result = await aiAgent.planEscapeRoute(firePoint, userLocation);

    // 验证路径终点是安全出口
    const lastNode = result.path[result.path.length - 1];
    const reachedExit = mockDigitalTwin.markers.safetyExits.some(exit => {
      const distance = Math.sqrt(
        Math.pow(lastNode.x - exit.x, 2) + 
        Math.pow(lastNode.y - exit.y, 2)
      );
      return distance < 5; // 5米范围内认为到达
    });

    expect(reachedExit).toBe(true);
  });

  test('路径应避开拥堵路段', async () => {
    // TODO: 实现拥堵路段避让测试
    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 20 };
    const userLocation = { x: 0, y: 0, floor: 0 };

    const result = await aiAgent.planEscapeRoute(firePoint, userLocation);
    
    // 验证路径有效性
    expect(result.path.length).toBeGreaterThan(0);
  });
});

describe('动态调整准确率测试', () => {
  let dynamicUpdater;
  let pathUpdateCount = 0;
  let correctUpdates = 0;

  beforeEach(() => {
    const AIAgent = require('../path-planning/agent/AIAgent');
    const PathPlanner = require('../path-planning/core/PathPlanner');
    const ObstacleMap = require('../path-planning/obstacle-avoidance/ObstacleMap');
    
    const navMesh = { nodes: [], edges: [] };
    const obstacleMap = new ObstacleMap();
    const pathPlanner = new PathPlanner(navMesh, obstacleMap);
    const mockDigitalTwin = {
      markers: {
        safetyExits: [{ x: 100, y: 100, floor: 0 }],
        accessibleChannels: []
      }
    };
    const aiAgent = new AIAgent(pathPlanner, mockDigitalTwin);
    
    dynamicUpdater = new DynamicPathUpdater(aiAgent, 500);
    pathUpdateCount = 0;
    correctUpdates = 0;
  });

  test('动态调整准确率应 > 90%', async (done) => {
    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 20 };
    const userLocation = { x: 0, y: 0, floor: 0 };

    const onPathUpdate = (update) => {
      pathUpdateCount++;
      
      // 验证更新后的路径是否有效
      if (update.path && update.path.length > 0) {
        // 检查路径是否避开火点
        const pathValid = !update.path.some(node => {
          const distance = Math.sqrt(
            Math.pow(node.x - firePoint.x, 2) + 
            Math.pow(node.y - firePoint.y, 2)
          );
          return distance < firePoint.spreadRadius;
        });
        
        if (pathValid) {
          correctUpdates++;
        }
      }

      // 测试 10 次更新后计算准确率
      if (pathUpdateCount >= 10) {
        const accuracy = correctUpdates / pathUpdateCount;
        expect(accuracy).toBeGreaterThan(0.9); // > 90%
        dynamicUpdater.stopDynamicUpdate();
        done();
      }
    };

    dynamicUpdater.startDynamicUpdate(
      firePoint,
      userLocation,
      null,
      onPathUpdate
    );
  }, 10000); // 10秒超时

  test('路径更新应响应火点蔓延', async (done) => {
    let initialPath = null;
    let updatedPath = null;

    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 20 };
    const userLocation = { x: 0, y: 0, floor: 0 };

    const onPathUpdate = (update) => {
      if (!initialPath) {
        initialPath = update.path;
      } else if (!updatedPath && update.pathChanged) {
        updatedPath = update.path;
        
        // 验证路径确实发生了变化
        expect(updatedPath).not.toEqual(initialPath);
        dynamicUpdater.stopDynamicUpdate();
        done();
      }
    };

    dynamicUpdater.startDynamicUpdate(
      firePoint,
      userLocation,
      null,
      onPathUpdate
    );
  }, 10000);
});

