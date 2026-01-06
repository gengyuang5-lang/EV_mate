#!/bin/bash
# 虚拟机配置脚本 - Linux/macOS 版本
# 在虚拟机中运行此脚本进行快速配置

set -e

echo "========================================"
echo "  虚拟机 App 配置脚本"
echo "========================================"
echo ""

# 获取宿主机 IP
if [ -z "$1" ]; then
    echo "请输入宿主机 IP 地址:"
    echo "提示: 在宿主机上运行 'ipconfig' (Windows) 或 'ifconfig' (Linux/macOS) 获取 IP"
    read -p "宿主机 IP: " HOST_IP
else
    HOST_IP=$1
fi

if [ -z "$HOST_IP" ]; then
    echo "❌ 错误: 必须提供宿主机 IP 地址"
    exit 1
fi

echo "配置宿主机 IP: $HOST_IP"
echo ""

# 检查文件
CONSTANTS_PATH="src/utils/constants.js"
CONSTANTS_VM_PATH="src/utils/constants-vm.js.example"

if [ ! -f "$CONSTANTS_PATH" ]; then
    echo "❌ 错误: 找不到 $CONSTANTS_PATH"
    exit 1
fi

# 备份原文件
BACKUP_PATH="${CONSTANTS_PATH}.backup"
if [ -f "$CONSTANTS_PATH" ]; then
    cp "$CONSTANTS_PATH" "$BACKUP_PATH"
    echo "✅ 已备份原配置文件到: $BACKUP_PATH"
fi

# 创建新配置
cat > "$CONSTANTS_PATH" << EOF
/**
 * 应用常量配置 - 虚拟机环境
 * 自动生成于: $(date '+%Y-%m-%d %H:%M:%S')
 */

import { Platform } from 'react-native';

// 宿主机 IP 地址
const HOST_IP = '$HOST_IP';

// Android 模拟器特殊处理
const getHostIP = () => {
  if (Platform.OS === 'android') {
    // Android 模拟器使用 10.0.2.2 访问宿主机
    return __DEV__ ? '10.0.2.2' : HOST_IP;
  }
  return HOST_IP;
};

// API配置
export const API_URL = __DEV__ 
  ? \`http://\${getHostIP()}:3000\`  // 开发环境 - 使用宿主机 IP
  : 'http://your-production-url:3000';  // 生产环境

export const WS_URL = __DEV__
  ? \`ws://\${getHostIP()}:3000\`  // WebSocket 使用宿主机 IP
  : 'ws://your-production-url:3000';

// 预警级别
export const ALERT_LEVELS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  ALERT: 'alert',
  CRITICAL: 'critical'
};

// 传感器类型
export const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  SMOKE: 'smoke',
  CO: 'co'
};

// 地图配置
export const MAP_CONFIG = {
  INITIAL_LATITUDE: 39.9042,
  INITIAL_LONGITUDE: 116.4074,
  INITIAL_DELTA: 0.01
};

// 颜色配置
export const COLORS = {
  PRIMARY: '#dc2626',
  PRIMARY_LIGHT: '#ef4444',
  PRIMARY_DARK: '#b91c1c',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#dc2626',
  CRITICAL: '#991b1b',
  BACKGROUND: '#ffffff',
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#6b7280'
};

// 默认语言
export const DEFAULT_LANGUAGE = 'zh';
EOF

echo "✅ 配置文件已更新: $CONSTANTS_PATH"
echo ""

# 测试连接
echo "测试连接到宿主机..."
echo ""

# 测试 HTTP
if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 "http://${HOST_IP}:3000/api/health" > /dev/null 2>&1; then
        echo "✅ HTTP API 连接成功"
    else
        echo "❌ HTTP API 连接失败"
        echo "   请确保:"
        echo "   1. 宿主机后端服务正在运行 (端口 3000)"
        echo "   2. 防火墙允许连接"
        echo "   3. IP 地址正确"
    fi
else
    echo "⚠️  未安装 curl，跳过连接测试"
fi

echo ""
echo "========================================"
echo "配置完成！"
echo ""
echo "下一步操作:"
echo "  1. 确保宿主机后端服务正在运行"
echo "  2. 运行: npm start"
echo "  3. 运行: npm run android"
echo ""
echo "配置信息:"
echo "  API_URL: http://${HOST_IP}:3000"
echo "  WS_URL:  ws://${HOST_IP}:3000"
echo "  (Android 模拟器将使用: 10.0.2.2)"
echo "========================================"

