/**
 * 火灾预警系统 - 移动端App入口
 */

import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import './utils/i18n';
import WebSocketService from './services/websocket';
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from './utils/constants';

const App = () => {
  useEffect(() => {
    // 初始化WebSocket连接
    WebSocketService.connect();

    return () => {
      // 清理时断开连接
      WebSocketService.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.BACKGROUND}
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;

