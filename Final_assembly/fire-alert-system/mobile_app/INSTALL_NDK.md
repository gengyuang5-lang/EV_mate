# 安装 NDK 指南

## 方法一：在 Android Studio 中找到 SDK Manager

### 步骤：

1. **打开 Android Studio**

2. **找到 SDK Manager（三种方式）：**
   
   **方式 A - 通过顶部菜单：**
   - 点击顶部菜单栏 **"Tools"** → **"SDK Manager"**
   
   **方式 B - 通过工具栏：**
   - 查看顶部工具栏，找到 **"SDK Manager"** 图标（通常是一个带有向下箭头的工具图标）
   
   **方式 C - 通过 Settings：**
   - File → Settings（或按 `Ctrl+Alt+S`）
   - 左侧导航：**Appearance & Behavior** → **System Settings** → **Android SDK**
   - 这会打开 SDK Manager

3. **安装 NDK：**
   - 切换到 **"SDK Tools"** 标签页
   - 勾选 **"Show Package Details"**（如果需要）
   - 展开 **"NDK (Side by side)"**
   - 勾选 **"23.1.7779620"**
   - 点击 **"Apply"** 或 **"OK"**
   - 等待下载和安装完成

4. **重新同步项目：**
   - File → Sync Project with Gradle Files

---

## 方法二：使用命令行工具（如果可用）

如果你有 Android SDK 的命令行工具，可以执行：

```powershell
cd "C:\Users\Administrator\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"
.\sdkmanager.bat "ndk;23.1.7779620"
```

或者如果没有 `latest` 目录：

```powershell
cd "C:\Users\Administrator\AppData\Local\Android\Sdk\cmdline-tools\tools\bin"
.\sdkmanager.bat "ndk;23.1.7779620"
```

---

## 方法三：让 Gradle 自动下载（不推荐）

如果上述方法都不行，可以尝试让 Gradle 自动下载，但这可能需要很长时间。

在 `android/app/build.gradle` 中，我们已经注释掉了 `ndkVersion`，但某些原生模块可能会失败。

---

## 验证安装

安装完成后，验证 NDK 是否已安装：

```powershell
Test-Path "C:\Users\Administrator\AppData\Local\Android\Sdk\ndk\23.1.7779620"
```

如果返回 `True`，说明安装成功。

---

## 如果还是找不到 SDK Manager

1. 确保 Android Studio 已完全启动
2. 检查 Android Studio 版本是否支持（需要较新版本）
3. 尝试重启 Android Studio
4. 检查 Android SDK 是否正确配置（File → Project Structure → SDK Location）

