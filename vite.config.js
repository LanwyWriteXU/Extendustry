import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'online',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom'],
          // Material-UI 库
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          // Blockly 编辑器
          'blockly-vendor': ['blockly', 'blockly/javascript'],
          // Monaco 编辑器
          'monaco-vendor': ['@monaco-editor/react'],
          // 拖拽库
          'dnd-vendor': ['@hello-pangea/dnd'],
          // 工具库
          'utils-vendor': ['js-cookie'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
  },
});