# 建筑物内三维立体导航算法

这是一个用于在建筑物内部进行三维立体导航的算法实现，基于A*路径规划算法。

## 功能特性

- **3D路径规划**：使用A*算法在三维空间中寻找最优路径
- **建筑物地图表示**：使用3D网格表示建筑物内部结构
- **多楼层支持**：支持跨楼层导航，包括楼梯和电梯
- **地标系统**：支持地标点标记和导航
- **路径可视化**：提供2D和3D路径可视化功能
- **灵活配置**：支持对角线移动、多目标点导航等

## 项目结构

```
demo1/
├── building_map.py      # 建筑物地图表示类
├── pathfinder_3d.py     # 3D A*路径规划算法
├── navigation_3d.py     # 导航系统主类
├── example.py           # 使用示例
├── visualizer.py        # 可视化工具
├── requirements.txt     # 依赖包
└── README.md           # 说明文档
```

## 安装依赖

```bash
pip install -r requirements.txt
```

注意：`matplotlib` 是可选的，仅用于可视化功能。核心算法只需要 `numpy`。

## 快速开始

### 基本使用

```python
from navigation_3d import Navigation3D

# 创建导航系统（20x5x20的建筑物：宽20，高5层，深20）
nav = Navigation3D(width=20, height=5, depth=20)

# 设置障碍物
nav.building_map.set_obstacle(5, 0, 5)  # 在(5,0,5)设置障碍物
nav.building_map.set_obstacle_region(2, 0, 2, 4, 0, 4)  # 设置区域障碍物

# 添加楼梯
nav.building_map.add_stairs(3, 3, 0, 4, 'up')  # 从0层到4层的楼梯

# 添加电梯
nav.building_map.add_elevator(10, 3, [0, 1, 2, 3, 4])  # 服务所有楼层的电梯

# 添加地标
nav.add_landmark("入口", (1, 0, 1))
nav.add_landmark("会议室", (9, 2, 9))

# 导航
start = (1, 0, 1)
goal = (9, 2, 9)
path = nav.navigate(start, goal)

if path:
    nav.visualize_path(path)
    print(f"找到路径，共 {len(path)} 个点")
else:
    print("无法找到路径")
```

### 运行示例

```bash
python example.py
```

示例包括：
1. 基本导航
2. 使用地标导航
3. 经过多个地标的导航
4. 跨楼层导航
5. 路径比较（对角线 vs 非对角线）

### 可视化

```python
from navigation_3d import Navigation3D
from visualizer import visualize_path_3d, visualize_path_2d_projections

nav = Navigation3D(20, 5, 20)
# ... 设置地图和障碍物 ...

path = nav.navigate((1, 0, 1), (18, 2, 18))

# 3D可视化
visualize_path_3d(path, nav.building_map)

# 2D投影可视化
visualize_path_2d_projections(path, nav.building_map)
```

## API 文档

### Navigation3D 类

主要的导航系统类。

#### 方法

- `__init__(width, height, depth)`: 初始化导航系统
- `add_landmark(name, position)`: 添加地标点
- `navigate(start, goal, allow_diagonal=True)`: 从起点导航到终点
- `navigate_to_landmark(start, landmark_name, allow_diagonal=True)`: 导航到地标
- `navigate_through_landmarks(start, landmark_names, allow_diagonal=True)`: 依次经过多个地标
- `get_path_length(path)`: 计算路径长度
- `get_path_info(path)`: 获取路径详细信息
- `visualize_path(path, show_all_floors=False)`: 可视化路径

### BuildingMap 类

建筑物地图表示类。

#### 方法

- `set_obstacle(x, y, z)`: 设置障碍物
- `set_obstacle_region(x1, y1, z1, x2, y2, z2)`: 设置区域障碍物
- `set_walkable(x, y, z)`: 设置可通行区域
- `is_walkable(x, y, z)`: 检查位置是否可通行
- `add_stairs(x, z, start_floor, end_floor, direction)`: 添加楼梯
- `add_elevator(x, z, floors)`: 添加电梯
- `visualize_2d_slice(y, show_path=None)`: 可视化某个楼层的2D切片

### PathFinder3D 类

3D A*路径规划器。

#### 方法

- `find_path(start, goal, allow_diagonal=True)`: 查找路径
- `find_path_multiple_goals(start, goals, allow_diagonal=True)`: 查找经过多个目标的路径

## 算法说明

### A*算法

本实现使用A*算法进行路径规划，具有以下特点：

1. **启发式函数**：使用欧几里得距离作为启发式估计
2. **代价函数**：
   - 水平移动：代价为1
   - 对角线移动：代价为√2（约1.414）
   - 跨楼层移动：代价为2.0 + 水平移动距离×0.1
3. **移动方向**：支持6方向（前后左右上下）或26方向（包括对角线）

### 坐标系统

- **X轴**：宽度方向（左右）
- **Y轴**：高度方向（楼层，0为底层）
- **Z轴**：深度方向（前后）

## 性能考虑

- 对于大型建筑物（>1000个网格点），可能需要优化
- 可以通过限制搜索范围或使用分层规划来提高性能
- 对角线移动会增加计算复杂度，但通常能找到更短的路径

## 扩展建议

1. **动态障碍物**：支持动态添加/移除障碍物
2. **多目标优化**：考虑时间、距离、能耗等多个因素
3. **实时导航**：结合传感器数据进行实时路径调整
4. **路径平滑**：对生成的路径进行平滑处理
5. **3D模型导入**：从3D模型文件导入建筑物结构

## 许可证

本项目仅供学习和研究使用。

## 作者

创建于 2024

