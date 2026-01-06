/**
 * CAD转路径数据转换器 - 入口文件
 */

const convert = require('./src/convert');

// 如果直接运行此文件
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n=== CAD图纸转逃生路径数据转换器 ===\n');
    console.log('使用方法:');
    console.log('  node index.js <输入DXF文件> <输出JSON文件> [选项]\n');
    console.log('选项:');
    console.log('  --format <格式>      输出格式: json, geojson, mobile (默认: json)');
    console.log('  --grid-size <大小>   网格大小，单位：米 (默认: 1.0)');
    console.log('  --padding <边距>     边距，单位：米 (默认: 5.0)');
    console.log('  --include-routes     包含路径网络（仅GeoJSON格式）\n');
    console.log('示例:');
    console.log('  node index.js input/floor.dxf output/route.json');
    console.log('  node index.js input/floor.dxf output/route.geojson --format geojson');
    console.log('  node index.js input/floor.dxf output/route.json --grid-size 0.5\n');
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

