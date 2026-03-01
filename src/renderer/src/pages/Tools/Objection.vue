<template>
  <div class="card">
    <h1>异议</h1>
    <h3>点击成不当开始异议！</h3>

    <div class="images">
      <img :src="'./' + value + '.gif'" class="image1" v-if="active"></img>
      <img src="/cbt.webp" @click="handleClick" @mouseenter="handleClick" class="image2"></img>
    </div><br>
    <el-select v-model="value" placeholder="Select" style="width: 240px;margin-top: 25%;">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

  </div>
  <meting-js server="netease" type="playlist" id="9487616885" fixed="true" loop="one" order="list" preload="false" list-folded="ture" list-max-height="350px" mini="true" autoplay="true"></meting-js>
</template>
<script setup>
  import { ref } from 'vue'
  import { ElSelect, ElOption } from 'element-plus'

  const value = ref('')
  const active = ref(false)
  const options = [
    {
      value: 'yy',
      label: '异议！',
    },
    {
      value: 'dd',
      label: '等等！',
    },
    {
      value: 'kz',
      label: '看招!',
    }
  ]
  function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
  }
  function handleClick() {
    if (!value.value) {
      value.value = 'yy'
    }
    const music = new Audio("./"+value.value+".wav");
    active.value = true

    music.play();
    sleep(1000).then(() => {
      active.value = false
    })
  }
</script>
<style scoped>
  .card {
    display: flex;
    margin: 10px;
    flex-direction: column;
    padding: 16px;
  }
  img {
    width: 200px;
    height: auto;
    cursor: pointer;
    margin-bottom: 16px;
  }
  .images {
    position: relative;
    width: 300px;
    height: 200px;
  }

  .image1 {
    position: absolute;
    margin-right: 5%;
    margin-top: 40%;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .image2 {
    position: absolute;
    z-index: 0;
  }

</style>
