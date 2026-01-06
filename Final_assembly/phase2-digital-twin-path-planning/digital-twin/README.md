# 建筑数字孪生模型模块

## 功能概述

通过 CAD 图纸导入和现场扫描，快速还原试点建筑的楼层结构、逃生通道、安全出口。

## 模块结构

### 1. CAD 导入模块 (cad-importer)
- 支持常见 CAD 格式（DWG, DXF, IFC）
- 提取建筑结构信息
- 识别通道和出口位置

### 2. 扫描处理模块 (scan-processor)
- 处理现场扫描数据（点云、图像）
- 数据融合与对齐
- 结构验证

### 3. 模型构建模块 (model-builder)
- 构建三维建筑模型
- 标记关键位置（通道、出口）
- 生成导航网格

### 4. 通道映射模块 (channel-mapper)
- 通道准确性验证
- 无障碍通道识别
- 路径网络构建

## 使用示例

```javascript
import { DigitalTwinBuilder } from './model-builder';
import { CADImporter } from './cad-importer';
import { ScanProcessor } from './scan-processor';

// 导入 CAD 图纸
const cadData = await CADImporter.import('building.dwg');

// 处理现场扫描
const scanData = await ScanProcessor.process('scan_data.ply');

// 构建数字孪生模型
const digitalTwin = await DigitalTwinBuilder.build({
  cadData,
  scanData,
  focusOnChannels: true // 重点保证通道准确性
});
```

