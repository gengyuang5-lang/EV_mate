/**
 * 火点标记组件
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const FirePointMarker = ({ level = 'alert' }) => {
  const getMarkerColor = () => {
    const colors = {
      warning: COLORS.WARNING,
      alert: COLORS.DANGER,
      critical: COLORS.CRITICAL
    };
    return colors[level] || COLORS.DANGER;
  };

  const getMarkerSize = () => {
    const sizes = {
      warning: 20,
      alert: 24,
      critical: 28
    };
    return sizes[level] || 24;
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.marker,
          {
            width: getMarkerSize(),
            height: getMarkerSize(),
            backgroundColor: getMarkerColor(),
            borderRadius: getMarkerSize() / 2,
          }
        ]}
      >
        <View style={styles.innerDot} />
      </View>
      <View
        style={[
          styles.pulse,
          {
            width: getMarkerSize() * 2,
            height: getMarkerSize() * 2,
            borderRadius: getMarkerSize(),
            borderColor: getMarkerColor(),
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pulse: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.3,
  },
});

export default FirePointMarker;

