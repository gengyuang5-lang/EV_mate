/**
 * 预警弹窗组件
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../utils/constants';

const AlertPopup = ({ alert, visible, onClose, onResolve }) => {
  const { t, i18n } = useTranslation();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    if (visible) {
      // 播放语音
      playAlertSound();

      // 动画效果
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // 5秒后自动关闭
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const playAlertSound = () => {
    // 使用TTS播放语音
    // 这里可以使用 react-native-tts 或其他TTS库
    const message = typeof alert?.message === 'object' 
      ? alert?.message?.[i18n.language] || alert?.message?.zh || alert?.message?.en
      : alert?.message;
    console.log('播放预警语音:', message);
  };

  const getAlertColor = (level) => {
    const colors = {
      warning: COLORS.WARNING,
      alert: COLORS.DANGER,
      critical: COLORS.CRITICAL
    };
    return colors[level] || COLORS.DANGER;
  };

  const getAlertIcon = (type) => {
    const icons = {
      temperature: 'device-thermostat',
      smoke: 'cloud',
      co: 'warning'
    };
    return icons[type] || 'warning';
  };

  if (!alert) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.header, { backgroundColor: getAlertColor(alert.level) }]}>
            <Icon
              name={getAlertIcon(alert.type)}
              size={32}
              color="#fff"
            />
            <Text style={styles.headerText}>{t('alertReceived')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>{t('location')}:</Text>
              <Text style={styles.infoValue}>{alert.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="info" size={20} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.infoLabel}>{t('status')}:</Text>
              <Text style={[styles.infoValue, { color: getAlertColor(alert.level) }]}>
                {t(alert.level)}
              </Text>
            </View>

            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                {typeof alert.message === 'object' 
                  ? (alert.message?.[i18n.language] || alert.message?.zh || alert.message?.en || t('alertMessage'))
                  : (alert.message || t('alertMessage'))}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.resolveButton]}
              onPress={() => {
                onResolve();
                onClose();
              }}
            >
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>{t('resolveAlert')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
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
  messageContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resolveButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default AlertPopup;

