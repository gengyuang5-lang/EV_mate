/**
 * CAD文件解析器
 * 支持DXF格式的CAD图纸解析
 */

const fs = require('fs');
const DxfParser = require('dxf-parser');

class CADParser {
  constructor() {
    this.parser = new DxfParser();
  }

  /**
   * 解析DXF文件
   * @param {string} filePath - DXF文件路径
   * @returns {Promise<Object>} 解析后的CAD数据
   */
  async parseDXF(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const dxf = this.parser.parseSync(fileContent);
      return this.processDXFData(dxf);
    } catch (error) {
      throw new Error(`DXF解析失败: ${error.message}`);
    }
  }

  /**
   * 处理DXF数据，提取有用信息
   * @param {Object} dxf - 解析后的DXF数据
   * @returns {Object} 处理后的数据
   */
  processDXFData(dxf) {
    const entities = dxf.entities || [];
    
    const walls = [];
    const doors = [];
    const windows = [];
    const rooms = [];
    const exits = [];
    const texts = [];

    entities.forEach(entity => {
      switch (entity.type) {
        case 'LINE':
          // 直线可能是墙体
          walls.push({
            type: 'line',
            start: { x: entity.start.x, y: entity.start.y },
            end: { x: entity.end.x, y: entity.end.y },
            layer: entity.layer
          });
          break;

        case 'LWPOLYLINE':
        case 'POLYLINE':
          // 多段线可能是墙体或房间边界
          const points = this.extractPolylinePoints(entity);
          if (this.isRoomBoundary(entity)) {
            rooms.push({
              type: 'polyline',
              points: points,
              layer: entity.layer
            });
          } else {
            walls.push({
              type: 'polyline',
              points: points,
              layer: entity.layer
            });
          }
          break;

        case 'ARC':
        case 'CIRCLE':
          // 圆弧和圆可能是门或特殊区域
          if (this.isDoor(entity)) {
            doors.push({
              type: entity.type.toLowerCase(),
              center: { x: entity.center.x, y: entity.center.y },
              radius: entity.radius || entity.r,
              layer: entity.layer
            });
          }
          break;

        case 'TEXT':
        case 'MTEXT':
          // 文本可能标注房间名称、出口等
          const textData = {
            text: entity.text || entity.string,
            position: { x: entity.position.x, y: entity.position.y },
            layer: entity.layer
          };
          
          if (this.isExitLabel(textData.text)) {
            exits.push({
              type: 'exit',
              label: textData.text,
              position: textData.position
            });
          } else {
            texts.push(textData);
          }
          break;

        case 'BLOCK':
          // 图块可能是门、窗、出口等符号
          if (this.isExitBlock(entity)) {
            exits.push({
              type: 'exit',
              position: { x: entity.position.x, y: entity.position.y },
              blockName: entity.name
            });
          } else if (this.isDoorBlock(entity)) {
            doors.push({
              type: 'block',
              position: { x: entity.position.x, y: entity.position.y },
              blockName: entity.name
            });
          }
          break;
      }
    });

    return {
      walls,
      doors,
      windows,
      rooms,
      exits,
      texts,
      bounds: this.calculateBounds(entities),
      units: dxf.header?.$INSUNITS || 1 // 单位：1=英寸, 2=英尺, 4=毫米, 5=厘米, 6=米
    };
  }

  /**
   * 提取多段线点
   */
  extractPolylinePoints(entity) {
    if (entity.vertices) {
      return entity.vertices.map(v => ({ x: v.x, y: v.y }));
    }
    if (entity.polyline) {
      return entity.polyline.map(p => ({ x: p.x, y: p.y }));
    }
    return [];
  }

  /**
   * 判断是否为房间边界
   */
  isRoomBoundary(entity) {
    const layer = (entity.layer || '').toLowerCase();
    return layer.includes('room') || 
           layer.includes('space') ||
           layer.includes('area');
  }

  /**
   * 判断是否为门
   */
  isDoor(entity) {
    const layer = (entity.layer || '').toLowerCase();
    return layer.includes('door') || 
           layer.includes('gate');
  }

  /**
   * 判断是否为出口标签
   */
  isExitLabel(text) {
    const exitKeywords = ['exit', '出口', 'exit', 'emergency', '紧急', '安全出口'];
    const lowerText = (text || '').toLowerCase();
    return exitKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * 判断是否为出口图块
   */
  isExitBlock(entity) {
    const name = (entity.name || '').toLowerCase();
    return name.includes('exit') || 
           name.includes('出口') ||
           name.includes('emergency');
  }

  /**
   * 判断是否为门图块
   */
  isDoorBlock(entity) {
    const name = (entity.name || '').toLowerCase();
    return name.includes('door') || name.includes('门');
  }

  /**
   * 计算边界框
   */
  calculateBounds(entities) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    entities.forEach(entity => {
      const coords = this.extractEntityCoordinates(entity);
      coords.forEach(coord => {
        minX = Math.min(minX, coord.x);
        minY = Math.min(minY, coord.y);
        maxX = Math.max(maxX, coord.x);
        maxY = Math.max(maxY, coord.y);
      });
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 提取实体坐标
   */
  extractEntityCoordinates(entity) {
    const coords = [];
    
    switch (entity.type) {
      case 'LINE':
        coords.push({ x: entity.start.x, y: entity.start.y });
        coords.push({ x: entity.end.x, y: entity.end.y });
        break;
      
      case 'LWPOLYLINE':
      case 'POLYLINE':
        const points = this.extractPolylinePoints(entity);
        coords.push(...points);
        break;
      
      case 'ARC':
      case 'CIRCLE':
        coords.push({ x: entity.center.x, y: entity.center.y });
        break;
      
      case 'TEXT':
      case 'MTEXT':
      case 'BLOCK':
        if (entity.position) {
          coords.push({ x: entity.position.x, y: entity.position.y });
        }
        break;
    }
    
    return coords;
  }
}

module.exports = CADParser;

