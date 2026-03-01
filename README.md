# Extendustry

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建完成后，文件会输出到 `online` 目录。

### 预览生产构建

```bash
npm run preview
```

## 部署到 GitHub Pages

1. 构建项目：`npm run build`
2. 将 `online` 目录内容推送到 GitHub 仓库
3. 在仓库设置中启用 GitHub Pages
4. 运行工作流 `Pages` 将自动部署到 GitHub Pages

## 项目结构

```
Extendustry/
├── src/
│   ├── components/
│   │   ├── AddElementMenu.jsx  # 添加元素菜单组件
│   │   ├── Alert.jsx           # 提示框组件
│   │   ├── BlockList.jsx       # 积木列表组件
│   │   ├── BlockPreview.jsx    # 积木预览组件
│   │   ├── ElementList.jsx     # 元素列表组件
│   │   ├── FunctionConfig.jsx  # 函数配置组件
│   │   └── Toolbar.jsx         # 工具栏组件
│   ├── utils/
│   │   └── storage.js          # 本地存储工具
│   ├── App.jsx                 # 主应用组件
│   ├── App.css                 # 主应用样式
│   └── main.jsx                # React 入口文件
├── public/
│   └── media/                  # Blockly 媒体资源（自动复制）
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
└── README.md                   # 项目说明
```

## License

[GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html#license-text)