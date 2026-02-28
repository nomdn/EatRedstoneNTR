<script setup lang="ts">
import { onMounted, ref } from 'vue'
import 'html-midi-player'

const playerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // 等待 DOM 完全就绪
  setTimeout(() => {
    const player = playerRef.value as any
    if (player) {
      // 【关键修复】显式地再次设置属性，触发组件内部逻辑
      // 哪怕模板里写了，这里再设一次能确保它真的生效
      player.setAttribute('visualizer', '#myVisualizer')

      console.log('✅ 已强制绑定 visualizer 到 #myVisualizer')

      // 可选：监听加载事件确认
      player.addEventListener('load', () => {
        console.log('🎵 MIDI 加载完成，可视化应已启动')
      })
    }
  }, 100) // 延迟 100ms 确保 midi-visualizer 已存在于 DOM 中
})
</script>

<template>
  <div class="card">
    <h2>播放春日影</h2>
    <a href="https://www.midishow.com/en/midi/ff14-bang-dream-it-s-mygo-midi-download-179214" target="_blank">
      这个 MIDI 出自这里
    </a>

    <!--
      修正点 1: visualizer 属性必须是 CSS 选择器格式 (#id)
      这里指向下方的 id="myVisualizer"
    -->
    <midi-player
      ref="playerRef"
      src="./Haruhikage.mid"
      sound-font
      visualizer="#myVisualizer"
      style="width: 100%; display: block; margin-top: 8px"
    ></midi-player>

    <!--
      修正点 2: 必须添加 id 以匹配上面的选择器
      修正点 3: 必须设置 height (高度)，否则默认为 0 看不见
      修正点 4: 建议添加背景色以便观察区域
    -->
    <midi-visualizer
      type="waterfall"
      id="myVisualizer"
      style="height: 300px; width: auto; background: #f5f5f5; display: block; margin-top: 8px;"
    ></midi-visualizer>

  </div>
</template>

<style scoped>
a {
  color: var(--el-color-primary);
  text-decoration: none;
  margin: 16px 0;
  display: block; /* 让链接独占一行，美观些 */
}
.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
}
/* 删除未使用的 textarea 样式 */
</style>
