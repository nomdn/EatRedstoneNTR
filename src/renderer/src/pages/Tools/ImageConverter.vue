<template>
  <div class="tool-container">
    <h3>图片格式转换</h3>
    <div class="row">
      <input type="file" accept="image/*" @change="onFileChange" />
      <select v-model="targetFormat" style="margin-left: 8px">
        <option value="image/png">PNG</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/webp">WEBP</option>
        <option value="image/x-icon">ICO (ICO)</option>
      </select>

      <button @click="convert" :disabled="!imgSrc">转换</button>
    </div>
    <div class="preview" v-if="imgSrc">
      <img :src="imgSrc" alt="preview" style="max-width: 400px; max-height: 300px" />
    </div>
    <div class="download" v-if="outputUrl">
      <a :href="outputUrl" download="converted">下载转换后的图片</a>
    </div>
    <canvas ref="canvas" width="800" height="600" style="display: none"></canvas>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const img = ref(null)
const imgSrc = ref(null)
const targetFormat = ref('image/png')
const outputUrl = ref(null)
const status = ref('idle')
const canvas = ref(null)
const compress = ref(false)
const maxDim = ref(256)

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    imgSrc.value = ev.target?.result
  }
  reader.readAsDataURL(file)
  img.value = file
  outputUrl.value = null
}
async function convert() {
  if (!imgSrc.value) return
  // ICO path
  if (targetFormat.value === 'image/x-icon') {
    const dataURL = imgSrc.value
    const img = new Image()
    img.onload = async () => {
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (compress.value) {
        const maxD = Math.max(1, maxDim.value)
        const scale = Math.min(maxD / w, maxD / h, 1)
        w = Math.floor(w * scale)
        h = Math.floor(h * scale)
      }
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      off.getContext('2d').drawImage(img, 0, 0, w, h)
      off.toBlob(async (pngBlob) => {
        if (!pngBlob) {
          outputUrl.value = null
          status.value = 'error'
          return
        }
        const reader = new FileReader()
        reader.onload = async () => {
          const pngBytes = new Uint8Array(reader.result)
          const widthByte = w >= 256 ? 0 : w
          const heightByte = h >= 256 ? 0 : h
          const headerSize = 6
          const dirSize = 16
          const imageOffset = headerSize + dirSize
          const icoBuf = new ArrayBuffer(headerSize + dirSize + pngBytes.byteLength)
          const dv = new DataView(icoBuf)
          dv.setUint16(0, 0, true)
          dv.setUint16(2, 1, true)
          dv.setUint16(4, 1, true)
          dv.setUint8(6, widthByte)
          dv.setUint8(7, heightByte)
          dv.setUint8(8, 0)
          dv.setUint8(9, 0)
          dv.setUint16(10, 0, true)
          dv.setUint16(12, 0, true)
          dv.setUint32(14, pngBytes.byteLength, true)
          dv.setUint32(18, imageOffset, true)
          new Uint8Array(icoBuf, imageOffset).set(pngBytes)
          const icoBlob = new Blob([icoBuf], { type: 'image/x-icon' })
          outputUrl.value = URL.createObjectURL(icoBlob)
          status.value = 'done'
        }
        reader.readAsArrayBuffer(pngBlob)
      }, 'image/png')
    }
    img.src = dataURL
  } else {
    // Regular image formats
    const image = new Image()
    image.onload = () => {
      const c = canvas.value
      if (!c) return
      const ctx = c.getContext('2d')
      let w = image.naturalWidth
      let h = image.naturalHeight
      if (compress.value) {
        const maxD = Math.max(1, maxDim.value)
        const scale = Math.min(maxD / w, maxD / h, 1)
        w = Math.floor(w * scale)
        h = Math.floor(h * scale)
      }
      c.width = w
      c.height = h
      ctx.drawImage(image, 0, 0, w, h)
      const dataURL = c.toDataURL(targetFormat.value)
      outputUrl.value = dataURL
      status.value = 'done'
    }
    image.src = imgSrc.value
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
  margin-bottom: 12px;
}
.preview {
  margin-top: 12px;
}
</style>
