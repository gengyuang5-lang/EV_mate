/**
 * 一键求助页面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestHelp } from '../services/api';
import { getCurrentPosition, requestLocationPermission } from '../services/location';
import { COLORS } from '../utils/constants';

const HelpScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setLocationLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const position = await getCurrentPosition();
        setLocation(position);
      } else {
        Alert.alert(
          t('location'),
          '需要位置权限才能发送求助请求',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('获取位置失败:', error);
      Alert.alert('错误', '获取位置失败，请检查GPS设置');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRequestHelp = async () => {
    if (!location) {
      Alert.alert('提示', '正在获取位置信息，请稍候...');
      await loadLocation();
      return;
    }

    setLoading(true);
    try {
      const response = await requestHelp({
        location: `纬度: ${location.latitude.toFixed(6)}, 经度: ${location.longitude.toFixed(6)}`,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude
        },
        message: t('helpMessage')
      });

      if (response.success) {
        Alert.alert(
          t('help'),
          t('helpRequestSent'),
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      console.error('发送求助失败:', error);
      Alert.alert('错误', '发送求助请求失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Icon name="help" size={64} color={COLORS.PRIMARY} />
        <Text style={styles.title}>{t('help')}</Text>
        <Text style={styles.subtitle}>{t('requestHelp')}</Text>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Icon name="location-on" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.locationTitle}>{t('currentLocation')}</Text>
        </View>
        {locationLoading ? (
          <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        ) : location ? (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              纬度: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              经度: {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.accuracyText}>
              精度: ±{Math.round(location.accuracy)}米
            </Text>
          </View>
        ) : (
          <Text style={styles.noLocationText}>未获取到位置信息</Text>
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadLocation}
          disabled={locationLoading}
        >
          <Icon name="refresh" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.refreshButtonText}>刷新位置</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.helpButton, loading && styles.helpButtonDisabled]}
        onPress={handleRequestHelp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <Icon name="emergency" size={32} color="#fff" />
            <Text style={styles.helpButtonText}>{t('requestHelp')}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Icon name="info" size={24} color={COLORS.TEXT_SECONDARY} />
        <Text style={styles.infoText}>
          点击求助按钮将发送您的当前位置和求助信息到服务器，救援人员将尽快赶到。
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 8,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  noLocationText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: 4,
  },
  helpButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  helpButtonDisabled: {
    opacity: 0.6,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default HelpScreen;

