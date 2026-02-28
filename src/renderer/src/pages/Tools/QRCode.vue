<template>
  <div class="tool-container">
    <h3>二维码生成</h3>
    <div class="row">
      <input v-model="text" placeholder="输入文本内容" />
      <label
        >Size
        <input type="range" v-model.number="size" min="128" max="1024" />
        <span>{{ size }}px</span>
      </label>
      <button @click="generate" :disabled="!text">生成</button>
    </div>
    <div
      class="qrcode-area"
      ref="qrBox"
      style="
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed #ddd;
        margin-top: 8px;
        padding: 8px;
      "
    ></div>
    <div v-if="dataUrl" class="download" style="margin-top: 8px">
      <a :href="dataUrl" download="qr.png">下载 PNG</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const text = ref('https://example.com')
const size = ref(256)
const qrBox = ref(null)
const dataUrl = ref(null)
const error = ref(null)

async function ensureLib() {
  if (window.QRCode) return
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function generate() {
  error.value = null
  dataUrl.value = null
  if (!text.value) return
  try {
    await ensureLib()
    const el = qrBox.value
    if (!el) return
    el.innerHTML = ''
    // Try constructor API
    if (typeof QRCode === 'function') {
      new QRCode(el, { text: text.value, width: size.value, height: size.value })
      const canvas = el.querySelector('canvas')
      if (canvas) dataUrl.value = canvas.toDataURL('image/png')
    } else if (typeof QRCode !== 'undefined' && typeof QRCode.toCanvas === 'function') {
      QRCode.toCanvas(el, text.value, { width: size.value, height: size.value }, (err) => {
        if (err) {
          error.value = err
          return
        }
        const c = el.querySelector('canvas')
        if (c) dataUrl.value = c.toDataURL('image/png')
      })
    } else {
      error.value = '二维码库不可用'
    }
  } catch (e) {
    error.value = '生成失败，请检查网络或脚本加载'
  }
}
</script>

<style scoped>
.tool-container {
  padding: 16px;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.qrcode-area {
  width: 100%;
}
.download {
  margin-top: 8px;
}
</style>
