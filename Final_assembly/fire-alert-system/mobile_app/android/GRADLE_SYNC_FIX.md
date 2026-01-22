# Gradle Sync 问题修复指南

## 问题原因
Gradle 版本不兼容导致 Sync 失败。Gradle 9.0-milestone-1 与 Android Gradle Plugin 7.4.2 不兼容。

## 已修复的配置

### 版本兼容性
- **Android Gradle Plugin**: 7.4.2
- **Gradle**: 7.6.3 (兼容版本)
- **React Native**: 0.72.6

## 解决步骤

### 1. 停止所有 Gradle 进程
在 Android Studio 中：
- 点击错误提示中的 "Stop Gradle build processes (requires restart)"
- 或者通过 Terminal 执行：
  ```bash
  cd android
  ./gradlew --stop
  ```

### 2. 清理 Gradle 缓存（如果仍然失败）
```bash
cd android
./gradlew clean --no-daemon
```

### 3. 在 Android Studio 中重新同步
- 点击 "File" → "Sync Project with Gradle Files"
- 或者点击顶部工具栏的 "Sync Project with Gradle Files" 按钮
- 或者点击错误提示中的 "Re-download dependencies and sync project"

### 4. 如果还是失败，手动清理缓存
```bash
# 删除本地 Gradle 缓存（谨慎操作）
rm -rf ~/.gradle/caches/
# Windows PowerShell:
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches\
```

### 5. 验证配置
确保以下文件配置正确：

**gradle-wrapper.properties:**
```
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6.3-bin.zip
```

**build.gradle:**
```
classpath("com.android.tools.build:gradle:7.4.2")
```

## 常见问题

### 问题：仍然显示 "Gradle Sync issues"
**解决：**
1. 关闭 Android Studio
2. 在 Terminal 中执行：`cd android && ./gradlew --stop`
3. 重新打开 Android Studio
4. File → Invalidate Caches / Restart → Invalidate and Restart

### 问题：网络连接超时
**解决：**
1. 检查网络连接
2. 如果需要代理，在 `gradle.properties` 中配置：
   ```
   systemProp.http.proxyHost=your.proxy.host
   systemProp.http.proxyPort=your.proxy.port
   systemProp.https.proxyHost=your.proxy.host
   systemProp.https.proxyPort=your.proxy.port
   ```

### 问题：依赖下载失败
**解决：**
1. 点击错误提示中的 "Re-download dependencies and sync project"
2. 或手动执行：`./gradlew build --refresh-dependencies`

## 版本兼容性参考

| Android Gradle Plugin | Gradle 版本范围 |
|----------------------|----------------|
| 7.4.x | 7.5 - 8.0 |
| 7.3.x | 7.4 - 7.6 |
| 8.0.x | 8.0 - 8.3 |

**当前配置（推荐）：**
- AGP: 7.4.2
- Gradle: 7.6.3 ✅

