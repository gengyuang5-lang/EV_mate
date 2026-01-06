# 虚拟机中运行 App 配置指南

## 🖥️ 虚拟机环境准备

### 1. 虚拟机网络配置

#### 方式 1: 桥接模式（推荐）
- 虚拟机使用桥接网络，获得独立 IP
- 可以直接访问宿主机服务

#### 方式 2: NAT 模式
- 虚拟机通过 NAT 访问宿主机
- 宿主机 IP 需要配置为网关 IP

### 2. 获取宿主机 IP 地址

在宿主机（Windows）上运行：
```powershell
ipconfig
```

查找：
- **IPv4 地址**（例如：192.168.1.100）
- 或 **VMware Network Adapter** 的 IP（NAT 模式）

## 🔧 配置 App 连接宿主机服务

### 修改 API 地址配置

编辑 `fire-alert-system/mobile_app/src/utils/constants.js`：

```javascript
// 获取宿主机 IP（根据实际情况修改）
const HOST_IP = '192.168.1.100'; // 替换为您的宿主机 IP

export const API_URL = __DEV__ 
  ? `http://${HOST_IP}:3000`  // 开发环境 - 使用宿主机 IP
  : 'http://your-production-url:3000';

export const WS_URL = __DEV__
  ? `ws://${HOST_IP}:3000`  // WebSocket 使用宿主机 IP
  : 'ws://your-production-url:3000';
```

### Android 模拟器特殊配置

如果虚拟机中运行 Android 模拟器：
- 使用 `10.0.2.2` 代替宿主机 IP（Android 模拟器特殊地址）

```javascript
// Android 模拟器配置
const HOST_IP = Platform.OS === 'android' ? '10.0.2.2' : '192.168.1.100';
```

## 📱 在虚拟机中安装开发环境

### 1. 安装 Node.js

```bash
# 下载并安装 Node.js 18+
# https://nodejs.org/
```

### 2. 安装 Android Studio（Android 开发）

```bash
# 下载 Android Studio
# https://developer.android.com/studio

# 安装后配置：
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device (AVD)
```

### 3. 安装 React Native CLI

```bash
npm install -g react-native-cli
```

### 4. 配置环境变量

**Linux/macOS:**
```bash
# 编辑 ~/.bashrc 或 ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows (PowerShell):**
```powershell
# 系统环境变量中添加
ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\emulator
```

## 🚀 在虚拟机中运行 App

### 1. 克隆/复制项目到虚拟机

```bash
# 方式 1: 使用 Git
git clone <repository-url>
cd fire-alert-system/mobile_app

# 方式 2: 使用共享文件夹
# 将项目文件夹复制到虚拟机
```

### 2. 安装依赖

```bash
cd fire-alert-system/mobile_app
npm install --legacy-peer-deps
```

### 3. 配置 API 地址

编辑 `src/utils/constants.js`，设置宿主机 IP。

### 4. 启动 Metro Bundler

```bash
npm start
```

### 5. 运行 Android App

```bash
# 确保 Android 模拟器已启动
npm run android
```

## 🔍 网络连接测试

### 在虚拟机中测试连接

```bash
# 测试后端 API
curl http://192.168.1.100:3000/api/alerts/active

# 测试 WebSocket（使用 Node.js 脚本）
node -e "
const ws = require('ws');
const client = new ws('ws://192.168.1.100:3000');
client.on('open', () => console.log('连接成功'));
client.on('error', (e) => console.log('连接失败:', e));
"
```

### 在 App 中测试

在 App 的开发者菜单中：
1. 摇动设备或按 `Ctrl+M` (Android)
2. 选择 "Debug"
3. 打开 Chrome DevTools
4. 在 Console 中测试 API 连接

## 🛠️ 常见问题解决

### 问题 1: 无法连接到宿主机服务

**解决方案：**
1. 检查防火墙设置（宿主机和虚拟机）
2. 确保宿主机服务正在运行
3. 检查 IP 地址是否正确
4. 尝试 ping 宿主机 IP

```bash
# 在虚拟机中测试
ping 192.168.1.100
```

### 问题 2: Android 模拟器无法连接

**解决方案：**
- 使用 `10.0.2.2` 代替宿主机 IP
- 或使用真机通过 USB 连接

### 问题 3: 端口被占用

**解决方案：**
```bash
# 检查端口占用
netstat -ano | grep 3000
netstat -ano | grep 8081

# 修改端口（如果需要）
# 在 backend/server.js 中修改 PORT
```

### 问题 4: WebSocket 连接失败

**解决方案：**
1. 检查防火墙是否允许 WebSocket 连接
2. 确保使用 `ws://` 而不是 `http://`
3. 检查宿主机 IP 和端口是否正确

## 📋 完整配置检查清单

- [ ] 虚拟机网络配置完成（桥接或 NAT）
- [ ] 获取宿主机 IP 地址
- [ ] 修改 `src/utils/constants.js` 中的 API 地址
- [ ] 宿主机后端服务正在运行（端口 3000）
- [ ] 虚拟机中可以 ping 通宿主机
- [ ] 虚拟机中可以访问 `http://宿主机IP:3000`
- [ ] Node.js 已安装
- [ ] Android Studio 已安装并配置
- [ ] React Native 环境已配置
- [ ] 项目依赖已安装
- [ ] Android 模拟器已启动或真机已连接

## 🎯 快速启动脚本

创建 `start-vm.sh`（Linux/macOS）或 `start-vm.ps1`（Windows）：

```bash
#!/bin/bash
# start-vm.sh

# 设置宿主机 IP
HOST_IP="192.168.1.100"

# 检查连接
echo "测试连接到宿主机..."
ping -c 1 $HOST_IP > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 可以连接到宿主机"
else
    echo "❌ 无法连接到宿主机，请检查网络配置"
    exit 1
fi

# 启动 Metro
echo "启动 Metro Bundler..."
npm start &
METRO_PID=$!

# 等待 Metro 启动
sleep 5

# 运行 Android App
echo "启动 Android App..."
npm run android

# 清理
trap "kill $METRO_PID" EXIT
```

## 📝 配置示例

### 示例 1: 桥接模式

```
宿主机 IP: 192.168.1.100
虚拟机 IP: 192.168.1.101

App 配置:
API_URL = 'http://192.168.1.100:3000'
WS_URL = 'ws://192.168.1.100:3000'
```

### 示例 2: NAT 模式 + Android 模拟器

```
宿主机 IP: 192.168.1.100
虚拟机 IP: 192.168.122.50

App 配置（Android 模拟器）:
API_URL = 'http://10.0.2.2:3000'
WS_URL = 'ws://10.0.2.2:3000'
```

### 示例 3: 真机连接

```
宿主机 IP: 192.168.1.100
真机 IP: 192.168.1.102（同一 WiFi）

App 配置:
API_URL = 'http://192.168.1.100:3000'
WS_URL = 'ws://192.168.1.100:3000'
```

---

**提示**: 如果遇到网络问题，建议使用桥接模式，这样虚拟机可以获得独立 IP，更容易配置。

