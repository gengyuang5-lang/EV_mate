# CAD图纸转逃生路径转换器

将CAD图纸（DXF/DWG格式）转换为逃生路径规划算法和移动应用可用的数据格式。

## 功能特性

- ✅ 支持DXF格式CAD图纸解析
- ✅ 提取建筑平面图结构（墙体、门、出口等）
- ✅ 生成路径规划网格数据
- ✅ 输出JSON格式供算法使用
- ✅ 输出GeoJSON格式供地图显示
- ✅ 支持坐标系统转换

## 项目结构

```
cad-to-route-converter/
├── src/
│   ├── cadParser.js          # CAD文件解析
│   ├── geometryExtractor.js  # 几何信息提取
│   ├── routeGridGenerator.js # 路径网格生成
│   ├── formatConverter.js    # 格式转换
│   └── convert.js            # 主转换程序
├── input/                    # 输入CAD文件目录
├── output/                   # 输出数据目录
├── test/                     # 测试文件
└── index.js                  # 入口文件
```

## 安装

```bash
npm install
```

## 使用方法

### 基本使用

```bash
node src/convert.js input/floor_plan.dxf output/route_data.json
```

### 指定输出格式

```bash
node src/convert.js input/floor_plan.dxf output/route_data.json --format json
node src/convert.js input/floor_plan.dxf output/route_data.geojson --format geojson
```

## 输出格式

### JSON格式（用于路径规划算法）

```json
{
  "nodes": [
    {
      "id": "node_1",
      "x": 10.5,
      "y": 20.3,
      "floor": 1,
      "type": "walkable"
    }
  ],
  "edges": [
    {
      "from": "node_1",
      "to": "node_2",
      "distance": 5.2,
      "width": 2.0
    }
  ],
  "obstacles": [
    {
      "type": "wall",
      "coordinates": [[x1, y1], [x2, y2], ...]
    }
  ],
  "exits": [
    {
      "id": "exit_1",
      "x": 100.5,
      "y": 50.0,
      "floor": 1
    }
  ]
}
```

### GeoJSON格式（用于地图显示）

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      },
      "properties": {
        "type": "room",
        "name": "Room 101"
      }
    }
  ]
}
```

