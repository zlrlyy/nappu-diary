# Nappu Diary

一款帮助父母记录宝宝日常活动的移动应用，支持喂养记录、尿布更换记录等功能。

## 功能特性

### 宝宝管理
- 添加多个宝宝档案
- 记录姓名、出生日期、性别等信息
- 支持设置宝宝头像

### 喂养记录
- 支持多种喂养方式：
  - 母乳亲喂 (breast_direct)
  - 母乳瓶喂 (breast_bottle)
  - 配方奶粉 (formula)
- 记录喂养时长、奶量
- 母乳喂养支持记录左右侧
- 添加备注信息

### 尿布记录
- 记录尿布类型：尿尿、便便、两者都有
- 记录大便性状：正常、稀便、硬便、粘液、血便
- 添加备注信息

### 数据统计
- 查看历史记录
- 数据统计分析
- 可视化图表展示

## 技术栈

- **框架**: [Expo](https://expo.dev/) + [React Native](https://reactnative.dev/)
- **路由**: [expo-router](https://docs.expo.dev/router/introduction/)
- **UI组件**: [react-native-paper](https://callstack.github.io/react-native-paper/)
- **状态管理**: [zustand](https://zustand-demo.pmnd.rs/)
- **本地存储**: @react-native-async-storage/async-storage
- **日期处理**: [date-fns](https://date-fns.org/)
- **图表**: [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- **语言**: TypeScript

## 项目结构

```
nappu-diary/
├── app/                    # 页面路由 (expo-router)
│   ├── (tabs)/            # 标签页
│   │   ├── index.tsx      # 首页
│   │   ├── history.tsx    # 历史记录
│   │   └── stats.tsx      # 统计页面
│   ├── baby/              # 宝宝管理页面
│   ├── record/            # 记录页面
│   └── settings.tsx       # 设置页面
├── src/
│   ├── components/        # 组件
│   │   ├── baby/          # 宝宝相关组件
│   │   ├── feeding/       # 喂养相关组件
│   │   ├── diaper/        # 尿布相关组件
│   │   └── common/        # 通用组件
│   ├── stores/            # Zustand 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
└── assets/                # 静态资源
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 运行平台

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 开发

### 代码检查

```bash
npm run lint
```

### 运行测试

```bash
npm test
```

## 构建

使用 EAS Build 进行构建：

```bash
eas build --platform ios
eas build --platform android
```

## 许可证

MIT
