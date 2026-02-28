<template>
  <div class="tool-base64 base64-card">
    <h3>Base64 编解码</h3>
    <textarea v-model="input" rows="6" placeholder="请输入文本"></textarea>
    <div style="margin-top: 8px">
      <el-button @click="encode">Base64 编码</el-button>
      <el-button @click="decode" style="margin-left: 8px">Base64 解码</el-button>
    </div>
    <div v-if="output" style="margin-top: 8px; white-space: pre-wrap; word-break: break-all">
      结果: {{ output }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const input = ref('')
const output = ref('')
function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch (e) {
    output.value = '编码错误'
  }
}
function decode() {
  try {
    output.value = decodeURIComponent(escape(atob(input.value)))
  } catch (e) {
    output.value = '解码错误'
  }
}
</script>

<style scoped>
.base64-card {
  padding: 16px;
}
textarea {
  width: 100%;
}
</style>
