<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:29
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-30 14:41:50
-->

<template>
  <div id="cesium-container" ref="cesiumContainer"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as Cesium from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";
const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
});

const cesiumContainer = ref(null);
let viewer = null;
onMounted(() => {
  if (cesiumContainer.value) {
    // 创建 Cesium Viewer
    viewer = new Cesium.Viewer(cesiumContainer.value, {
      ...props.options,
      // 默认配置
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      shouldAnimate: true,
      // baseLayer:false
    });

    // 添加一些默认场景
    viewer.scene.globe.enableLighting = true;
  }
});

onUnmounted(() => {
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy();
  }
});

</script>

<style scoped>
#cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
