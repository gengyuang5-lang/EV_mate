/**
 * 建筑平面图视图组件（简化版，不使用SVG）
 * 使用React Native基本组件绘制建筑平面图和逃生路线
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_WIDTH = SCREEN_WIDTH;
const MAP_HEIGHT = SCREEN_HEIGHT * 0.7; // 地图占屏幕70%高度

const BuildingMapView = ({ 
  currentLocation, 
  exitLocation, 
  escapeRoute, 
  firePoints = [] 
}) => {
  // 建筑平面图坐标系统（相对坐标，0-100）
  const scaleX = MAP_WIDTH / 100;
  const scaleY = MAP_HEIGHT / 150;
  
  const toScreenX = (x) => x * scaleX;
  const toScreenY = (y) => y * scaleY;

  // 房间数据
  const rooms = [
    { x: 0, y: 0, width: 15, height: 20, id: 'room-101' },
    { x: 0, y: 20, width: 15, height: 20, id: 'room-102' },
    { x: 0, y: 40, width: 15, height: 20, id: 'room-103' },
    { x: 0, y: 60, width: 15, height: 20, id: 'room-104' },
    { x: 0, y: 80, width: 15, height: 20, id: 'room-105' },
    { x: 30, y: 0, width: 20, height: 20, id: 'room-201' },
    { x: 30, y: 20, width: 20, height: 20, id: 'room-202' },
    { x: 30, y: 40, width: 20, height: 20, id: 'room-203' },
    { x: 30, y: 60, width: 20, height: 20, id: 'room-204' },
    { x: 30, y: 80, width: 20, height: 20, id: 'room-205' },
  ];

  // 计算逃生路线路径点
  const getRoutePoints = () => {
    if (!escapeRoute || !escapeRoute.path || escapeRoute.path.length < 2) {
      return [];
    }

    // 简化的路径：从左上角房间到楼梯
    return [
      { x: 7.5, y: 10 },      // 起点：左上角房间
      { x: 22.5, y: 10 },     // 进入走廊
      { x: 22.5, y: 100 },    // 沿走廊向下
      { x: 77.5, y: 100 },    // 右转到楼梯
      { x: 77.5, y: 105 },    // 终点：楼梯
    ];
  };

  const routePoints = getRoutePoints();

  return (
    <View style={styles.container}>
      {/* 背景 */}
      <View style={styles.background} />
      
      {/* 绘制房间 */}
      {rooms.map((room) => (
        <View
          key={room.id}
          style={[
            styles.room,
            {
              left: toScreenX(room.x),
              top: toScreenY(room.y),
              width: toScreenX(room.width),
              height: toScreenY(room.height),
            },
          ]}
        />
      ))}

      {/* 绘制主垂直走廊 */}
      <View
        style={[
          styles.corridor,
          {
            left: toScreenX(15),
            top: toScreenY(0),
            width: toScreenX(15),
            height: toScreenY(100),
          },
        ]}
      />

      {/* 绘制横向走廊 */}
      <View
        style={[
          styles.corridor,
          {
            left: toScreenX(15),
            top: toScreenY(100),
            width: toScreenX(55),
            height: toScreenY(10),
          },
        ]}
      />

      {/* 绘制楼梯 */}
      <View
        style={[
          styles.staircase,
          {
            left: toScreenX(70),
            top: toScreenY(100),
            width: toScreenX(15),
            height: toScreenY(10),
          },
        ]}
      >
        <Text style={styles.staircaseText}>楼梯</Text>
      </View>

      {/* 绘制逃生路线 */}
      {routePoints.length > 1 && (
        <View style={styles.routeContainer}>
          {routePoints.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = routePoints[index - 1];
            const isHorizontal = Math.abs(point.y - prevPoint.y) < 1;
            
            return (
              <View
                key={`route-${index}`}
                style={[
                  styles.routeLine,
                  {
                    left: toScreenX(Math.min(prevPoint.x, point.x)),
                    top: toScreenY(isHorizontal ? prevPoint.y : Math.min(prevPoint.y, point.y)),
                    width: isHorizontal 
                      ? toScreenX(Math.abs(point.x - prevPoint.x))
                      : 6,
                    height: isHorizontal 
                      ? 6
                      : toScreenY(Math.abs(point.y - prevPoint.y)),
                    backgroundColor: '#22c55e',
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {/* 绘制当前位置 */}
      {currentLocation && (
        <View
          style={[
            styles.currentLocation,
            {
              left: toScreenX(7.5) - 12,
              top: toScreenY(10) - 12,
            },
          ]}
        >
          <View style={styles.currentLocationDot} />
        </View>
      )}

      {/* 绘制出口 */}
      {exitLocation && (
        <View
          style={[
            styles.exit,
            {
              left: toScreenX(77.5) - 12,
              top: toScreenY(105) - 12,
            },
          ]}
        >
          <View style={styles.exitDot} />
          <Text style={styles.exitText}>
            {exitLocation.name || '出口'}
          </Text>
        </View>
      )}

      {/* 绘制火点 */}
      {firePoints.map((point, index) => {
        const roomX = 5 + (index % 2) * 30;
        const roomY = 10 + Math.floor(index / 2) * 20;
        
        return (
          <View
            key={`fire-${index}`}
            style={[
              styles.firePoint,
              {
                left: toScreenX(roomX) - 8,
                top: toScreenY(roomY) - 8,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
  },
  room: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#666',
  },
  corridor: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderWidth: 2,
    borderColor: '#999',
  },
  staircase: {
    position: 'absolute',
    backgroundColor: 'rgba(150, 150, 150, 0.5)',
    borderWidth: 2,
    borderColor: '#777',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staircaseText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  routeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  routeLine: {
    position: 'absolute',
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocation: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  exit: {
    position: 'absolute',
    alignItems: 'center',
  },
  exitDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    borderWidth: 3,
    borderColor: '#fff',
  },
  exitText: {
    marginTop: 4,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  firePoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default BuildingMapView;
