/**
 * 使用示例
 * 展示如何使用数字孪生和路径规划系统
 */

const DigitalTwinBuilder = require('../digital-twin/model-builder/DigitalTwinBuilder');
const CADImporter = require('../digital-twin/cad-importer/CADImporter');
const ScanProcessor = require('../digital-twin/scan-processor/ScanProcessor');
const PathPlanner = require('../path-planning/core/PathPlanner');
const AIAgent = require('../path-planning/agent/AIAgent');
const DynamicPathUpdater = require('../path-planning/dynamic-updater/DynamicPathUpdater');
const VulnerableGroupAdapter = require('../path-planning/vulnerable-group/VulnerableGroupAdapter');
const ObstacleMap = require('../path-planning/obstacle-avoidance/ObstacleMap');

/**
 * 示例 1：构建数字孪生模型
 */
async function buildDigitalTwinExample() {
  console.log('=== 构建数字孪生模型 ===');
  
  // 1. 导入 CAD 图纸
  const cadData = await CADImporter.import('building.dwg', 'dwg');
  console.log('CAD 数据导入完成');
  
  // 2. 处理现场扫描数据
  const scanData = await ScanProcessor.processPointCloud('scan_data.ply');
  console.log('扫描数据处理完成');
  
  // 3. 数据融合
  const fusedData = await ScanProcessor.fuseData(cadData, scanData);
  console.log('数据融合完成');
  
  // 4. 构建数字孪生模型
  const digitalTwin = await DigitalTwinBuilder.build({
    cadData,
    scanData: fusedData,
    focusOnChannels: true // 重点保证通道准确性
  });
  
  console.log('数字孪生模型构建完成:', {
    floorCount: digitalTwin.metadata.floorCount,
    channelCount: digitalTwin.metadata.channelCount,
    exitCount: digitalTwin.metadata.exitCount
  });
  
  return digitalTwin;
}

/**
 * 示例 2：基础路径规划
 */
async function basicPathPlanningExample(digitalTwin) {
  console.log('\n=== 基础路径规划 ===');
  
  // 初始化路径规划器
  const navMesh = digitalTwin.navMesh;
  const obstacleMap = new ObstacleMap();
  const pathPlanner = new PathPlanner(navMesh, obstacleMap);
  
  // 火点信息
  const firePoint = {
    x: 50,
    y: 50,
    floor: 0,
    spreadRadius: 30,
    intensity: 1.0
  };
  
  // 更新障碍物地图
  obstacleMap.updateFireZone(firePoint);
  
  // 用户位置
  const userLocation = { x: 0, y: 0, floor: 0 };
  
  // 创建 AI Agent
  const aiAgent = new AIAgent(pathPlanner, digitalTwin);
  
  // 规划逃生路径
  const result = await aiAgent.planEscapeRoute(firePoint, userLocation);
  
  console.log('路径规划完成:', {
    pathLength: result.path.length,
    distance: result.distance,
    responseTime: result.responseTime,
    exit: result.exit
  });
  
  return { aiAgent, pathPlanner, obstacleMap };
}

/**
 * 示例 3：动态路径更新
 */
function dynamicPathUpdateExample(aiAgent, firePoint, userLocation) {
  console.log('\n=== 动态路径更新 ===');
  
  const dynamicUpdater = new DynamicPathUpdater(aiAgent, 500); // 500ms 更新
  
  // 路径更新回调
  const onPathUpdate = (update) => {
    console.log('路径已更新:', {
      timestamp: update.timestamp,
      pathChanged: update.pathChanged,
      pathLength: update.path.length,
      color: update.color // 橙色引导路径
    });
  };
  
  // 开始动态更新
  dynamicUpdater.startDynamicUpdate(
    firePoint,
    userLocation,
    null, // 普通用户
    onPathUpdate
  );
  
  // 模拟运行 5 秒
  setTimeout(() => {
    dynamicUpdater.stopDynamicUpdate();
    console.log('动态路径更新已停止');
  }, 5000);
}

/**
 * 示例 4：弱势群体适配
 */
async function vulnerableGroupExample(digitalTwin, pathPlanner, obstacleMap) {
  console.log('\n=== 弱势群体适配 ===');
  
  // 创建弱势群体适配器
  const adapter = new VulnerableGroupAdapter(pathPlanner, digitalTwin);
  
  // 用户画像：老人
  const userProfile = { type: 'elderly' };
  
  const start = { x: 0, y: 0, floor: 0 };
  const goal = { x: 100, y: 100, floor: 0 };
  
  // 规划无障碍路径
  const result = await adapter.planAccessiblePath(start, goal, userProfile);
  
  console.log('弱势群体路径规划完成:', {
    accessible: result.accessible,
    speedMultiplier: result.speedMultiplier, // 0.7 (速度降低 30%)
    assistanceNeeded: result.assistanceNeeded,
    validation: {
      isValid: result.validation.isValid,
      compliance: result.validation.compliance
    }
  });
  
  // 识别路径中的障碍点
  const obstacles = adapter.identifyObstacles(result.path);
  if (obstacles.length > 0) {
    console.log('检测到障碍点:', obstacles);
  }
  
  // 计算路径难度
  const difficulty = adapter.calculatePathDifficulty(result.path);
  console.log('路径难度评分:', difficulty);
}

/**
 * 主函数：运行所有示例
 */
async function main() {
  try {
    // 1. 构建数字孪生模型
    const digitalTwin = await buildDigitalTwinExample();
    
    // 2. 基础路径规划
    const { aiAgent, pathPlanner, obstacleMap } = await basicPathPlanningExample(digitalTwin);
    
    // 3. 动态路径更新
    const firePoint = { x: 50, y: 50, floor: 0, spreadRadius: 30 };
    const userLocation = { x: 0, y: 0, floor: 0 };
    dynamicPathUpdateExample(aiAgent, firePoint, userLocation);
    
    // 4. 弱势群体适配
    await vulnerableGroupExample(digitalTwin, pathPlanner, obstacleMap);
    
  } catch (error) {
    console.error('示例运行出错:', error);
  }
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  main();
}

module.exports = {
  buildDigitalTwinExample,
  basicPathPlanningExample,
  dynamicPathUpdateExample,
  vulnerableGroupExample
};

