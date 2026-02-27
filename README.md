# Scratch 扩展编辑器

基于 React + Blockly + Zelos 渲染器的可视化 Scratch 自定义积木创建工具。

## 功能特性

- 🧩 使用 Zelos 渲染器，模仿 Scratch 积木样式
- 🎯 无 Toolbox 的纯净预览容器
- 🔤 支持多种积木元素（文本、数字、下拉菜单、颜色、复选框）
- 💻 基于 React + Vite 构建
- 📦 使用 npm 管理依赖

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

## 使用说明

1. 启动项目后，你将看到一个积木预览区域
2. 点击上方工具栏的按钮添加不同的积木元素：
   - 📝 文本：添加文本输入字段
   - 🔢 数字：添加数字输入字段
   - 📋 下拉菜单：添加下拉选择字段
   - 🎨 颜色：添加颜色选择器
   - ☑️ 复选框：添加复选框字段
3. 积木会实时显示在预览区域中
4. 使用"清空"按钮重置工作区
5. 使用"导出"按钮导出积木定义

## 技术栈

- React 18
- Vite
- Blockly 10.4.3
- Zelos 渲染器

## 项目结构

```
Ext-Factory/
├── src/
│   ├── components/
│   │   ├── BlockPreview.jsx    # 积木预览组件
│   │   └── Toolbar.jsx         # 工具栏组件
│   ├── App.jsx                 # 主应用组件
│   ├── App.css                 # 主应用样式
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式
├── index.html                  # HTML 模板
├── package.json                # 项目配置
└── vite.config.js              # Vite 配置
```