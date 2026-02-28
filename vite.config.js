// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path' // 如果需要路径别名

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 【关键】告诉 Vue 编译器：所有以 'midi-' 开头的标签都是原生自定义元素
          // 不要尝试将它们解析为 Vue 组件
          isCustomElement: (tag) => tag.startsWith('midi-')
        }
      }
    })
  ],
  // 如果是 Electron 项目，确保渲染进程配置正确
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
