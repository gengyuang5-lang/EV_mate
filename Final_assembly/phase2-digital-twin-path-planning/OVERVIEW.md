# 阶段 2：数字孪生与路径规划 - 项目概览

## 📁 项目结构总览

```
phase2-digital-twin-path-planning/
│
├── 📄 README.md                    # 项目主文档
├── 📄 PROJECT_STRUCTURE.md         # 详细结构说明
├── 📄 OVERVIEW.md                  # 项目概览（本文件）
├── 📄 package.json                 # 项目配置
├── 📄 .gitignore                   # Git 配置
│
├── 🏗️ digital-twin/               # 数字孪生模型模块
│   ├── 📄 README.md
│   ├── 📦 cad-importer/
│   │   └── CADImporter.js         # CAD 文件导入（DWG/DXF/IFC）
│   ├── 📦 scan-processor/
│   │   └── ScanProcessor.js       # 点云/图像数据处理
│   ├── 📦 model-builder/
│   │   └── DigitalTwinBuilder.js  # 3D 模型构建器
│   └── 📦 channel-mapper/
│       └── ChannelMapper.js       # 通道网络映射
│
├── 🧠 path-planning/              # AI 路径规划模块
│   ├── 📄 README.md
│   ├── 📦 core/
│   │   └── PathPlanner.js         # A* 路径规划算法
│   ├── 📦 agent/
│   │   └── AIAgent.js             # AI 智能决策
│   ├── 📦 dynamic-updater/
│   │   └── DynamicPathUpdater.js  # 500ms 动态更新
│   ├── 📦 vulnerable-group/
│   │   └── VulnerableGroupAdapter.js # 弱势群体适配
│   └── 📦 obstacle-avoidance/
│       └── ObstacleMap.js         # 障碍物管理
│
├── 🧪 tests/                       # 测试模块
│   ├── 📄 README.md
│   ├── response-time.test.js      # 响应时间测试（<1秒）
│   ├── accuracy.test.js           # 准确率测试（>90%）
│   ├── accessibility.test.js     # 无障碍标准测试
│   └── integration.test.js        # 集成测试
│
└── 💡 examples/                    # 使用示例
    └── usage-example.js           # 完整使用示例
```

## 🎯 核心功能模块

### 1️⃣ 数字孪生模型 (digital-twin)

**功能**：通过 CAD + 扫描数据构建建筑数字孪生

```
输入：CAD 图纸 + 现场扫描数据
  ↓
处理：数据融合、结构识别、通道提取
  ↓
输出：3D 建筑模型 + 导航网格 + 通道标记
```

**关键特性**：
- ✅ CAD 图纸导入（DWG/DXF/IFC）
- ✅ 点云数据处理
- ✅ 数据融合与对齐
- ✅ 通道准确性验证
- ✅ 无障碍通道识别

### 2️⃣ AI 路径规划 (path-planning)

**功能**：智能逃生路径规划

```
火点触发
  ↓
AI Agent 分析环境
  ↓
A* 算法计算路径（避开火点/拥堵）
  ↓
动态更新（每 500ms）
  ↓
生成橙色引导路径
```

**关键特性**：
- ✅ 自动避开火点蔓延区域
- ✅ 避开拥堵路段
- ✅ 动态路径更新（500ms）
- ✅ 弱势群体特殊适配
- ✅ 协助信号推送

### 3️⃣ 弱势群体适配 (vulnerable-group)

**功能**：为老人/儿童/残障人士提供无障碍路径

```
用户画像识别
  ↓
无障碍通道优先选择
  ↓
避开陡坡/窄道
  ↓
速度降低 30%
  ↓
推送协助信号
```

**适配标准**：
- ✅ 通道宽度 ≥ 1.2 米
- ✅ 路径坡度 ≤ 5%
- ✅ 台阶高度 ≤ 2cm
- ✅ 优先选择无障碍通道

## 📊 性能指标

| 指标 | 目标值 | 测试文件 |
|------|--------|----------|
| 响应时间 | < 1 秒 | `tests/response-time.test.js` |
| 动态调整准确率 | > 90% | `tests/accuracy.test.js` |
| 无障碍标准合规性 | 100% | `tests/accessibility.test.js` |

## 🔄 工作流程

### 场景 1：普通用户逃生

```
1. 火点触发 → 2. 路径规划 → 3. 动态更新 → 4. 橙色引导路径
```

### 场景 2：弱势群体逃生

```
1. 火点触发 → 2. 识别用户类型 → 3. 无障碍路径规划 
→ 4. 速度调整（-30%）→ 5. 推送协助信号 → 6. 动态更新
```

## 📝 代码示例

### 基础路径规划

```javascript
// 1. 构建数字孪生模型
const digitalTwin = await DigitalTwinBuilder.build({
  cadData,
  scanData,
  focusOnChannels: true
});

// 2. 初始化路径规划器
const pathPlanner = new PathPlanner(navMesh, obstacleMap);
const aiAgent = new AIAgent(pathPlanner, digitalTwin);

// 3. 火点触发，规划路径
const result = await aiAgent.planEscapeRoute(
  firePoint,      // 火点位置
  userLocation,   // 用户位置
  null            // 普通用户
);
```

### 弱势群体路径规划

```javascript
// 创建弱势群体适配器
const adapter = new VulnerableGroupAdapter(pathPlanner, digitalTwin);

// 规划无障碍路径
const result = await adapter.planAccessiblePath(
  start,
  goal,
  { type: 'elderly' } // 老人模式
);

// 结果包含：
// - accessible: true
// - speedMultiplier: 0.7 (速度降低 30%)
// - assistanceNeeded: true
// - validation: { isValid, compliance }
```

### 动态路径更新

```javascript
// 创建动态更新器
const updater = new DynamicPathUpdater(aiAgent, 500); // 500ms 更新

// 开始动态更新
updater.startDynamicUpdate(
  firePoint,
  userLocation,
  userProfile,
  (update) => {
    console.log('路径已更新:', update.path);
    // 显示橙色引导路径
  }
);
```

## 🧪 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 运行特定测试
npm test -- response-time    # 响应时间测试
npm test -- accuracy         # 准确率测试
npm test -- accessibility    # 无障碍测试
```

## 📈 项目统计

- **总文件数**：20+ 个文件
- **代码模块**：10+ 个核心模块
- **测试用例**：4 个测试套件
- **文档**：5+ 个文档文件

## 🚀 下一步开发

1. **实现 TODO 标记的功能**
   - CAD 文件解析库集成
   - 点云处理算法实现
   - A* 算法完整实现

2. **3D 可视化**
   - Three.js 集成
   - 橙色引导路径渲染
   - 实时路径更新动画

3. **系统集成**
   - 与阶段 1（火灾报警系统）集成
   - 与管理后台 API 集成
   - WebSocket 实时通信

4. **性能优化**
   - 路径规划算法优化
   - 内存管理优化
   - 并发处理优化

## 📚 相关文档

- [主 README](README.md) - 项目概述
- [项目结构](PROJECT_STRUCTURE.md) - 详细结构说明
- [使用示例](examples/usage-example.js) - 完整代码示例
- [测试说明](tests/README.md) - 测试文档

---

**创建时间**：2024
**项目状态**：框架搭建完成，待实现具体功能

