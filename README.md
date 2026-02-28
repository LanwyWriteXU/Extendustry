# Extendustry - Scratch 扩展积木可视化编辑器

基于 React + Blockly + Zelos 渲染器的可视化 Scratch 自定义积木创建工具。

## 功能特性

- 使用 Zelos 渲染器，模仿 Scratch 积木样式
- 无 Toolbox 的纯净预览容器
- 支持多种积木元素类型
- 实时预览积木外观
- 动态编辑元素属性
- 支持元素排序和删除

## 支持的积木元素

- 标签：纯文本标签，用于显示固定文本
- 文本：文本输入字段，支持编辑默认值
- 数字：数字输入字段，支持编辑默认值
- 下拉菜单：选择下拉菜单，支持自定义选项和默认值
- 颜色：颜色选择器，支持选择默认颜色
- 布尔值：布尔值输入槽，接受 Boolean 类型积木
- 分支：语句输入槽，可嵌套其他积木

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

### 预览生产构建

```bash
npm run preview
```

## 使用说明

1. 启动项目后，左侧显示积木预览区域，右侧显示元素列表
2. 点击右上角"添加元素"按钮，选择要添加的积木元素类型
3. 在元素列表中可以：
   - 编辑元素的 ID、默认值、文本内容等属性
   - 使用上下箭头调整元素顺序
   - 点击删除图标移除元素
4. 积木会实时显示在左侧预览区域中
5. 使用"清空全部"按钮重置工作区

## 技术栈

- React 18.2.0
- Vite 4.3.9
- Blockly 10.4.3
- Zelos 渲染器
- Material-UI 7.3.8
- @emotion/react 11.14.0

## 项目结构

```
Extendustry/
├── src/
│   ├── components/
│   │   ├── AddElementMenu.jsx  # 添加元素菜单组件
│   │   ├── BlockPreview.jsx    # 积木预览组件
│   │   ├── ElementList.jsx     # 元素列表组件
│   │   ├── ElementList.css     # 元素列表样式
│   │   └── Toolbar.jsx         # 工具栏组件
│   ├── App.jsx                 # 主应用组件
│   ├── App.css                 # 主应用样式
│   ├── main.jsx                # React 入口文件
│   ├── index.css               # 全局样式
│   └── assets/                 # 静态资源
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
└── README.md                   # 项目说明
```