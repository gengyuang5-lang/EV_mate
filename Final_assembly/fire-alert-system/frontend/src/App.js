import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import i18n from './i18n';

// 后端服务运行在3000端口，前端运行在其他端口
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';

function App() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());
  const [connected, setConnected] = useState(false);
  const [firePoints, setFirePoints] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [sensorStats, setSensorStats] = useState(null);
  const [recentData, setRecentData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const wsRef = useRef(null);

  // 初始化WebSocket连接
  useEffect(() => {
    connectWebSocket();
    loadStatistics();
    loadSensorStats();
    loadRecentData();
    
    // 定期更新
    const statsInterval = setInterval(loadStatistics, 5000);
    const sensorInterval = setInterval(loadSensorStats, 2000);
    const dataInterval = setInterval(loadRecentData, 3000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(statsInterval);
      clearInterval(sensorInterval);
      clearInterval(dataInterval);
    };
  }, []);

  // 语言切换
  useEffect(() => {
    i18n.setLanguage(language);
  }, [language]);

  // 连接WebSocket
  const connectWebSocket = () => {
    try {
      console.log('正在尝试连接WebSocket:', WS_URL);
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        console.log('✅ WebSocket连接成功');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('解析WebSocket消息错误:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket错误:', error);
        console.error('WebSocket URL:', WS_URL);
        setConnected(false);
      };

      ws.onclose = (event) => {
        console.log('⚠️ WebSocket连接关闭, code:', event.code, 'reason:', event.reason);
        setConnected(false);
        // 只在非正常关闭时重连（code 1000是正常关闭）
        if (event.code !== 1000) {
          console.log('3秒后尝试重新连接...');
          setTimeout(connectWebSocket, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ WebSocket连接失败:', error);
      console.error('WebSocket URL:', WS_URL);
      setConnected(false);
      // 连接失败时也尝试重连
      setTimeout(connectWebSocket, 3000);
    }
  };

  // 处理WebSocket消息
  const handleWebSocketMessage = (message) => {
    switch (message.event) {
      case 'alert':
        handleAlert(message.data);
        break;
      case 'fire_point':
        handleFirePoint(message.data);
        break;
      case 'active_alerts':
        setActiveAlerts(message.data);
        break;
      case 'alert_resolved':
        handleAlertResolved(message.data);
        break;
      case 'help_request':
        console.log('收到求助请求:', message.data);
        break;
      default:
        console.log('未知消息类型:', message.event);
    }
  };

  // 处理预警
  const handleAlert = (alert) => {
    setActiveAlerts(prev => {
      const exists = prev.find(a => a.id === alert.id);
      if (exists) return prev;
      return [...prev, alert];
    });

    // 只播放语音提示，不显示弹窗
    playAlertSound(alert);
  };

  // 处理火点
  const handleFirePoint = (point) => {
    setFirePoints(prev => {
      const exists = prev.find(p => p.location === point.location);
      if (exists) {
        return prev.map(p => 
          p.location === point.location ? { ...p, ...point } : p
        );
      }
      return [...prev, point];
    });
  };

  // 处理预警解决
  const handleAlertResolved = (data) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== data.alertId));
    setFirePoints(prev => prev.filter(p => p.location !== data.location));
  };

  // 播放预警声音
  const playAlertSound = (alert) => {
    if ('speechSynthesis' in window && alert) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      utterance.text = alert.message?.[language] || alert.message || i18n.t('alertReceived');
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts/statistics`);
      const result = await response.json();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  // 加载传感器统计
  const loadSensorStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sensor/statistics`);
      const result = await response.json();
      if (result.success) {
        setSensorStats(result.data);
      }
    } catch (error) {
      console.error('加载传感器统计失败:', error);
    }
  };

  // 加载最近数据
  const loadRecentData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sensor/recent?limit=10`);
      const result = await response.json();
      if (result.success) {
        setRecentData(result.data);
      }
    } catch (error) {
      console.error('加载最近数据失败:', error);
    }
  };

  // 一键求助
  const handleHelpRequest = async () => {
    try {
      const response = await fetch(`${API_URL}/api/help/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: '用户位置',
          coordinates: { lat: 0, lng: 0 },
          message: i18n.t('requestHelp'),
          userId: 'user-' + Date.now()
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(i18n.t('helpRequestSent'));
      }
    } catch (error) {
      console.error('发送求助请求失败:', error);
      alert('发送失败，请检查网络连接');
    }
  };

  // 解决预警
  const handleResolveAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_URL}/api/alerts/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertId })
      });

      const result = await response.json();
      if (result.success) {
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('解决预警失败:', error);
    }
  };

  // 获取位置的最新数据
  const getLocationData = (location) => {
    return recentData.find(d => d.location === location) || null;
  };

  // 获取传感器类型图标
  const getSensorIcon = (type) => {
    const icons = {
      temperature: '🌡️',
      smoke: '💨',
      co: '☠️'
    };
    return icons[type] || '📊';
  };

  return (
    <div className="App">
      {/* 顶部状态栏 */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-icon">🔥</span>
            {i18n.t('appTitle')}
          </h1>
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {connected ? i18n.t('connected') : i18n.t('disconnected')}
          </div>
        </div>
        <div className="header-right">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      {/* 统计卡片栏 */}
      <div className="stats-bar">
        {statistics && (
          <>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{statistics.total || 0}</div>
                <div className="stat-label">{i18n.t('totalAlerts')}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{statistics.active || 0}</div>
                <div className="stat-label">{i18n.t('activeAlertsCount')}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-value">{statistics.today || 0}</div>
                <div className="stat-label">{i18n.t('todayAlerts')}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{statistics.accuracy || '100'}%</div>
                <div className="stat-label">{i18n.t('accuracy')}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 主要内容区域 - 网格布局 */}
      <div className="dashboard-grid">
        {/* 左上：实时传感器监控 */}
        <div className="dashboard-card sensor-monitor">
          <div className="card-header">
            <h2>📡 {i18n.t('realTimeMonitoring')}</h2>
          </div>
          <div className="sensor-grid">
            {['一楼大厅', '二楼走廊', '三楼办公室', '地下室'].map(location => {
              const data = getLocationData(location);
              return (
                <div 
                  key={location} 
                  className={`sensor-item ${selectedLocation === location ? 'selected' : ''}`}
                  onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                >
                  <div className="sensor-location">{location}</div>
                  <div className="sensor-values">
                    <div className="sensor-value">
                      <span className="sensor-label">🌡️ {i18n.t('temperature')}</span>
                      <span className="sensor-number">{data ? data.temperature.toFixed(1) : '--'}°C</span>
                    </div>
                    <div className="sensor-value">
                      <span className="sensor-label">💨 {i18n.t('smoke')}</span>
                      <span className="sensor-number">{data ? data.smoke.toFixed(1) : '--'}ppm</span>
                    </div>
                    <div className="sensor-value">
                      <span className="sensor-label">☠️ {i18n.t('co')}</span>
                      <span className="sensor-number">{data ? data.co.toFixed(1) : '--'}ppm</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右上：火点地图 */}
        <div className="dashboard-card fire-map">
          <div className="card-header">
            <h2>🗺️ {i18n.t('firePoints')}</h2>
          </div>
          <div className="fire-points-map">
            {firePoints.length === 0 ? (
              <div className="no-fire-points">
                <div className="empty-icon">✅</div>
                <div className="empty-text">{i18n.t('noActiveAlerts')}</div>
              </div>
            ) : (
              firePoints.map((point, index) => (
                <div 
                  key={index} 
                  className={`fire-point fire-point-${point.level}`}
                  style={{
                    left: `${15 + (index % 3) * 30}%`,
                    top: `${20 + Math.floor(index / 3) * 30}%`
                  }}
                >
                  <div className="fire-point-marker"></div>
                  <div className="fire-point-label">{point.location}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 左下：预警列表 */}
        <div className="dashboard-card alerts-panel">
          <div className="card-header">
            <h2>🚨 {i18n.t('activeAlerts')}</h2>
            {activeAlerts.length > 0 && (
              <span className="alert-badge">{activeAlerts.length}</span>
            )}
          </div>
          <div className="alerts-list">
            {activeAlerts.length === 0 ? (
              <div className="no-alerts">
                <div className="empty-icon">✅</div>
                <div className="empty-text">{i18n.t('noActiveAlerts')}</div>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div key={alert.id} className={`alert-item alert-${alert.level}`}>
                  <div className="alert-icon">{getSensorIcon(alert.type)}</div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <span className="alert-type">{i18n.t(alert.type)}</span>
                      <span className="alert-level">{i18n.t(alert.level)}</span>
                    </div>
                    <div className="alert-location">📍 {alert.location}</div>
                    <div className="alert-message">{alert.message?.[language] || alert.message || i18n.t('alertReceived')}</div>
                  </div>
                  <button 
                    onClick={() => handleResolveAlert(alert.id)}
                    className="btn-resolve"
                    title={i18n.t('resolveAlert')}
                  >
                    ✓
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右下：实时数据流和统计 */}
        <div className="dashboard-card data-stream">
          <div className="card-header">
            <h2>📈 {i18n.t('statistics')}</h2>
          </div>
          <div className="data-content">
            {sensorStats && (
              <div className="sensor-stats">
                <div className="stat-row">
                  <span className="stat-name">平均温度</span>
                  <span className="stat-number">{sensorStats.avgTemperature?.toFixed(1) || '--'}°C</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">平均烟雾</span>
                  <span className="stat-number">{sensorStats.avgSmoke?.toFixed(1) || '--'}ppm</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">平均CO</span>
                  <span className="stat-number">{sensorStats.avgCO?.toFixed(1) || '--'}ppm</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">总记录数</span>
                  <span className="stat-number">{sensorStats.totalRecords || 0}</span>
                </div>
              </div>
            )}
            <div className="recent-data">
              <h3>最近数据</h3>
              <div className="data-list">
                {recentData.slice(0, 5).map((data, index) => (
                  <div key={index} className="data-item">
                    <span className="data-location">{data.location}</span>
                    <span className="data-values">
                      {data.temperature.toFixed(1)}°C / {data.smoke.toFixed(1)}ppm / {data.co.toFixed(1)}ppm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="action-bar">
        <button 
          onClick={handleHelpRequest}
          className="btn-help"
        >
          <span className="help-icon">🆘</span>
          <span className="help-text">{i18n.t('help')}</span>
        </button>
      </div>

    </div>
  );
}

export default App;
