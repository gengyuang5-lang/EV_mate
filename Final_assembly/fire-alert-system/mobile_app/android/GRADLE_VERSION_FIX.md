# Gradle 版本修复说明

## 重要提示

**请勿手动将 Gradle 版本改为 9.0-milestone-1！**

当前项目配置：
- **Android Gradle Plugin**: 7.4.2
- **推荐 Gradle 版本**: 7.6.3
- **兼容的 Java 版本**: Java 8-19（推荐 Java 17）

## 正确的 gradle-wrapper.properties 配置

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6.3-bin.zip
```

## 如果文件被改回 9.0-milestone-1

1. **立即修复**：将 `distributionUrl` 改回 `gradle-7.6.3-bin.zip`
2. **在 Android Studio 中**：
   - 右键点击 `gradle-wrapper.properties` 文件
   - 选择 "Reload from Disk"
3. **重新同步**：File → Sync Project with Gradle Files

## 为什么不能使用 Gradle 9.0-milestone-1？

- Gradle 9.0-milestone-1 是预览版本，不稳定
- 需要 Android Gradle Plugin 8.5+，但当前项目使用 7.4.2
- 会导致 "Incompatible Gradle JVM" 错误
- 可能导致构建失败

## 如何防止版本被改回？

1. 检查是否有其他工具或脚本在修改这个文件
2. 在 Android Studio 中设置文件为只读（临时方案）
3. 检查 Git 配置，确保正确的版本被提交

## 验证配置

执行以下命令验证 Gradle 版本：
```bash
cd android
./gradlew --version
```

应该显示：Gradle 7.6.3

