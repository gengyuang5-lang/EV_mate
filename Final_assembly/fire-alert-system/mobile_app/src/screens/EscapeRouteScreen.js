/**
 * 逃生路线显示页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCurrentPosition, requestLocationPermission } from '../services/location';
import { calculateEscapeRoute, getNearestExit } from '../services/pathPlanning';
import { getActiveAlerts } from '../services/api';
import { COLORS, MAP_CONFIG } from '../utils/constants';
import BuildingMapView from '../components/BuildingMapView';

const EscapeRouteScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [escapeRoute, setEscapeRoute] = useState(null);
  const [exitLocation, setExitLocation] = useState(null);
  const [firePoints, setFirePoints] = useState([]);
  const [region, setRegion] = useState({
    latitude: MAP_CONFIG.INITIAL_LATITUDE,
    longitude: MAP_CONFIG.INITIAL_LONGITUDE,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    initializeRoute();
  }, []);

  const initializeRoute = async () => {
    try {
      setLoading(true);
      
      // 请求位置权限
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        // 即使没有权限，也使用默认位置显示地图
        const defaultPosition = {
          latitude: MAP_CONFIG.INITIAL_LATITUDE,
          longitude: MAP_CONFIG.INITIAL_LONGITUDE
        };
        setCurrentLocation(defaultPosition);
        setRegion({
          latitude: defaultPosition.latitude,
          longitude: defaultPosition.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        await calculateRoute(defaultPosition);
        setLoading(false);
        return;
      }

      // 获取当前位置
      let position;
      try {
        position = await getCurrentPosition();
      } catch (error) {
        console.warn('获取位置失败，使用默认位置:', error);
        position = {
          latitude: MAP_CONFIG.INITIAL_LATITUDE,
          longitude: MAP_CONFIG.INITIAL_LONGITUDE
        };
      }
      
      setCurrentLocation(position);
      
      // 更新地图区域
      setRegion({
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      // 获取火点信息
      await loadFirePoints();

      // 计算逃生路线
      await calculateRoute(position);
    } catch (error) {
      console.error('初始化路线失败:', error);
      // 即使出错也显示地图
      const defaultPosition = {
        latitude: MAP_CONFIG.INITIAL_LATITUDE,
        longitude: MAP_CONFIG.INITIAL_LONGITUDE
      };
      setCurrentLocation(defaultPosition);
      setRegion({
        latitude: defaultPosition.latitude,
        longitude: defaultPosition.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFirePoints = async () => {
    try {
      const response = await getActiveAlerts();
      if (response.success && response.data) {
        const points = response.data
          .filter(alert => alert.coordinates)
          .map(alert => ({
            id: alert.id,
            latitude: alert.coordinates.lat || alert.coordinates.latitude,
            longitude: alert.coordinates.lng || alert.coordinates.longitude,
            level: alert.level,
            location: alert.location
          }));
        setFirePoints(points);
      }
    } catch (error) {
      console.error('加载火点失败:', error);
    }
  };

  const calculateRoute = async (startLocation) => {
    try {
      setCalculating(true);

      // 获取最近的出口
      let exit;
      try {
        exit = await getNearestExit(startLocation);
      } catch (error) {
        console.warn('获取出口失败，使用默认出口:', error);
        // 创建默认出口（距离当前位置100米）
        exit = {
          latitude: startLocation.latitude + 0.0009,
          longitude: startLocation.longitude + 0.0009,
          name: '最近出口',
          distance: 100
        };
      }
      setExitLocation(exit);

      // 计算逃生路线
      let route;
      try {
        route = await calculateEscapeRoute(
          startLocation,
          exit,
          firePoints
        );
      } catch (error) {
        console.warn('路径计算失败，使用简单路径:', error);
        // 创建简单的直线路径
        const distance = Math.sqrt(
          Math.pow((exit.latitude - startLocation.latitude) * 111000, 2) +
          Math.pow((exit.longitude - startLocation.longitude) * 111000 * Math.cos(startLocation.latitude * Math.PI / 180), 2)
        );
        route = {
          success: true,
          path: [startLocation, exit],
          distance: distance,
          estimatedTime: Math.ceil(distance / 1.4)
        };
      }

      if (route && route.success) {
        setEscapeRoute(route);
        
        // 调整地图区域以显示完整路线
        if (route.path && route.path.length > 0) {
          const allPoints = [startLocation, exit, ...route.path];
          const lats = allPoints.map(p => p.latitude).filter(lat => lat != null);
          const lngs = allPoints.map(p => p.longitude).filter(lng => lng != null);
          
          if (lats.length > 0 && lngs.length > 0) {
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            setRegion({
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
              latitudeDelta: Math.max(maxLat - minLat, 0.005) * 1.5,
              longitudeDelta: Math.max(maxLng - minLng, 0.005) * 1.5,
            });
          }
        }
      } else {
        // 即使失败也创建基本路线
        const distance = exit.distance || 100;
        const simpleRoute = {
          success: true,
          path: [startLocation, exit],
          distance: distance,
          estimatedTime: Math.ceil(distance / 1.4)
        };
        setEscapeRoute(simpleRoute);
      }
    } catch (error) {
      console.error('计算路线失败:', error);
      // 创建最基本的路线
      if (startLocation && exitLocation) {
        const distance = exitLocation.distance || 100;
        const simpleRoute = {
          success: true,
          path: [startLocation, exitLocation],
          distance: distance,
          estimatedTime: Math.ceil(distance / 1.4)
        };
        setEscapeRoute(simpleRoute);
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleRecalculate = async () => {
    if (!currentLocation) {
      await initializeRoute();
    } else {
      await calculateRoute(currentLocation);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>{t('calculatingRoute')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 使用建筑平面图视图 */}
      <BuildingMapView
        currentLocation={currentLocation}
        exitLocation={exitLocation}
        escapeRoute={escapeRoute}
        firePoints={firePoints}
      />

      {/* 信息面板 */}
      <View style={styles.infoPanel}>
        <View style={styles.infoHeader}>
          <Icon name="directions-run" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.infoTitle}>{t('escapeRoute')}</Text>
          <TouchableOpacity
            onPress={handleRecalculate}
            disabled={calculating}
            style={styles.refreshButton}
          >
            {calculating ? (
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            ) : (
              <Icon name="refresh" size={24} color={COLORS.PRIMARY} />
            )}
          </TouchableOpacity>
        </View>

        {escapeRoute && (
          <View style={styles.routeInfo}>
            <View style={styles.infoRow}>
              <Icon name="straighten" size={20} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>{t('distance')}:</Text>
              <Text style={styles.infoValue}>
                {escapeRoute.distance ? `${Math.round(escapeRoute.distance)}m` : '--'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="access-time" size={20} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>{t('estimatedTime')}:</Text>
              <Text style={styles.infoValue}>
                {escapeRoute.estimatedTime ? `${escapeRoute.estimatedTime}s` : '--'}
              </Text>
            </View>
            {exitLocation && (
              <View style={styles.infoRow}>
                <Icon name="exit-to-app" size={20} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.infoLabel}>{t('exit')}:</Text>
                <Text style={styles.infoValue}>
                  {exitLocation.name || t('nearestExit')}
                </Text>
              </View>
            )}
          </View>
        )}

        {!escapeRoute && !calculating && (
          <Text style={styles.noRouteText}>{t('noRouteAvailable')}</Text>
        )}
      </View>
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
  currentLocationMarker: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  exitMarker: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 20,
    padding: 4,
  },
  fireMarker: {
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 14,
    padding: 2,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  refreshButton: {
    padding: 4,
  },
  routeInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  noRouteText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EscapeRouteScreen;

