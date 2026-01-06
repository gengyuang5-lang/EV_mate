/**
 * 应用常量配置
 */

// API配置
export const API_URL = __DEV__ 
  ? 'http://localhost:3000'  // 开发环境
  : 'http://your-production-url:3000';  // 生产环境

export const WS_URL = __DEV__
  ? 'ws://localhost:3000'
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

