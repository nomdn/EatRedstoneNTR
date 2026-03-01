<script setup>
import { ElButton, ElCarousel, ElCarouselItem, ElCollapse, ElMenu } from 'element-plus'

import { ref } from 'vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
const home_router = useRouter()
function pushtodownload() {
  home_router.push('/download')
}
</script>
<template>
  <div class="center-page">

    <h2 style="margin-top: 30px">这不是一个网页，他只是用了网页的技术栈</h2>
    <h3 style="margin-top: 20px">这是一个正常的软件，所以我不能在这里发疯</h3>
    <h4>Made By <span style="color: #007bff;">nomdn</span></h4>
  </div>
</template>

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
