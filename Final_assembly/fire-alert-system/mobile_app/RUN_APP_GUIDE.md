# 📱 运行应用指南

## 当前状态

- ✅ Metro Bundler: **正在运行** (端口 8081)
- ⏳ 后端服务: **正在启动中**
- ❌ Android设备: **未检测到**（需要Android Studio和模拟器/真机）

## 🚀 运行步骤

### 方式1：使用Android模拟器/真机（推荐）

#### 步骤1：启动后端服务

后端服务已在新的PowerShell窗口中启动。如果未启动，请运行：

```bash
cd fire-alert-system/backend
npm start
```

**验证后端运行：**
- 访问 http://localhost:3000/api/health
- 应该返回 `{"success":true,"status":"running",...}`

#### 步骤2：启动传感器模拟器（可选，用于测试）

```bash
cd fire-alert-system/sensors
npm start
```

#### 步骤3：启动Metro Bundler

Metro Bundler已在运行中（端口8081）。如果未运行，请运行：

```bash
cd fire-alert-system/mobile_app
npm start
```

#### 步骤4：准备Android设备

**选项A：使用Android模拟器**
1. 打开Android Studio
2. 打开AVD Manager（Tools > Device Manager）
3. 创建或启动一个Android模拟器
4. 等待模拟器完全启动

**选项B：使用真实Android设备**
1. 在手机上启用"开发者选项"
2. 启用"USB调试"
3. 通过USB连接手机到电脑
4. 在手机上确认允许USB调试

**验证设备连接：**
```bash
# 如果adb在PATH中
adb devices

# 应该看到类似：
# List of devices attached
# emulator-5554    device
```

#### 步骤5：运行Android应用

```bash
cd fire-alert-system/mobile_app
npm run android
```

**预期结果：**
- Metro Bundler会编译JavaScript代码
- Gradle会构建Android应用
- 应用会安装到设备/模拟器上
- 应用会自动启动

### 方式2：查看Web前端（快速预览）

如果暂时无法运行Android应用，可以查看Web前端效果：

1. **访问Web前端**
   - 打开浏览器
   - 访问 http://localhost:3001
   - 查看前端界面和功能

2. **功能预览**
   - 实时火点地图
   - 预警列表
   - 基本界面布局

## 📋 功能测试清单

运行应用后，可以测试以下功能：

### 1. 首页（HomeScreen）
- [ ] 地图正常显示
- [ ] 火点标记显示（如果有预警数据）
- [ ] 活跃预警数量显示
- [ ] 点击"逃生路线"按钮

### 2. 预警页面（AlertScreen）
- [ ] 预警列表显示
- [ ] 下拉刷新功能
- [ ] 点击预警查看详情
- [ ] 解决预警功能

### 3. 逃生路线页面（EscapeRouteScreen）
- [ ] 位置权限请求
- [ ] 当前位置显示
- [ ] 逃生路线计算
- [ ] 路线在地图上显示
- [ ] 路线信息（距离、时间）
- [ ] 刷新路线功能

### 4. 求助页面（HelpScreen）
- [ ] 位置获取
- [ ] 发送求助请求
- [ ] 求助状态显示

### 5. 设置页面（SettingsScreen）
- [ ] 语言切换（中英文）
- [ ] 连接状态显示

## ⚠️ 常见问题

### 1. adb命令未找到

**问题：** `adb: command not found`

**解决：**
- 确保Android Studio已安装
- 将Android SDK platform-tools添加到PATH：
  ```
  %LOCALAPPDATA%\Android\Sdk\platform-tools
  ```
- 或在Android Studio中打开Terminal使用

### 2. 后端服务未运行

**问题：** 应用无法连接到后端

**解决：**
- 确认后端服务运行在端口3000
- 检查防火墙设置
- 如果是模拟器，使用 `10.0.2.2` 代替 `localhost`

### 3. 构建失败

**问题：** Gradle构建错误

**解决：**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### 4. Metro Bundler连接失败

**问题：** 应用无法连接到Metro Bundler

**解决：**
- 确认Metro Bundler运行在端口8081
- 检查是否有其他进程占用端口
- 重启Metro Bundler：`npm start -- --reset-cache`

### 5. 位置权限被拒绝

**问题：** 逃生路线功能无法获取位置

**解决：**
- 在设备设置中手动授予位置权限
- Android: 设置 > 应用 > 权限 > 位置

## 🔍 调试技巧

### 查看日志

**React Native日志：**
```bash
npx react-native log-android
```

**Metro Bundler日志：**
- 在运行 `npm start` 的终端中查看

**后端日志：**
- 在运行后端服务的终端中查看

### 开发菜单

在应用运行时：
- **Android**: 按 `Ctrl+M` (模拟器) 或摇动设备
- **iOS**: 按 `Cmd+D` (模拟器) 或摇动设备

可以：
- Reload（重新加载）
- Debug（调试）
- 查看性能监控

## 📞 获取帮助

如果遇到问题：
1. 查看错误日志
2. 检查所有服务是否运行
3. 确认设备连接正常
4. 查看项目文档：`README.md`, `QUICKSTART.md`

---

**最后更新**: 刚刚  
**Metro Bundler状态**: ✅ 运行中  
**后端服务状态**: ⏳ 正在启动  
**Android设备状态**: ❌ 需要配置

