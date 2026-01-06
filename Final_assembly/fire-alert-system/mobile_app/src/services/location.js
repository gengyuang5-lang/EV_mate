/**
 * 位置服务
 * 处理GPS定位和位置相关功能
 */

import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

/**
 * 请求位置权限
 */
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限',
          message: '应用需要访问您的位置信息',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

/**
 * 获取当前位置
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        console.error('获取位置失败:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  });
};

/**
 * 监听位置变化
 */
export const watchPosition = (callback) => {
  return Geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    (error) => {
      console.error('位置监听错误:', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // 移动10米后更新
      interval: 5000 // 每5秒更新一次
    }
  );
};

/**
 * 清除位置监听
 */
export const clearWatch = (watchId) => {
  Geolocation.clearWatch(watchId);
};

