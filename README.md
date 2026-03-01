# Extendustry - Scratch 扩展积木可视化编辑器

基于 React + Blockly + Zelos 渲染器的可视化 Scratch 自定义积木创建工具。

## 功能特性

- 使用 Zelos 渲染器，模仿 Scratch 积木样式
- 支持多种积木类型（COMMAND、REPORTER、BOOLEAN、EVENT、HAT、LOOP、CONDITIONAL）
- Inline Inputs 模式，所有元素在同一行显示
- 支持拖拽排序元素卡片
- 暗色模式支持
- 实时预览积木外观
- 支持固定分支（CONDITIONAL 和 LOOP）
- 完全离线可用

## 支持的积木元素

- 标签：纯文本标签，用于显示固定文本
- 文本：文本输入字段，支持编辑默认值
- 数字：数字输入字段，支持编辑默认值
- 下拉菜单：选择下拉菜单，支持自定义选项和默认值
- 颜色：颜色选择器，支持选择默认颜色
- 布尔值：布尔值输入槽，接受 Boolean 类型积木

## 积木类型

- COMMAND：普通积木，可连接到其他积木的上方和下方
- REPORTER：报告型积木，返回 Any 类型值
- BOOLEAN：布尔型积木，返回 Boolean 类型值
- EVENT：事件型积木，只能连接下方积木
- HAT：帽子型积木，只能连接下方积木
- LOOP：循环型积木，固定包含一个分支
- CONDITIONAL：条件型积木，可自定义多个分支数量

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

## 使用说明

1. 启动项目后，左侧显示积木预览区域和积木类型选择器，右侧显示元素列表
2. 选择积木类型：
   - COMMAND、REPORTER、BOOLEAN、EVENT、HAT：基本积木类型
   - LOOP：固定包含一个分支
   - CONDITIONAL：可自定义分支数量（最少1个）
3. 点击右上角圆形"添加元素"按钮，选择要添加的积木元素类型
4. 在元素列表中可以：
   - 点击卡片标题栏展开/折叠编辑区域
   - 拖拽卡片调整元素顺序
   - 编辑元素的默认值、文本内容、选项等属性
   - 点击删除图标移除元素
5. 积木会实时显示在左侧预览区域中
6. 使用右上角"清空全部"按钮重置工作区
7. 点击工具栏右侧的图标切换暗色/亮色模式

## 部署

### 本地预览

由于 ES6 模块的安全限制，不能直接双击 `online/index.html` 打开。需要使用 HTTP 服务器：

```bash
cd online
python -m http.server 8080
```

或使用 Vite 预览：

```bash
npm run preview
```

### 部署到 GitHub Pages

1. 构建项目：`npm run build`
2. 将 `online` 目录内容推送到 GitHub 仓库
3. 在仓库设置中启用 GitHub Pages
4. 设置 Pages 源为包含构建文件的分支

### 部署到其他静态服务器

将 `online` 目录下的所有文件上传到任何支持静态文件托管的服务器。

## 技术栈

- React 18.2.0
- Vite 4.3.9
- Blockly 10.4.3
- Zelos 渲染器
- Material-UI 7.3.8
- @emotion/react 11.14.0
- @hello-pangea/dnd 16.6.0（拖拽功能）

## 项目结构

```
Extendustry/
├── src/
│   ├── components/
│   │   ├── AddElementMenu.jsx  # 添加元素菜单组件
│   │   └── ElementList.jsx     # 元素列表组件
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

## 离线使用

项目已配置为完全离线可用：

- 所有资源（包括 Blockly 媒体文件）都会被打包
- 使用相对路径确保可以在任何位置运行
- 构建后的 `online` 目录包含所有必需文件

## License

请查看项目根目录下的 LICENSE 文件。