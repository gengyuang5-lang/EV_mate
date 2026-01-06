# 移动端 App 演示说明

## 📱 App 功能概览

### 主要功能模块

1. **🏠 首页 - 实时火点地图**
2. **⚠️ 预警列表页面**
3. **🆘 一键求助功能**
4. **⚙️ 设置页面**

---

## 🏠 首页 - 实时火点地图 (HomeScreen)

### 功能特性

- ✅ **实时火点显示**：地图上显示所有活跃火点
- ✅ **动态标记**：不同级别的火点用不同颜色和大小标记
- ✅ **WebSocket 实时更新**：火点信息实时同步
- ✅ **点击查看详情**：点击标记查看火点详细信息

### 界面展示

```
┌─────────────────────────────────┐
│  🔥 活跃预警: 3                  │ ← 信息栏
├─────────────────────────────────┤
│                                 │
│         🗺️ 地图区域              │
│                                 │
│      🔴 (火点标记)               │
│         ⚠️                      │
│                                 │
│              🔴                 │
│                                 │
│    🔴                            │
│                                 │
└─────────────────────────────────┘
```

### 火点标记说明

- **🟡 黄色 (warning)**：警告级别，尺寸 20px
- **🔴 红色 (alert)**：警报级别，尺寸 24px
- **🟠 橙色 (critical)**：严重级别，尺寸 28px

### 代码实现亮点

```12:18:fire-alert-system/mobile_app/src/screens/HomeScreen.js
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import WebSocketService from '../services/websocket';
import { getActiveAlerts } from '../services/api';
import { MAP_CONFIG, COLORS } from '../utils/constants';
import FirePointMarker from '../components/FirePointMarker';
```

- 使用 `react-native-maps` 显示地图
- WebSocket 实时接收火点数据
- 自定义 `FirePointMarker` 组件显示火点

---

## ⚠️ 预警列表页面 (AlertScreen)

### 功能特性

- ✅ **预警列表展示**：显示所有活跃预警
- ✅ **实时推送**：新预警自动弹窗显示
- ✅ **语音播报**：预警时自动播放语音
- ✅ **下拉刷新**：手动刷新预警列表
- ✅ **解决预警**：点击解决按钮标记预警已处理

### 界面展示

```
┌─────────────────────────────────┐
│  ⚠️ 预警列表                     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ 🌡️ 温度预警  [严重]         │ │
│ │ 📍 3楼会议室                 │ │
│ │ 温度异常升高，请立即检查...  │ │
│ │                    ✅       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ☁️ 烟雾预警  [警报]          │ │
│ │ 📍 1楼大厅                  │ │
│ │ 检测到烟雾，请疏散...       │ │
│ │                    ✅       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚠️ CO预警   [警告]           │ │
│ │ 📍 地下车库                  │ │
│ │ CO浓度超标...               │ │
│ │                    ✅       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 预警弹窗 (AlertPopup)

当收到新预警时，自动弹出模态窗口：

```
        ┌─────────────────────┐
        │ 🔥 收到预警      ✕   │ ← 红色/橙色/黄色头部
        ├─────────────────────┤
        │ 📍 位置: 3楼会议室   │
        │ ℹ️ 状态: 严重        │
        │                     │
        │ ┌─────────────────┐ │
        │ │ 温度异常升高，   │ │
        │ │ 请立即检查...    │ │
        │ └─────────────────┘ │
        │                     │
        │  [✅ 已解决]         │
        └─────────────────────┘
