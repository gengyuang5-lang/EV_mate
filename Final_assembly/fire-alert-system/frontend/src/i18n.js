/**
 * 多语言支持模块
 */

const translations = {
  zh: {
    appTitle: '火灾预警系统',
    realTimeMonitoring: '实时监控',
    activeAlerts: '活跃预警',
    firePoints: '火点位置',
    help: '一键求助',
    language: '语言',
    temperature: '温度',
    smoke: '烟雾',
    co: '一氧化碳',
    location: '位置',
    status: '状态',
    normal: '正常',
    warning: '警告',
    alert: '预警',
    critical: '严重',
    noActiveAlerts: '暂无活跃预警',
    requestHelp: '发送求助',
    helpRequestSent: '求助请求已发送',
    alertReceived: '收到预警',
    resolveAlert: '解决预警',
    alertResolved: '预警已解决',
    statistics: '统计信息',
    totalAlerts: '总预警数',
    activeAlertsCount: '活跃预警',
    todayAlerts: '今日预警',
    accuracy: '准确率',
    connectionStatus: '连接状态',
    connected: '已连接',
    disconnected: '未连接',
    reconnect: '重新连接'
  },
  en: {
    appTitle: 'Fire Alert System',
    realTimeMonitoring: 'Real-time Monitoring',
    activeAlerts: 'Active Alerts',
    firePoints: 'Fire Points',
    help: 'Help',
    language: 'Language',
    temperature: 'Temperature',
    smoke: 'Smoke',
    co: 'Carbon Monoxide',
    location: 'Location',
    status: 'Status',
    normal: 'Normal',
    warning: 'Warning',
    alert: 'Alert',
    critical: 'Critical',
    noActiveAlerts: 'No Active Alerts',
    requestHelp: 'Request Help',
    helpRequestSent: 'Help Request Sent',
    alertReceived: 'Alert Received',
    resolveAlert: 'Resolve Alert',
    alertResolved: 'Alert Resolved',
    statistics: 'Statistics',
    totalAlerts: 'Total Alerts',
    activeAlertsCount: 'Active Alerts',
    todayAlerts: 'Today Alerts',
    accuracy: 'Accuracy',
    connectionStatus: 'Connection Status',
    connected: 'Connected',
    disconnected: 'Disconnected',
    reconnect: 'Reconnect'
  }
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'zh';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('language', lang);
    }
  }

  t(key) {
    return translations[this.currentLang][key] || key;
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

export default new I18n();

