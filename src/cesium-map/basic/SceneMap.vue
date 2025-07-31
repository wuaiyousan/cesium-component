<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-31 09:27:45
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 14:19:32
-->
<template>
  <div class="scene-container" ref="earthContainerRef">
    <slot></slot>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as Cesium from "cesium";
import UseScene from "../uses/UseScene.js";

const { basicSetting, initOthers, initEvents, flyToDefault } = UseScene();

const emit = defineEmits();
async function doInit({ sceneList }) {
  return Promise.resolve(initContainer({ sceneList })).then(() => {
    emit("scene-loaded", { sceneList });
  });
}

// 对外公开的方法
defineExpose({
  doInit,
});

onMounted(() => {});

onBeforeUnmount(() => {
  if (window.earthObj) {
    window.earthObj = window.earthObj.destroy();
    window.earthObj = null;
  }
});

const { options, defaultOptions } = defineProps({
  options: {
    type: Object,
    default: function () {
      return {};
    },
  },
  defaultOptions: {
    type: Object,
    default: function () {
      return {
        animation: false,
        homeButton: false,
        // 是否显示3D/2D选择器,与scene3DOnly不能同时为true
        // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        scene3DOnly: false,
        sceneModePicker: false,
        requestRenderMode: true,
        fullscreenButton: false,
        vrButton: false,
        infoBox: false,
        navigationHelpButton: false,
        timeline: false,
        baseLayerPicker: false,
        geocoder: false,
        selectionIndicator: false,
        navigationInstructionsInitiallyVisible: false,
        shouldAnimate: true,
        // baseLayer:false
      };
    },
  },
});

const earthContainerRef = ref(null);
function initContainer({ sceneList }) {
  // 创建地球
  let viewer = new Cesium.Viewer(
    earthContainerRef.value,
    Object.assign({}, defaultOptions, options)
  );

  //   // 基础场景设置
  //   basicSetting(viewer);

  //   // 依据配置将场景树中的“地形”等进行初始化
  //   initOthers(viewer, sceneList);

  //   // 初始化事件
  //   initEvents(viewer);

  //   // 加载显示默认的场景并聚焦默认视图
  //   nextTick(() => {
  //     flyToDefault(viewer);
  //   });

  // 保存实例到全局
  window.earthObj = viewer;

  return true;
}
</script>

<style scoped>
.scene-container {
  width: 100%;
  height: 100vh; /* 或固定高度，如 600px */
  position: relative; /* 关键！确保控件能正确定位 */
  margin: 0;
  padding: 0;
  overflow: hidden; /* 可选，防止滚动条影响布局 */
}
</style>
