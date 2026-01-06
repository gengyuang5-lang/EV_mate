# 在Cursor中开发Android应用指南

## 推荐的扩展插件

### 1. React Native Tools（必需）
- **扩展ID**: `msjsdiag.vscode-react-native`
- **功能**: 
  - React Native代码智能提示
  - 调试支持
  - 运行命令
  - 日志查看

### 2. Android iOS Emulator
- **扩展ID**: `DiemasMichiels.emulate`
- **功能**: 
  - 在Cursor中启动和管理Android/iOS模拟器
  - 快速切换设备

### 3. ESLint（代码检查）
- **扩展ID**: `dbaeumer.vscode-eslint`
- **功能**: JavaScript/React代码质量检查

### 4. Prettier（代码格式化）
- **扩展ID**: `esbenp.prettier-vscode`
- **功能**: 自动格式化代码

### 5. JavaScript and TypeScript Nightly
- **扩展ID**: `ms-vscode.vscode-typescript-next`
- **功能**: 更好的TypeScript/JavaScript支持

## 安装扩展

### 方法1：通过Cursor界面安装

1. **打开扩展面板**
   - 点击左侧边栏的扩展图标（四个方块图标）
   - 或按快捷键 `Ctrl + Shift + X`

2. **搜索并安装**
   - 搜索 "React Native Tools"
   - 点击 "Install" 安装
   - 重复安装其他扩展

### 方法2：通过命令安装

在Cursor的终端中运行：

```bash
# 安装React Native Tools
code --install-extension msjsdiag.vscode-react-native

# 安装Android iOS Emulator
code --install-extension DiemasMichiels.emulate

# 安装ESLint
code --install-extension dbaeumer.vscode-eslint

# 安装Prettier
code --install-extension esbenp.prettier-vscode
```

## 配置工作区

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "react-native.packager.port": 8081,
  "react-native.android.runArguments.simulator": [
    "Pixel_5_API_36.1"
  ],
  "emulate.emulatorPath": "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe",
  "emulate.androidSdkPath": "C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk",
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 运行和调试

### 1. 使用终端运行

在Cursor的集成终端中（`Ctrl + `` `）：

```bash
# 启动Metro Bundler
npm start

# 在新终端中运行Android应用
npm run android
```

### 2. 使用React Native Tools扩展

1. **打开命令面板**
   - 按 `Ctrl + Shift + P`

2. **运行命令**
   - 输入 "React Native: Run Android"
   - 选择命令执行

3. **调试应用**
   - 按 `F5` 启动调试
   - 或点击左侧调试图标
   - 选择 "Debug Android"

### 3. 使用Android iOS Emulator扩展

1. **启动模拟器**
   - 按 `Ctrl + Shift + P`
   - 输入 "Emulator: Start"
   - 选择Android模拟器

2. **运行应用**
   - 使用终端命令或React Native Tools

## 调试配置

在 `.vscode/launch.json` 中创建调试配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "request": "launch",
      "type": "reactnative",
      "cwd": "${workspaceFolder}",
      "platform": "android"
    },
    {
      "name": "Attach to packager",
      "request": "attach",
      "type": "reactnative",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

## 任务配置

在 `.vscode/tasks.json` 中创建任务：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Metro",
      "type": "shell",
      "command": "npm start",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Run Android",
      "type": "shell",
      "command": "npm run android",
      "problemMatcher": []
    },
    {
      "label": "Clean Android Build",
      "type": "shell",
      "command": "cd android && ./gradlew clean",
      "problemMatcher": []
    }
  ]
}
```

## 使用技巧

### 快捷键

- `Ctrl + Shift + P`: 命令面板
- `Ctrl + `` `: 打开终端
- `F5`: 开始调试
- `Ctrl + Shift + D`: 调试面板
- `Ctrl + B`: 切换侧边栏

### 有用的命令

通过 `Ctrl + Shift + P` 可以运行：

- `React Native: Run Android`
- `React Native: Run iOS`
- `React Native: Start Packager`
- `React Native: Stop Packager`
- `React Native: Reload`
- `Emulator: Start`

### 查看日志

1. **React Native输出**
   - 查看 → 输出
   - 选择 "React Native" 频道

2. **终端日志**
   - 在终端中运行 `npm start` 查看Metro日志
   - 运行 `npm run android` 查看构建日志

## 优势

✅ 轻量级，启动快速
✅ 与代码编辑集成好
✅ 支持丰富的扩展
✅ 更好的代码编辑体验
✅ Git集成更直观

## 注意事项

⚠️ Android Studio仍需要安装（用于SDK和模拟器）
⚠️ 某些复杂调试功能可能在Android Studio中更完善
⚠️ 首次构建建议在Android Studio中完成

## 推荐工作流

1. **日常开发**：使用Cursor + 扩展
2. **复杂调试**：切换到Android Studio
3. **构建发布**：使用命令行或Android Studio

---

**总结**：Cursor完全可以用于React Native开发，配合合适的扩展可以获得很好的开发体验！

