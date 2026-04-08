# 傻子大帝 - 贡献指南

感谢您对傻子大帝游戏的兴趣！本文档将帮助您了解如何为项目做出贡献。

## 开发环境设置

### 前置要求

- Node.js 20+
- npm 或 yarn
- Android Studio (用于 Android 开发)
- Xcode (用于 iOS 开发，仅 macOS)

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/YOUR_USERNAME/shanzidadi.git
cd shanzidadi
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在浏览器中打开 http://localhost:3000

## 项目架构

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # 根布局
│   ├── page.tsx     # 主页面
│   └── globals.css  # 全局样式
├── components/
│   ├── game/        # 游戏组件
│   │   ├── TopBar.tsx        # 顶部状态栏
│   │   ├── ResourceBar.tsx   # 资源栏
│   │   ├── GameCanvas.tsx    # 游戏画布
│   │   ├── BuildBar.tsx      # 建筑栏
│   │   └── ...
│   └── ui/          # UI 组件库
├── game/            # 游戏核心逻辑
│   ├── store.ts     # Zustand 状态管理
│   ├── constants.ts # 游戏常量定义
│   ├── types.ts     # TypeScript 类型定义
│   ├── gameLoop.ts  # 游戏主循环
│   ├── renderer.ts  # 渲染器
│   └── inputHandler.ts # 输入处理
└── lib/             # 工具函数
```

## 游戏核心概念

### 状态管理 (Zustand)

游戏使用 Zustand 进行状态管理，主要状态包括：

- `resources`: 资源数据 (金币、食物、木材等)
- `population`: 人口数量
- `buildings`: 已建造的建筑
- `researchedTechs`: 已研究的科技

### 游戏循环

游戏循环在 `gameLoop.ts` 中实现，主要功能：

- 每秒更新资源产出
- 处理建筑消耗
- 触发随机事件
- 更新季节效果

### 渲染系统

Canvas 渲染在 `renderer.ts` 中实现：

- 地图渲染
- 建筑渲染
- 动画效果
- UI 交互

## 代码规范

### TypeScript

- 使用 strict 模式
- 优先使用类型推导
- 避免使用 `any` 类型

### 组件规范

- 使用函数式组件
- 使用 Tailwind CSS 进行样式设计
- 组件文件使用 PascalCase 命名

### Git 提交规范

使用 Conventional Commits 格式：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 测试

目前项目使用手动测试。请确保：

1. 游戏可以正常启动
2. 核心功能正常工作
3. UI 在移动端显示正确

## Pull Request 流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: 添加某功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 问题反馈

如果您发现 bug 或有功能建议，请：

1. 搜索现有 Issues
2. 创建新 Issue 并详细描述问题
3. 提供复现步骤（如有）

## 许可证

本项目采用 MIT 许可证。
