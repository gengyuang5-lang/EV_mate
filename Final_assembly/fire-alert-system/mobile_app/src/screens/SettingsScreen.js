/**
 * 设置页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        
        <TouchableOpacity
          style={[
            styles.option,
            language === 'zh' && styles.optionSelected
          ]}
          onPress={() => handleLanguageChange('zh')}
        >
          <Text style={styles.optionText}>{t('chinese')}</Text>
          {language === 'zh' && (
            <Icon name="check" size={24} color={COLORS.PRIMARY} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            language === 'en' && styles.optionSelected
          ]}
          onPress={() => handleLanguageChange('en')}
        >
          <Text style={styles.optionText}>{t('english')}</Text>
          {language === 'en' && (
            <Icon name="check" size={24} color={COLORS.PRIMARY} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('connectionStatus')}</Text>
        <View style={styles.connectionInfo}>
          <Icon name="wifi" size={24} color={COLORS.SUCCESS} />
          <Text style={styles.connectionText}>{t('connected')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>功能</Text>
        <View style={styles.featureItem}>
          <View style={styles.featureInfo}>
            <Icon name="route" size={24} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.featureText}>{t('escapeRoutePlanning')}</Text>
          </View>
          <Text style={styles.comingSoonText}>{t('comingSoon')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  optionText: {
    fontSize: 18,
    color: COLORS.TEXT_PRIMARY,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectionText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 12,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;

