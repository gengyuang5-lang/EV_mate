# 虚拟机配置脚本 - PowerShell 版本
# 在虚拟机中运行此脚本进行快速配置

param(
    [string]$HostIP = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  虚拟机 App 配置脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 如果没有提供 IP，提示输入
if ([string]::IsNullOrEmpty($HostIP)) {
    Write-Host "请输入宿主机 IP 地址:" -ForegroundColor Yellow
    Write-Host "提示: 在宿主机上运行 'ipconfig' 获取 IP" -ForegroundColor Gray
    $HostIP = Read-Host "宿主机 IP"
}

if ([string]::IsNullOrEmpty($HostIP)) {
    Write-Host "❌ 错误: 必须提供宿主机 IP 地址" -ForegroundColor Red
    exit 1
}

Write-Host "配置宿主机 IP: $HostIP" -ForegroundColor Green
Write-Host ""

# 检查 constants.js 文件是否存在
$constantsPath = "src\utils\constants.js"
$constantsVMPath = "src\utils\constants-vm.js.example"

if (-not (Test-Path $constantsPath)) {
    Write-Host "❌ 错误: 找不到 $constantsPath" -ForegroundColor Red
    exit 1
}

# 备份原文件
$backupPath = "$constantsPath.backup"
if (Test-Path $constantsPath) {
    Copy-Item $constantsPath $backupPath -Force
    Write-Host "✅ 已备份原配置文件到: $backupPath" -ForegroundColor Green
}

# 读取配置模板
$templateContent = @"
/**
 * 应用常量配置 - 虚拟机环境
 * 自动生成于: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
 */

import { Platform } from 'react-native';

// 宿主机 IP 地址
const HOST_IP = '$HostIP';

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
  ? `http://` + getHostIP() + `:3000`  // 开发环境 - 使用宿主机 IP
  : 'http://your-production-url:3000';  // 生产环境

export const WS_URL = __DEV__
  ? `ws://` + getHostIP() + `:3000`  // WebSocket 使用宿主机 IP
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
"@

# 写入新配置
try {
    $templateContent | Out-File -FilePath $constantsPath -Encoding UTF8 -NoNewline
    Write-Host "✅ 配置文件已更新: $constantsPath" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ 错误: 无法写入配置文件 - $_" -ForegroundColor Red
    exit 1
}

# 测试连接
Write-Host "测试连接到宿主机..." -ForegroundColor Yellow
Write-Host ""

# 测试 HTTP
try {
    $response = Invoke-WebRequest -Uri "http://$HostIP`:3000/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ HTTP API 连接成功" -ForegroundColor Green
    } else {
        Write-Host "⚠️  HTTP API 响应异常: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ HTTP API 连接失败: $_" -ForegroundColor Red
    Write-Host "   请确保:" -ForegroundColor Yellow
    Write-Host "   1. 宿主机后端服务正在运行 (端口 3000)" -ForegroundColor Yellow
    Write-Host "   2. 防火墙允许连接" -ForegroundColor Yellow
    Write-Host "   3. IP 地址正确" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 确保宿主机后端服务正在运行" -ForegroundColor White
Write-Host "  2. 运行: npm start" -ForegroundColor White
Write-Host "  3. 运行: npm run android" -ForegroundColor White
Write-Host ""
Write-Host "配置信息:" -ForegroundColor Yellow
Write-Host "  API_URL: http://$HostIP`:3000" -ForegroundColor White
Write-Host "  WS_URL:  ws://$HostIP`:3000" -ForegroundColor White
Write-Host "  (Android 模拟器将使用: 10.0.2.2)" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

