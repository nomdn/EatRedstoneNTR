<template>
  <div class="center-page">
    <h1>在这下载</h1>
    <el-button @click="openDownload" style="margin-bottom: 100px">点我前往下载</el-button>
  </div>
</template>

<script setup>
function openDownload() {
  window.open('https://github.com/nomdn/EatRedstoneNT/releases/latest')
}
</script>

<style scoped src="../style.css"></style>
<style scoped>
.center-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>
