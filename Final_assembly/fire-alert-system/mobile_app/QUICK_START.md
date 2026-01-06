# 🚀 快速启动指南

## ✅ 当前状态

- ✅ **后端服务**: 运行中 (http://localhost:3000)
- ✅ **Metro Bundler**: 运行中 (端口 8081)
- ✅ **Web前端**: 运行中 (http://localhost:3001) - **已在浏览器中打开**
- ⏳ **Android应用**: 需要Android设备/模拟器

## 📱 方式1：查看Web前端（已打开）

**访问地址**: http://localhost:3001

**功能预览**:
- ✅ 实时火点地图
- ✅ 预警列表
- ✅ 界面布局和样式
- ✅ 基本交互功能

**注意**: Web前端可以预览大部分UI效果，但某些原生功能（如位置定位）可能在Web版本中有限制。

## 📲 方式2：运行Android应用

### 步骤1：准备Android设备

#### 选项A：使用Android模拟器（推荐）

1. **打开Android Studio**
   - 启动Android Studio
   - 点击 "More Actions" > "Virtual Device Manager" 或 "Tools" > "Device Manager"

2. **创建或启动模拟器**
   - 如果没有模拟器，点击 "Create Device"
   - 选择设备型号（推荐：Pixel 5 或 Pixel 6）
   - 选择系统镜像（推荐：API 33 或更高）
   - 点击 "Finish" 创建
   - 点击 ▶️ 启动模拟器

3. **等待模拟器完全启动**
   - 等待直到模拟器显示Android桌面
   - 通常需要1-2分钟

#### 选项B：使用真实Android设备

1. **在手机上启用开发者模式**
   - 设置 > 关于手机
   - 连续点击"版本号"7次
   - 返回设置，找到"开发者选项"

2. **启用USB调试**
   - 设置 > 开发者选项
   - 启用"USB调试"
   - 启用"USB安装"

3. **连接手机到电脑**
   - 使用USB数据线连接
   - 在手机上允许USB调试
   - 选择"始终允许来自此计算机"

### 步骤2：验证设备连接

打开PowerShell或命令提示符，运行：

```powershell
# 如果adb在PATH中
adb devices

# 或者使用完整路径
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

**期望输出：**
```
List of devices attached
emulator-5554    device
```

或

```
List of devices attached
ABC123XYZ        device
```

如果显示 "unauthorized"，请在手机上允许USB调试。

### 步骤3：运行Android应用

在新的PowerShell窗口中运行：

```bash
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm run android
```

**第一次运行可能需要：**
- 下载Gradle依赖（可能需要几分钟）
- 编译Android代码
- 安装应用到设备

**预期结果：**
- Metro Bundler会编译JavaScript代码
- Gradle会构建Android应用（.apk文件）
- 应用会自动安装到设备
- 应用会自动启动

### 步骤4：查看应用效果

应用启动后，您将看到：

1. **首页（HomeScreen）**
   - 地图显示
   - 火点标记（如果有预警数据）
   - 活跃预警数量
   - "逃生路线"按钮

2. **预警页面**
   - 点击底部"预警"标签
   - 查看预警列表
   - 新预警会弹出弹窗

3. **逃生路线页面**
   - 点击首页的"逃生路线"按钮
   - 允许位置权限
   - 查看计算的逃生路线
   - 路线会在地图上显示为虚线

4. **求助页面**
   - 点击底部"求助"标签
   - 获取位置信息
   - 发送求助请求

5. **设置页面**
   - 点击底部"设置"标签
   - 切换语言（中英文）
   - 查看连接状态

## 🔧 故障排除

### 问题1：adb命令未找到

**错误**: `'adb' is not recognized as an internal or external command`

**解决**:
1. 确认Android Studio已安装
2. 找到adb路径（通常在 `%LOCALAPPDATA%\Android\Sdk\platform-tools\`）
3. 使用完整路径运行，或添加到系统PATH

**临时解决方案**:
```powershell
# 在Android Studio的Terminal中运行
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm run android
```

### 问题2：没有设备连接

**错误**: `No devices/emulators found`

**解决**:
- 确认模拟器已完全启动
- 或确认手机已连接且USB调试已启用
- 运行 `adb devices` 查看设备列表

### 问题3：构建失败

**错误**: Gradle构建错误

**解决**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 问题4：Metro连接失败

**错误**: Unable to connect to Metro

**解决**:
- 确认Metro Bundler正在运行（端口8081）
- 如果问题持续，重启Metro:
  ```bash
  # 停止当前Metro (Ctrl+C)
  npm start -- --reset-cache
  ```

### 问题5：后端连接失败

**错误**: 无法连接到后端API

**解决**:
- 确认后端服务运行在端口3000
- 如果是模拟器，API地址应该是 `http://10.0.2.2:3000`
- 检查 `src/utils/constants.js` 中的API配置

## 📊 功能测试清单

运行应用后，测试以下功能：

- [ ] 首页地图正常显示
- [ ] 火点标记显示（如果有数据）
- [ ] 预警列表正常加载
- [ ] 预警弹窗弹出
- [ ] 逃生路线计算成功
- [ ] 路线在地图上显示
- [ ] 位置权限请求正常
- [ ] 求助功能正常工作
- [ ] 语言切换功能正常

## 🎯 下一步

1. **测试所有功能**
   - 启动传感器模拟器生成测试数据
   - 测试预警接收和显示
   - 测试逃生路线规划

2. **开发新功能**（可选）
   - 添加语音播报
   - 优化路径规划算法
   - 添加推送通知

3. **部署准备**
   - 生成发布版APK
   - 配置签名密钥
   - 准备应用商店发布

---

**最后更新**: 刚刚  
**Web前端**: ✅ 已在浏览器中打开  
**Android应用**: ⏳ 等待设备连接后运行

