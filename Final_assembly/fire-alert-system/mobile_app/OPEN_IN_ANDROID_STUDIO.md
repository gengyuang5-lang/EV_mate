# 在Android Studio中打开项目

## ❌ 不需要创建新项目！

我们的React Native项目已经有Android原生代码了，**不需要创建新项目**。

## ✅ 正确的操作方式

### 方式1：打开整个React Native项目（推荐）

1. **关闭当前的"New Project"对话框**
   - 点击 "Cancel" 按钮

2. **在Android Studio中打开现有项目**
   - File > Open
   - 导航到：`E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app`
   - 选择整个 `mobile_app` 文件夹
   - 点击 "OK"

3. **等待同步完成**
   - Android Studio会自动识别React Native项目
   - 会同步Gradle文件
   - 可能需要几分钟

### 方式2：只打开Android目录（如果方式1有问题）

1. **关闭当前的"New Project"对话框**
   - 点击 "Cancel" 按钮

2. **打开Android目录**
   - File > Open
   - 导航到：`E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app\android`
   - 选择 `android` 文件夹
   - 点击 "OK"

## 📱 创建/启动Android模拟器

要运行应用，您需要Android模拟器：

1. **打开Device Manager**
   - 点击 Android Studio 右上角的 "Device Manager" 图标
   - 或：Tools > Device Manager
   - 或：View > Tool Windows > Device Manager

2. **创建模拟器（如果没有）**
   - 点击 "Create Device"
   - 选择设备型号（推荐：Pixel 5）
   - 选择系统镜像（推荐：API 33 或 API 34）
   - 点击 "Next" > "Finish"

3. **启动模拟器**
   - 在Device Manager中找到您创建的模拟器
   - 点击 ▶️ 播放按钮
   - 等待模拟器完全启动（显示Android桌面）

## 🚀 运行应用

模拟器启动后，在终端中运行：

```bash
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm run android
```

或者在Android Studio的Terminal中运行上述命令。

## 📝 总结

- ❌ **不要**：创建新Android项目
- ✅ **应该**：打开现有的 `mobile_app` 或 `android` 目录
- ✅ **然后**：使用Device Manager创建/启动模拟器
- ✅ **最后**：运行 `npm run android`

---

**重要提示**：我们已经有完整的Android项目代码了，只需要打开它，不需要重新创建！