```

### 代码实现亮点

```58:67:fire-alert-system/mobile_app/src/screens/AlertScreen.js
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
```

- 自动去重，避免重复预警
- 新预警自动弹窗显示
- 支持语音播报（TTS）

---

## 🆘 一键求助功能 (HelpScreen)

### 功能特性

- ✅ **GPS 定位**：自动获取当前位置
- ✅ **发送求助请求**：一键发送求助信息到服务器
- ✅ **求助状态显示**：显示求助发送状态
- ✅ **位置信息展示**：显示详细位置信息

### 界面展示

```
┌─────────────────────────────────┐
│  🆘 一键求助                     │
├─────────────────────────────────┤
│                                 │
│         📍                      │
│                                 │
│     当前位置                    │
│                                 │
│  📍 3楼会议室                    │
│  📊 经度: 116.3974              │
│  📊 纬度: 39.9093               │
│                                 │
│  ┌───────────────────────────┐ │
│  │    🆘 发送求助请求          │ │
│  └───────────────────────────┘ │
│                                 │
│  状态: ✅ 求助已发送            │
│                                 │
└─────────────────────────────────┘
```

---

## ⚙️ 设置页面 (SettingsScreen)

### 功能特性

- ✅ **多语言切换**：支持中文/英文切换
- ✅ **主题设置**：深色/浅色模式
- ✅ **通知设置**：预警通知开关
- ✅ **关于信息**：App 版本信息

### 界面展示

```
┌─────────────────────────────────┐
│  ⚙️ 设置                         │
├─────────────────────────────────┤
│                                 │
│  🌐 语言                        │
│  中文  [●]  English  [ ]       │
│                                 │
│  🎨 主题                        │
│  浅色  [●]  深色  [ ]           │
│                                 │
│  🔔 通知                        │
│  预警通知  [✓]                  │
│                                 │
│  ℹ️ 关于                        │
│  版本: 1.0.0                    │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 实时数据流

### WebSocket 连接流程

```
App 启动
  ↓
连接 WebSocket
  ↓
订阅事件:
  - fire_point (新火点)
  - alert (新预警)
  - alert_resolved (预警解决)
  ↓
实时接收数据
  ↓
更新 UI
```

### 数据更新示例

```javascript
// 收到新火点
WebSocketService.on('fire_point', (point) => {
  // 在地图上添加/更新火点标记
  setFirePoints(prev => [...prev, point]);
});

// 收到新预警
WebSocketService.on('alert', (alert) => {
  // 添加到预警列表
  setAlerts(prev => [alert, ...prev]);
  // 显示弹窗
  setShowPopup(true);
});
```

---

## 🎨 UI/UX 特性

### 1. 火点标记动画

```28:54:fire-alert-system/mobile_app/src/components/FirePointMarker.js
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
```

- 脉冲动画效果
- 不同级别不同颜色和大小
- 阴影效果增强视觉层次

### 2. 预警弹窗动画

```29:41:fire-alert-system/mobile_app/src/components/AlertPopup.js
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
```

- 淡入 + 缩放动画
- 5 秒后自动关闭
- 语音播报提醒

---

## 🚀 运行演示

### 1. 安装依赖

```bash
cd fire-alert-system/mobile_app
npm install
```

### 2. 配置 API 地址

编辑 `src/utils/constants.js`：

```javascript
export const API_URL = 'http://localhost:3000';
export const WS_URL = 'ws://localhost:3000';
```

### 3. 启动后端服务

```bash
cd ../backend
npm start
```

### 4. 运行 App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

---

## 📊 功能演示流程

### 场景 1：火点触发

1. 后端传感器检测到火点
2. WebSocket 推送火点数据到 App
3. 地图上显示红色火点标记
4. 预警列表自动添加新预警
5. 弹窗显示预警详情
6. 语音播报预警内容

### 场景 2：用户求助

1. 用户点击"一键求助"
2. App 获取 GPS 位置
3. 发送求助请求到服务器
4. 显示"求助已发送"状态
5. 后台接收求助信息并处理

### 场景 3：预警解决

1. 用户点击"已解决"按钮
2. 发送解决请求到服务器
3. 火点标记从地图移除
4. 预警从列表中移除

---

## 🔧 技术栈

- **框架**: React Native 0.72.6
- **导航**: React Navigation 6.x
- **地图**: React Native Maps
- **实时通信**: WebSocket
- **多语言**: react-i18next
- **UI 组件**: React Native Vector Icons

---

## 📝 后续功能规划

### 阶段 2 集成

- 🔜 **路径规划**：集成阶段 2 的路径规划模块
- 🔜 **数字孪生**：显示建筑 3D 模型
- 🔜 **导航指引**：橙色引导路径显示
- 🔜 **弱势群体模式**：老人/儿童/残障人士特殊路径

---

## 🎯 演示要点

1. **实时性**：WebSocket 实时推送，无延迟
2. **可视化**：地图直观显示火点位置
3. **交互性**：点击查看详情，一键操作
4. **多语言**：支持中英文切换
5. **用户体验**：动画效果，语音提醒

---

**创建时间**: 2024  
**版本**: 1.0.0  
**状态**: 基础功能完成，待集成阶段 2 路径规划功能

