# 扩展工坊[Extendustry]

一个用于创建 Scratch 扩展的可视化编辑器。

## 功能特性

- 可视化积木编辑器，支持拖拽操作
- 多种元素类型：标签、文本输入、数字输入、下拉菜单、颜色选择器、布尔值、语句分支
- 项目文件管理（保存/加载 .ext 文件）
- 国际化支持
- 深色模式支持
- 基于 Blockly 的实时积木预览
- 积木库管理
- 扩展配置（名称、ID、作者、许可证、颜色、图标）

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 使用指南

### 创建积木

1. 选择积木类型（命令积木、事件积木、条件积木、循环积木、报告积木、布尔积木）
2. 点击"添加元素"按钮添加元素
3. 在元素列表中配置元素属性
4. 实时预览积木效果

### 项目管理

- **保存项目**：文件 > 保存项目
- **另存为**：文件 > 另存为
- **打开项目**：文件 > 打开项目
- **新建扩展**：文件 > 新建扩展

### 积木库

点击工具栏的积木库按钮可以：
- 查看当前项目的所有积木
- 在积木之间切换
- 管理积木列表

### 扩展设置

点击项目设置按钮可以：
- 设置扩展名称和 ID
- 添加作者信息和许可证
- 设置描述和颜色
- 上传扩展图标和积木图标

## 项目结构

```
Extendustry/
├── src/
│   ├── components/           # React 组件
│   ├── contexts/             # React 上下文
│   ├── locales/              # 国际化文件
│   ├── utils/                # 工具函数
│   ├── App.jsx               # 主应用组件
│   └── main.jsx              # React 入口
├── public/                   # 静态资源
├── online/                   # 构建输出
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

## 项目文件格式

Extendustry 使用 `.ext` 格式保存项目文件：

```json
{
  "version": "1.0",
  "extensionName": "My Extension",
  "extensionSettings": {
    "extensionName": "My Extension",
    "extensionId": "myExtension",
    "author": "Extendustry",
    "license": "MIT",
    "description": "",
    "color1": "#66CCFF",
    "extensionIcon": "",
    "blockIcon": ""
  },
  "blocks": [...],
  "savedAt": "2026-03-07T..."
}
```

## 许可证

GNU General Public License v3.0