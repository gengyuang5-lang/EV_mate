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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCurrentPosition, requestLocationPermission } from '../services/location';
import { calculateEscapeRoute, getNearestExit } from '../services/pathPlanning';
import { getActiveAlerts } from '../services/api';
import { COLORS, MAP_CONFIG } from '../utils/constants';

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
        Alert.alert(t('permissionDenied'), t('locationPermissionRequired'));
        setLoading(false);
        return;
      }

      // 获取当前位置
      const position = await getCurrentPosition();
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
      Alert.alert(t('error'), t('failedToInitializeRoute'));
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
      const exit = await getNearestExit(startLocation);
      setExitLocation(exit);

      // 计算逃生路线
      const route = await calculateEscapeRoute(
        startLocation,
        exit,
        firePoints
      );

      if (route.success) {
        setEscapeRoute(route);
        
        // 调整地图区域以显示完整路线
        if (route.path && route.path.length > 0) {
          const allPoints = [startLocation, exit, ...route.path];
          const lats = allPoints.map(p => p.latitude);
          const lngs = allPoints.map(p => p.longitude);
          
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
      } else {
        Alert.alert(t('error'), t('failedToCalculateRoute'));
      }
    } catch (error) {
      console.error('计算路线失败:', error);
      Alert.alert(t('error'), t('failedToCalculateRoute'));
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
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {/* 当前位置标记 */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title={t('currentLocation')}
            pinColor={COLORS.SUCCESS}
          >
            <View style={styles.currentLocationMarker}>
              <Icon name="my-location" size={32} color={COLORS.SUCCESS} />
            </View>
          </Marker>
        )}

        {/* 出口标记 */}
        {exitLocation && (
          <Marker
            coordinate={exitLocation}
            title={exitLocation.name || t('exit')}
            pinColor={COLORS.PRIMARY}
          >
            <View style={styles.exitMarker}>
              <Icon name="exit-to-app" size={32} color={COLORS.PRIMARY} />
            </View>
          </Marker>
        )}

        {/* 火点标记 */}
        {firePoints.map((point, index) => (
          <Marker
            key={point.id || index}
            coordinate={point}
            title={point.location || t('firePoint')}
          >
            <View style={styles.fireMarker}>
              <Icon name="local-fire-department" size={28} color={COLORS.DANGER} />
            </View>
          </Marker>
        ))}

        {/* 逃生路线 */}
        {escapeRoute && escapeRoute.path && escapeRoute.path.length > 1 && (
          <Polyline
            coordinates={escapeRoute.path}
            strokeColor={COLORS.WARNING}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

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

