/**
 * 首页 - 实时火点地图显示
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebSocketService from '../services/websocket';
import { getActiveAlerts } from '../services/api';
import { MAP_CONFIG, COLORS } from '../utils/constants';
import FirePointMarker from '../components/FirePointMarker';

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [firePoints, setFirePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: MAP_CONFIG.INITIAL_LATITUDE,
    longitude: MAP_CONFIG.INITIAL_LONGITUDE,
    latitudeDelta: MAP_CONFIG.INITIAL_DELTA,
    longitudeDelta: MAP_CONFIG.INITIAL_DELTA,
  });

  useEffect(() => {
    // 加载初始数据
    loadFirePoints();

    // 订阅WebSocket事件
    WebSocketService.on('fire_point', handleFirePoint);
    WebSocketService.on('alert', handleAlert);
    WebSocketService.on('alert_resolved', handleAlertResolved);

    return () => {
      // 清理订阅
      WebSocketService.off('fire_point', handleFirePoint);
      WebSocketService.off('alert', handleAlert);
      WebSocketService.off('alert_resolved', handleAlertResolved);
    };
  }, []);

  const loadFirePoints = async () => {
    try {
      const response = await getActiveAlerts();
      if (response.success) {
        const points = response.data.map(alert => ({
          id: alert.id,
          location: alert.location,
          coordinates: alert.coordinates || { lat: region.latitude, lng: region.longitude },
          level: alert.level,
          type: alert.type,
          timestamp: alert.timestamp
        }));
        setFirePoints(points);
      }
    } catch (error) {
      console.error('加载火点失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAlert = (alert) => {
    // 添加火点到地图
    if (alert.coordinates) {
      handleFirePoint({
        location: alert.location,
        coordinates: alert.coordinates,
        level: alert.level,
        type: alert.type,
        timestamp: alert.timestamp
      });
    }
  };

  const handleAlertResolved = (data) => {
    setFirePoints(prev => prev.filter(p => p.location !== data.location));
  };

  const handleMarkerPress = (point) => {
    Alert.alert(
      t('firePoints'),
      `${t('location')}: ${point.location}\n${t('status')}: ${t(point.level)}`,
      [{ text: t('resolveAlert'), onPress: () => {} }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>{t('realTimeMonitoring')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {firePoints.map((point, index) => (
          <Marker
            key={point.id || index}
            coordinate={{
              latitude: point.coordinates.lat || point.coordinates.latitude,
              longitude: point.coordinates.lng || point.coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(point)}
          >
            <FirePointMarker level={point.level} />
          </Marker>
        ))}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {t('activeAlerts')}: {firePoints.length}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.escapeRouteButton}
        onPress={() => navigation.navigate('EscapeRoute')}
      >
        <Icon name="directions-run" size={24} color="#fff" />
        <Text style={styles.escapeRouteButtonText}>{t('escapeRoute')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  infoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  escapeRouteButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  escapeRouteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default HomeScreen;

