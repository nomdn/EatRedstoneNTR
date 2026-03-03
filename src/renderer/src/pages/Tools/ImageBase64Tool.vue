<template>
  <div class="tool-image-base64 base64-card">
    <h3>图片 Base64 转换</h3>
    <div style="display: flex; gap: 16px; align-items: flex-start">
      <div>
        <input type="file" accept="image/*" @change="onImageChange" />
        <div v-if="imageDataURL" style="margin-top: 6px">
          <img
            :src="imageDataURL"
            alt="图片预览"
            style="max-width: 180px; display: block; border: 1px solid #ddd"
          />
        </div>
      </div>
      <div style="flex: 1">
        <button @click="encodeImageToBase64" :disabled="!imageFile">将图片转为 Base64</button>
        <textarea v-model="imageBase64" rows="6" placeholder="图片的 Base64（data URL）"></textarea>
        <div style="margin-top: 6px">
          <button @click="copyImageBase64" :disabled="!imageBase64">复制 Base64</button>
        </div>
      </div>
      <div style="flex: 0 0 auto">
        <button @click="decodeBase64ToImage" :disabled="!imageBase64 && !imageDataURL">
          将 Base64 解码为图片
        </button>
      </div>
    </div>
    <div v-if="decodedImageURL" style="margin-top: 8px">
      <h4>解码图片预览</h4>
      <img
        :src="decodedImageURL"
        alt="解码图片"
        style="max-width: 300px; display: block; border: 1px solid #ccc"
      />
    </div>
    <div v-if="decodeError" style="color: #c33; margin-top: 6px">{{ decodeError }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const imageFile = ref(null)
const imageDataURL = ref<string | null>(null)
const imageBase64 = ref<string>('')
const decodedImageURL = ref<string | null>(null)
const decodeError = ref<string | null>(null)

function onImageChange(e) {
  const f = e.target?.files?.[0] ?? null
  imageFile.value = f
  if (f) {
    const reader = new FileReader();
    reader.onload = () => {
      imageDataURL.value = reader.result as string
    }
    reader.readAsDataURL(f);
  }
}

function encodeImageToBase64() {
  if (!imageFile.value) return
  const reader = new FileReader();
  reader.onload = () => {
    imageBase64.value = reader.result as string
  }
  reader.readAsDataURL(imageFile.value);
}

async function copyImageBase64() {
  if (!imageBase64.value) return
  try { await navigator.clipboard.writeText(imageBase64.value) } catch {}
}

function decodeBase64ToImage() {
  const src = (imageBase64.value || imageDataURL.value || '').trim()
  if (!src) { decodeError.value = '无输入数据'; return }
  if (src.startsWith('data:')) {
    decodedImageURL.value = src
  } else {
    decodedImageURL.value = 'data:image/png;base64,' + src
  }
  decodeError.value = null
}
</script>

<style scoped>
.base64-card {
  padding: 16px;
}
textarea {
  width: 100%;
}
.tool-image-base64 img {
  max-width: 180px;
  display: block;
}
</style>
