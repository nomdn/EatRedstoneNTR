<template>
  <div class="hash-card tool-container">
    <h3>Hash 加密（SHA-256）</h3>
    <textarea v-model="input" rows="6" placeholder="输入文本或粘贴文本"></textarea>
    <div style="margin-top: 8px; display: flex; gap: 8px">
      <el-button @click="hashText">计算 Hash</el-button>
      <el-button @click="clear">清空</el-button>
    </div>
    <div v-if="hash" style="margin-top: 8px; word-break: break-all; white-space: pre-wrap">
      Hash: {{ hash }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const input = ref('')
const hash = ref('')
async function hashText() {
  if (!input.value) return
  const enc = new TextEncoder()
  const data = enc.encode(input.value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  hash.value = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
function clear() {
  input.value = ''
  hash.value = ''
}
</script>

<style scoped>
.hash-card {
  padding: 16px;
}
textarea {
  width: 100%;
}
</style>
