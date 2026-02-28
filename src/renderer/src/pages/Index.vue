<script setup>
import { ElButton, ElMenu, ElMenuItem } from 'element-plus'
import { el } from 'element-plus/es/locales.mjs'
import { ref } from 'vue'
import { reactive } from 'vue'
import Giscus from '@giscus/vue'
import 'element-plus/dist/index.css'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const activePath = computed(() => (route.path.startsWith('/tools') ? '/tools' : route.path))
</script>
<template>
  <div class="layout">
    <ElMenu
      mode="vertical"
      style="width: 240px;"
      :unique-opened="true"
      :collapse-transition="true"
      :close-on-click-outside="true"
      :default-active="activePath"
      router
      :ellipsis="false"
      class="side-menu"
    >
      <ElMenuItem index="/">主页</ElMenuItem>
      <ElMenuItem index="/tools">工具箱</ElMenuItem>
    </ElMenu>
    <div class="content-area">
      <router-view></router-view>
    </div>
  </div>
</template>
<style scoped>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.layout {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
}
.side-menu {
  max-width: 20%;
  width: 240px;
  flex: 0 0 240px;
  height: auto;
}
.content-area {
  flex: 1 1 auto;
  min-width: 80%;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
</style>
