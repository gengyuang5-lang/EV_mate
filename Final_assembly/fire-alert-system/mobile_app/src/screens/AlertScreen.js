/**
 * 预警列表页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebSocketService from '../services/websocket';
import { getActiveAlerts, resolveAlert } from '../services/api';
import { COLORS, ALERT_LEVELS } from '../utils/constants';
import AlertPopup from '../components/AlertPopup';

const AlertScreen = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    loadAlerts();

    // 订阅WebSocket事件
    WebSocketService.on('alert', handleNewAlert);
    WebSocketService.on('alert_resolved', handleAlertResolved);

    return () => {
      WebSocketService.off('alert', handleNewAlert);
      WebSocketService.off('alert_resolved', handleAlertResolved);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await getActiveAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('加载预警失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNewAlert = (alert) => {
    setAlerts(prev => {
      const exists = prev.find(a => a.id === alert.id);
      if (exists) return prev;
      return [alert, ...prev];
    });
    // 显示弹窗
    setSelectedAlert(alert);
    setShowPopup(true);
  };

  const handleAlertResolved = (data) => {
    setAlerts(prev => prev.filter(a => a.id !== data.alertId));
  };

  const handleResolve = async (alertId) => {
    try {
      const response = await resolveAlert(alertId);
      if (response.success) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('解决预警失败:', error);
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      temperature: 'device-thermostat',
      smoke: 'cloud',
      co: 'warning'
    };
    return icons[type] || 'warning';
  };

  const getAlertColor = (level) => {
    const colors = {
      warning: COLORS.WARNING,
      alert: COLORS.DANGER,
      critical: COLORS.CRITICAL
    };
    return colors[level] || COLORS.TEXT_SECONDARY;
  };

  const renderAlertItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.alertItem, { borderLeftColor: getAlertColor(item.level) }]}
      onPress={() => {
        setSelectedAlert(item);
        setShowPopup(true);
      }}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Icon
            name={getAlertIcon(item.type)}
            size={24}
            color={getAlertColor(item.level)}
          />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertTitleRow}>
            <Text style={styles.alertType}>{t(item.type)}</Text>
            <View style={[styles.alertLevelBadge, { backgroundColor: getAlertColor(item.level) }]}>
              <Text style={styles.alertLevelText}>{t(item.level)}</Text>
            </View>
          </View>
          <Text style={styles.alertLocation}>📍 {item.location}</Text>
          <Text style={styles.alertMessage} numberOfLines={2}>
            {typeof item.message === 'object' 
              ? (item.message?.[i18n.language] || item.message?.zh || item.message?.en || t('alertReceived'))
              : (item.message || t('alertReceived'))}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.resolveButton}
          onPress={() => handleResolve(item.id)}
        >
          <Icon name="check-circle" size={28} color={COLORS.SUCCESS} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={64} color={COLORS.SUCCESS} />
          <Text style={styles.emptyText}>{t('noActiveAlerts')}</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadAlerts}
              colors={[COLORS.PRIMARY]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {showPopup && selectedAlert && (
        <AlertPopup
          alert={selectedAlert}
          visible={showPopup}
          onClose={() => {
            setShowPopup(false);
            setSelectedAlert(null);
          }}
          onResolve={() => {
            handleResolve(selectedAlert.id);
            setShowPopup(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  alertLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertLevelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertLocation: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  resolveButton: {
    marginLeft: 8,
  },
});

export default AlertScreen;

