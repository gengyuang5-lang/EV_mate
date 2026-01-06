/**
 * CAD转路径数据主程序
 */

const fs = require('fs');
const path = require('path');
const CADParser = require('./cadParser');
const RouteGridGenerator = require('./routeGridGenerator');
const FormatConverter = require('./formatConverter');

async function convert(inputFile, outputFile, options = {}) {
  console.log('开始转换CAD文件...');
  console.log(`输入文件: ${inputFile}`);
  console.log(`输出文件: ${outputFile}`);
  
  try {
    // 1. 解析CAD文件
    console.log('\n步骤1: 解析CAD文件...');
    const parser = new CADParser();
    const cadData = await parser.parseDXF(inputFile);
    console.log(`✓ 解析完成: 找到 ${cadData.walls.length} 个墙体, ${cadData.exits.length} 个出口`);
    
    // 2. 生成路径网格
    console.log('\n步骤2: 生成路径网格...');
    const gridGenerator = new RouteGridGenerator();
    const gridData = gridGenerator.generateGrid(cadData, {
      gridSize: options.gridSize || 1.0,
      padding: options.padding || 5.0
    });
    console.log(`✓ 网格生成完成: ${gridData.nodes.length} 个节点, ${gridData.edges.length} 条边`);
    
    // 3. 格式转换
    console.log('\n步骤3: 格式转换...');
    const converter = new FormatConverter();
    let outputData;
    
    const format = options.format || path.extname(outputFile).slice(1) || 'json';
    
    switch (format.toLowerCase()) {
      case 'geojson':
        outputData = converter.toGeoJSON(gridData, {
          includeRoutes: options.includeRoutes || false
        });
        break;
      
      case 'mobile':
      case 'mobileapp':
        outputData = converter.toMobileAppFormat(gridData);
        break;
      
      case 'json':
      default:
        outputData = converter.toRoutePlanningFormat(gridData);
        break;
    }
    console.log(`✓ 格式转换完成: ${format.toUpperCase()}`);
    
    // 4. 保存文件
    console.log('\n步骤4: 保存文件...');
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`✓ 文件已保存: ${outputFile}`);
    
    // 5. 输出统计信息
    console.log('\n转换完成！');
    console.log('\n统计信息:');
    console.log(`  - 节点数量: ${gridData.nodes.length}`);
    console.log(`  - 边数量: ${gridData.edges.length}`);
    console.log(`  - 出口数量: ${gridData.exits.length}`);
    console.log(`  - 网格大小: ${gridData.bounds.gridWidth} x ${gridData.bounds.gridHeight}`);
    console.log(`  - 输出格式: ${format.toUpperCase()}`);
    
    return outputData;
    
  } catch (error) {
    console.error('\n转换失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('使用方法:');
    console.log('  node src/convert.js <输入DXF文件> <输出JSON文件> [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --format <格式>    输出格式: json, geojson, mobile (默认: json)');
    console.log('  --grid-size <大小> 网格大小，单位：米 (默认: 1.0)');
    console.log('  --padding <边距>   边距，单位：米 (默认: 5.0)');
    console.log('  --include-routes   包含路径网络（仅GeoJSON格式）');
    console.log('');
    console.log('示例:');
    console.log('  node src/convert.js input/floor.dxf output/route.json');
    console.log('  node src/convert.js input/floor.dxf output/route.geojson --format geojson');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  // 解析选项
  const options = {};
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--format':
        options.format = args[++i];
        break;
      case '--grid-size':
        options.gridSize = parseFloat(args[++i]);
        break;
      case '--padding':
        options.padding = parseFloat(args[++i]);
        break;
      case '--include-routes':
        options.includeRoutes = true;
        break;
    }
  }
  
  convert(inputFile, outputFile, options);
}

module.exports = convert;

