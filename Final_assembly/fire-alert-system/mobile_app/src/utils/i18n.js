/**
 * 多语言配置
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LANGUAGE } from './constants';

// 翻译资源
const resources = {
  zh: {
    translation: {
      appTitle: '火灾预警系统',
      home: '首页',
      alerts: '预警',
      help: '求助',
      settings: '设置',
      realTimeMonitoring: '实时监控',
      activeAlerts: '活跃预警',
      noActiveAlerts: '暂无活跃预警',
      firePoints: '火点位置',
      location: '位置',
      status: '状态',
      temperature: '温度',
      smoke: '烟雾',
      co: '一氧化碳',
      normal: '正常',
      warning: '警告',
      alert: '预警',
      critical: '严重',
      alertReceived: '收到预警',
      alertMessage: '预警消息',
      resolveAlert: '解决预警',
      alertResolved: '预警已解决',
      requestHelp: '发送求助',
      helpRequestSent: '求助请求已发送',
      help: '一键求助',
      helpMessage: '我需要帮助！',
      currentLocation: '当前位置',
      language: '语言',
      chinese: '中文',
      english: 'English',
      connectionStatus: '连接状态',
      connected: '已连接',
      disconnected: '未连接',
      escapeRoute: '逃生路径',
      escapeRoutePlanning: '逃生路径规划',
      comingSoon: '功能开发中...',
      calculatingRoute: '正在计算路线...',
      distance: '距离',
      estimatedTime: '预计时间',
      exit: '出口',
      nearestExit: '最近出口',
      refreshRoute: '刷新路线',
      permissionRequired: '需要权限',
      locationPermissionMessage: '需要位置权限才能使用逃生路线功能',
      error: '错误',
      failedToInitializeRoute: '初始化路线失败',
      failedToCalculateRoute: '计算路线失败',
      noRouteAvailable: '暂无可用路线',
      permissionDenied: '权限被拒绝',
      locationPermissionRequired: '需要位置权限才能使用此功能'
    }
  },
  en: {
    translation: {
      appTitle: 'Fire Alert System',
      home: 'Home',
      alerts: 'Alerts',
      help: 'Help',
      settings: 'Settings',
      realTimeMonitoring: 'Real-time Monitoring',
      activeAlerts: 'Active Alerts',
      noActiveAlerts: 'No Active Alerts',
      firePoints: 'Fire Points',
      location: 'Location',
      status: 'Status',
      temperature: 'Temperature',
      smoke: 'Smoke',
      co: 'Carbon Monoxide',
      normal: 'Normal',
      warning: 'Warning',
      alert: 'Alert',
      critical: 'Critical',
      alertReceived: 'Alert Received',
      alertMessage: 'Alert Message',
      resolveAlert: 'Resolve Alert',
      alertResolved: 'Alert Resolved',
      requestHelp: 'Request Help',
      helpRequestSent: 'Help Request Sent',
      help: 'Help',
      helpMessage: 'I need help!',
      currentLocation: 'Current Location',
      language: 'Language',
      chinese: '中文',
      english: 'English',
      connectionStatus: 'Connection Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      escapeRoute: 'Escape Route',
      escapeRoutePlanning: 'Escape Route Planning',
      comingSoon: 'Coming Soon...',
      calculatingRoute: 'Calculating route...',
      distance: 'Distance',
      estimatedTime: 'Estimated Time',
      exit: 'Exit',
      nearestExit: 'Nearest Exit',
      refreshRoute: 'Refresh Route',
      permissionRequired: 'Permission Required',
      locationPermissionMessage: 'Location permission is required to use escape route feature',
      error: 'Error',
      failedToInitializeRoute: 'Failed to initialize route',
      failedToCalculateRoute: 'Failed to calculate route',
      noRouteAvailable: 'No route available',
      permissionDenied: 'Permission Denied',
      locationPermissionRequired: 'Location permission is required to use this feature'
    }
  }
};

// 初始化i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    // 禁用pluralResolver以避免错误
    pluralSeparator: '_',
    contextSeparator: '_',
    keySeparator: '.',
    nsSeparator: ':',
    compatibilityJSON: 'v3'
  });

// 从存储中加载语言设置
AsyncStorage.getItem('language').then(language => {
  if (language && resources[language]) {
    i18n.changeLanguage(language);
  }
});

export default i18n;

