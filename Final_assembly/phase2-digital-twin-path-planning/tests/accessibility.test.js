/**
 * 无障碍标准合规性测试
 * 目标：弱势群体路径适配符合建筑无障碍设计标准
 */

const VulnerableGroupAdapter = require('../path-planning/vulnerable-group/VulnerableGroupAdapter');

describe('无障碍标准合规性测试', () => {
  let adapter;
  let mockDigitalTwin;
  let mockPathPlanner;

  beforeEach(() => {
    mockDigitalTwin = {
      markers: {
        accessibleChannels: [
          {
            id: 'ch1',
            x: 10, y: 10, floor: 0,
            width: 1.5, // 宽度 >= 1.2m
            slope: 0.03, // 坡度 <= 5%
            hasRamp: true,
            stepHeight: 0
          },
          {
            id: 'ch2',
            x: 20, y: 20, floor: 0,
            width: 1.8,
            slope: 0.02,
            hasRamp: true,
            stepHeight: 0
          }
        ]
      }
    };

    // TODO: 创建模拟的 PathPlanner
    mockPathPlanner = {
      calculatePath: jest.fn()
    };

    adapter = new VulnerableGroupAdapter(mockPathPlanner, mockDigitalTwin);
  });

  test('路径宽度应 >= 1.2 米', () => {
    const path = [
      { x: 0, y: 0, width: 1.5 },
      { x: 10, y: 10, width: 1.3 },
      { x: 20, y: 20, width: 1.2 }
    ];

    const validation = adapter.validateAccessiblePath(path);

    expect(validation.isValid).toBe(true);
    expect(validation.issues.filter(i => i.type === 'narrow_path').length).toBe(0);
  });

  test('路径坡度应 <= 5%', () => {
    const path = [
      { x: 0, y: 0, slope: 0.03 },
      { x: 10, y: 10, slope: 0.04 },
      { x: 20, y: 20, slope: 0.05 }
    ];

    const validation = adapter.validateAccessiblePath(path);

    expect(validation.isValid).toBe(true);
    expect(validation.issues.filter(i => i.type === 'steep_slope').length).toBe(0);
  });

  test('路径不应有超过 2cm 的台阶', () => {
    const path = [
      { x: 0, y: 0, hasSteps: false },
      { x: 10, y: 10, hasSteps: true, stepHeight: 0.01 }, // 1cm，符合标准
      { x: 20, y: 20, hasSteps: true, stepHeight: 0.02 }  // 2cm，符合标准
    ];

    const validation = adapter.validateAccessiblePath(path);

    expect(validation.isValid).toBe(true);
    expect(validation.issues.filter(i => i.type === 'high_steps').length).toBe(0);
  });

  test('应检测不符合标准的路径', () => {
    const path = [
      { x: 0, y: 0, width: 1.0, slope: 0.06, hasSteps: true, stepHeight: 0.03 }
    ];

    const validation = adapter.validateAccessiblePath(path);

    expect(validation.isValid).toBe(false);
    expect(validation.issues.length).toBeGreaterThan(0);
    
    // 检查具体问题
    const narrowPathIssues = validation.issues.filter(i => i.type === 'narrow_path');
    const steepSlopeIssues = validation.issues.filter(i => i.type === 'steep_slope');
    const highStepsIssues = validation.issues.filter(i => i.type === 'high_steps');
    
    expect(narrowPathIssues.length).toBeGreaterThan(0);
    expect(steepSlopeIssues.length).toBeGreaterThan(0);
    expect(highStepsIssues.length).toBeGreaterThan(0);
  });

  test('老人模式路径应优先选择无障碍通道', async () => {
    const start = { x: 0, y: 0, floor: 0 };
    const goal = { x: 100, y: 100, floor: 0 };
    const userProfile = { type: 'elderly' };

    mockPathPlanner.calculatePath.mockResolvedValue({
      path: [
        { x: 0, y: 0, floor: 0 },
        { x: 10, y: 10, floor: 0, accessible: true },
        { x: 20, y: 20, floor: 0, accessible: true },
        { x: 100, y: 100, floor: 0 }
      ],
      distance: 150,
      responseTime: 200
    });

    const result = await adapter.planAccessiblePath(start, goal, userProfile);

    expect(result.accessible).toBe(true);
    expect(result.speedMultiplier).toBe(0.7); // 速度降低 30%
    expect(result.assistanceNeeded).toBe(true);
    expect(result.validation.isValid).toBe(true);
  });

  test('残障人士模式路径应符合无障碍标准', async () => {
    const start = { x: 0, y: 0, floor: 0 };
    const goal = { x: 100, y: 100, floor: 0 };
    const userProfile = { type: 'disabled' };

    mockPathPlanner.calculatePath.mockResolvedValue({
      path: mockDigitalTwin.markers.accessibleChannels.map(ch => ({
        x: ch.x,
        y: ch.y,
        floor: ch.floor,
        width: ch.width,
        slope: ch.slope,
        accessible: true
      })),
      distance: 200,
      responseTime: 300
    });

    const result = await adapter.planAccessiblePath(start, goal, userProfile);

    expect(result.accessible).toBe(true);
    expect(result.validation.compliance).toBe(1.0); // 100% 合规
  });

  test('应识别路径中的障碍点', () => {
    const path = [
      { x: 0, y: 0, slope: 0.03, width: 1.5 },
      { x: 10, y: 10, slope: 0.08, width: 1.0 }, // 陡坡 + 窄道
      { x: 20, y: 20, slope: 0.02, width: 1.8 }
    ];

    const obstacles = adapter.identifyObstacles(path);

    expect(obstacles.length).toBeGreaterThan(0);
    expect(obstacles.some(o => o.type === 'steep_slope')).toBe(true);
    expect(obstacles.some(o => o.type === 'narrow_path')).toBe(true);
  });

  test('应计算路径难度评分', () => {
    const easyPath = [
      { x: 0, y: 0, slope: 0.01, width: 2.0 },
      { x: 10, y: 10, slope: 0.02, width: 1.8 }
    ];

    const hardPath = [
      { x: 0, y: 0, slope: 0.08, width: 1.0 },
      { x: 10, y: 10, slope: 0.10, width: 0.8 }
    ];

    const easyDifficulty = adapter.calculatePathDifficulty(easyPath);
    const hardDifficulty = adapter.calculatePathDifficulty(hardPath);

    expect(easyDifficulty).toBeLessThan(hardDifficulty);
    expect(easyDifficulty).toBeGreaterThanOrEqual(0);
    expect(hardDifficulty).toBeLessThanOrEqual(1);
  });
});

