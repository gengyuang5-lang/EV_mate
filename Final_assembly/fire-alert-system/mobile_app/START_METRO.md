# 启动 Metro Bundler 指南

## 问题
应用已成功安装，但显示 "Could not connect to development server" 错误。这是因为 Metro bundler（React Native 的开发服务器）没有运行。

## 解决方案

### 方法一：在 Android Studio 的 Terminal 中启动（推荐）

1. 在 Android Studio 底部打开 **Terminal** 标签页
2. 执行以下命令：
```bash
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm start
```

3. 等待 Metro bundler 启动（会显示 "Metro waiting on..."）

4. 在模拟器中：
   - 按 `R` 键两次（或点击 "RELOAD" 按钮）
   - 应用会重新加载并连接到开发服务器

### 方法二：使用独立的命令行窗口

1. 打开新的 PowerShell 或 CMD 窗口
2. 执行：
```bash
cd E:\desktop\EV_mate\Final_assembly\fire-alert-system\mobile_app
npm start
```

3. 保持这个窗口打开（Metro bundler 需要持续运行）

4. 在模拟器中重新加载应用

### 方法三：在 Android Studio 中直接运行

1. 点击运行按钮（绿色播放图标）
2. Android Studio 会自动启动 Metro bundler（如果配置正确）

## 验证 Metro Bundler 是否运行

在浏览器中访问：
```
http://localhost:8081/status
```

如果返回 `{"status":"running"}`，说明 Metro bundler 正在运行。

## 常见问题

### 端口 8081 被占用
如果端口被占用，可以：
1. 关闭占用端口的进程
2. 或使用其他端口：`npm start -- --port 8082`

### 网络连接问题
如果模拟器无法连接：
1. 确保模拟器网络设置正确
2. 在模拟器中，按 `Ctrl+M`（Windows）打开开发者菜单
3. 选择 "Settings" → "Debug server host & port for device"
4. 设置为 `localhost:8081` 或 `10.0.2.2:8081`

## 下一步

启动 Metro bundler 后，应用应该能够正常加载和运行了！

