/**
 * API服务
 * 处理与后端的HTTP请求
 */

import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 获取活跃预警
 */
export const getActiveAlerts = async () => {
  try {
    const response = await api.get('/api/alerts/active');
    return response.data;
  } catch (error) {
    console.error('获取活跃预警失败:', error);
    throw error;
  }
};

/**
 * 获取预警统计
 */
export const getAlertStatistics = async () => {
  try {
    const response = await api.get('/api/alerts/statistics');
    return response.data;
  } catch (error) {
    console.error('获取预警统计失败:', error);
    throw error;
  }
};

/**
 * 解决预警
 */
export const resolveAlert = async (alertId) => {
  try {
    const response = await api.post('/api/alerts/resolve', { alertId });
    return response.data;
  } catch (error) {
    console.error('解决预警失败:', error);
    throw error;
  }
};

/**
 * 发送求助请求
 */
export const requestHelp = async (data) => {
  try {
    const response = await api.post('/api/help/request', {
      location: data.location || '未知位置',
      coordinates: data.coordinates || { lat: 0, lng: 0 },
      message: data.message || '我需要帮助！',
      userId: data.userId || 'mobile-user-' + Date.now()
    });
    return response.data;
  } catch (error) {
    console.error('发送求助请求失败:', error);
    throw error;
  }
};

/**
 * 获取传感器统计数据
 */
export const getSensorStatistics = async () => {
  try {
    const response = await api.get('/api/sensor/statistics');
    return response.data;
  } catch (error) {
    console.error('获取传感器统计失败:', error);
    throw error;
  }
};

/**
 * 获取最近传感器数据
 */
export const getRecentSensorData = async (limit = 10) => {
  try {
    const response = await api.get(`/api/sensor/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('获取最近传感器数据失败:', error);
    throw error;
  }
};

export default api;

