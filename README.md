# 傻子大帝 - 建造你的罗马帝国

一款受凯撒大帝启发的城市建设游戏。在这款游戏中，你将从一个小村庄开始，逐步发展成为一个强大的帝国。

![游戏封面](public/cover.png)

## 🎮 游戏特色

- 🏛️ **城市建设** - 建造各种建筑，发展你的城市
- ⚔️ **军事系统** - 训练军队，保卫你的帝国
- 💰 **经济系统** - 管理资源，进行贸易
- 🔬 **科技树** - 研究科技，解锁新建筑和能力
- 🏆 **成就系统** - 完成挑战，解锁成就
- 📜 **事件系统** - 随机事件影响游戏进程

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看游戏。

### 构建生产版本

```bash
npm run build
```

## 📱 打包为移动应用

本项目使用 Capacitor 将 Next.js 应用打包为原生移动应用。

### 前置要求

- Node.js 20+
- Java 17+
- Android Studio (Android SDK)

### 初始化 Capacitor

```bash
# 安装 Capacitor CLI
npm install @capacitor/cli @capacitor/core @capacitor/android

# 初始化 Capacitor
npx cap init "傻子大帝" "com.idlegame.shanzidadi" --web-dir=out

# 添加 Android 平台
npx cap add android

# 构建并同步
npm run build
npx cap sync android
```

### 在 Android 设备/模拟器上运行

```bash
npx cap open android
```

在 Android Studio 中运行应用。

### 构建 APK

```bash
cd android
./gradlew assembleDebug
```

APK 文件将生成在 `android/app/build/outputs/apk/debug/` 目录。

## 🔧 GitHub Actions 自动构建

本项目配置了 GitHub Actions，可以在每次 push 时自动构建 APK。

1. Fork 本仓库
2. 在 Actions 页面查看构建状态
3. 构建完成的 APK 可以在 Artifacts 中下载

## 🛠️ 技术栈

- **框架**: Next.js 16
- **UI**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui
- **状态管理**: Zustand
- **移动端打包**: Capacitor

## 📂 项目结构

```
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React 组件
│   │   ├── game/       # 游戏相关组件
│   │   └── ui/         # UI 组件库
│   ├── game/           # 游戏核心逻辑
│   ├── hooks/          # 自定义 Hooks
│   └── lib/            # 工具函数
├── public/             # 静态资源
├── android/            # Android 原生项目
└── out/                # Next.js 静态导出目录
```

## 📄 License

MIT License
