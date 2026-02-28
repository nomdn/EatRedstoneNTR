import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    base: './',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 【核心修复】告诉 Vue 编译器：所有以 'midi-' 开头的标签都是原生自定义元素
            // 这样 Vue 就不会尝试把它们解析为组件，也不会报 "Failed to resolve component" 警告
            isCustomElement: (tag) => tag.startsWith('midi-')
          }
        }
      })
    ]
  }
})
