<template>
  <div class="tools-layout">
    <div v-if="isRoot" class="tools-grid">
      <div class="tool-tile" @click="go('image')">
        <Picture style="width: 80px;height: 80px;margin-right: 30px;"/>
        图片格式转换
      </div>
      <div class="tool-tile" @click="go('base64')">
        <Switch style="width: 80px;height: 80px;margin-right: 30px;"/>
        Base64 加解密
      </div>
      <div class="tool-tile" @click="go('hash')">
        <Lock style="width: 80px;height: 80px;margin-right: 30px;"/>
        Hash 加密</div>
      <div class="tool-tile" @click="go('haruhikage')">
        <img src="/fcxz.png" />
        一键播放春日影
      </div>
      <div class="tool-tile" @click="go('qr')">
        <Camera style="width: 80px;height: 80px;margin-right: 30px;"/>
        二维码生成
      </div>
      <div class="tool-tile" @click="go('objection')">
        <img src="/yy.webp">
        异议！
      </div>
      <div class="tool-tile" @click="go('aichat')">
        <ChatRound style="width: 80px;height: 80px;margin-right: 30px;"/>
        AI 聊天
      </div>
    </div>
    <div v-else class="tool-content-area">
      <div class="tool-header">
        <el-button @click="goBack" style="margin-right: 10px;">返回</el-button>
        <span class="tool-title-header">{{ currentTitle }}</span>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Picture, Switch ,Lock ,Camera ,ChatRound} from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
const router = useRouter()
const route = useRoute()
function go(which) {
  router.push(`/tools/${which}`)
}
function goBack() {
  router.push('/tools')
}
const isRoot = computed(() => route.path === '/tools')
const currentTitle = computed(() => {
  const p = route.path
  if (p.startsWith('/tools/image')) return '图片格式转换'
  if (p.startsWith('/tools/base64')) return 'Base64'
  if (p.startsWith('/tools/hash')) return 'Hash'
  if (p.startsWith('/tools/haruhikage')) return '春日影'
  if (p.startsWith('/tools/qr')) return '二维码生成'
  if (p.startsWith('/tools/objection')) return '异议！'
  if (p.startsWith('/tools/aichat')) return 'AI 聊天'
  return ''
})
</script>

<style scoped>
.tools-layout {
  padding: 0;
  min-width: 100%;
}
.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
}
.tool-tile {
  width: 90%;
  height: 120px;
  display: flex;
  align-items: center;       /* 垂直居中：保持不动 */
  justify-content: flex-start; /* 【关键修改】改为从左侧开始排列，原为 center */
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 20px;
  font-weight: 600;
  padding: 0 20px;           /* 【建议添加】给左右留点边距，避免图片贴边太紧 */
  box-sizing: border-box;    /* 【建议添加】确保 padding 不会撑大盒子 */
}

.tool-tile img {
  max-width: 80px;
  max-height: 80px;
  /* 【删除】align-items 和 justify-content 对 img 标签本身无效，它们是父容器的属性 */
  margin-right: 30px;        /* 【建议添加】图片和文字之间加点间距 */
  flex-shrink: 0;            /* 【建议添加】防止图片被压缩 */
}

.tool-content-area {
  padding: 16px;
}
.tool-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  margin-left: 10px;
}
.tool-title-header {
  font-weight: 600;
  font-size: 18px;
}
</style>
