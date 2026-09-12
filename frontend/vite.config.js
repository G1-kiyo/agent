/// <references types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createMpaPlugin } from 'vite-plugin-virtual-mpa'
import path from 'path'

// 多页面应用（MPA）配置
// 用 vite-plugin-virtual-mpa 让 5 个页面共用同一份 index.html 模板，
// 插件会在 dev/build 时按 pages 配置自动生成各页面的虚拟 HTML 入口，
// 并自动配置 rollupOptions.input 与开发服务器的 history fallback。
// 模板内通过 EJS 占位符 <%= title %> 注入各页面标题。
export default defineConfig({
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@consts": path.resolve(__dirname, "./src/consts"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    }
  },
  plugins: [
    react(),
    ...createMpaPlugin({
      // 共用模板（默认即 index.html）
      template: 'index.html',
      pages: [
        {
          name: 'home',
          filename: 'index.html',
          entry: '/src/entries/home.jsx',
          data: { title: '首页' },
        },
        {
          name: 'search',
          entry: '/src/entries/search.jsx',
          data: { title: '智能检索' },
        },
        {
          name: 'discussion',
          entry: '/src/entries/discussion.jsx',
          data: { title: '协同讨论' },
        },
        {
          name: 'knowledge',
          entry: '/src/entries/knowledge.jsx',
          data: { title: '知识库' },
        },
        {
          name: 'admin',
          entry: '/src/entries/admin.jsx',
          data: { title: '管理后台' },
        },
      ],
    }),
  ],
  // 确保开发服务器对未知 .html 路径回退到对应文件，而非 index.html
  appType: 'mpa',
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: "http://backend:5173",
        changeOrigin: true
      },
      '/websocket': {
        target: "ws://backend:5173",
        ws: true,
        changeOrigin: true
      }
    }
  }
})