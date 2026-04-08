#!/bin/bash

# 傻子大帝 - Capacitor 初始化脚本

echo "🚀 开始初始化傻子大帝 Capacitor 项目..."

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  需要 Node.js 20+ 版本，当前版本: $(node -v)"
  exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 安装 Capacitor
echo "⚡ 安装 Capacitor..."
npm install @capacitor/cli @capacitor/core @capacitor/android

# 初始化 Capacitor
echo "🎯 初始化 Capacitor..."
npx cap init "傻子大帝" "com.idlegame.shanzidadi" --web-dir=out

# 添加 Android 平台
echo "📱 添加 Android 平台..."
npx cap add android

# 构建 Web 应用
echo "🔨 构建 Web 应用..."
npm run build

# 同步到 Android
echo "🔄 同步到 Android..."
npx cap sync android

echo ""
echo "✅ 初始化完成！"
echo ""
echo "下一步："
echo "1. 在 Android Studio 中打开项目: npx cap open android"
echo "2. 或者构建 APK: cd android && ./gradlew assembleDebug"
echo ""
