<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-31 09:27:45
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 15:51:45
-->
<template>
  <div class="scene-container" ref="earthContainerRef">
    <slot></slot>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import Cesium from "../utils/exportCesium.js";
import UseViewer from "../uses/UseViewer.js";
import UseScene from "../uses/UseScene.js";
import eventMapBus from "../utils/eventMapBus.js";

const { initLayers } = UseViewer();
const { basicSetting, initScenario, initEvents, flyToByParams } = UseScene();
const { doEventOn, doEventSend, doEventOff } = eventMapBus();

const emit = defineEmits();
const doInit = async ({ sceneList }) => {
  return Promise.resolve(initContainer({ sceneList })).then(() => {
    emit("viewer-loaded", { sceneList });
  });
};

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
    default: () => ({}),
  },
  defaultOptions: {
    type: Object,
    default: () => ({
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
      baseLayer: false,
    }),
  },
});

const earthContainerRef = ref(null);
const initContainer = ({ sceneList }) => {
  // 创建地球
  let viewer = new Cesium.Viewer(earthContainerRef.value, Object.assign({}, defaultOptions, options));
  // 保存实例到全局
  window.earthObj = viewer;
  // 基础场景设置
  basicSetting(viewer);

  // 图层初始化
  initScenario(viewer, sceneList);

  // 初始化
  initLayers();

  // 初始化事件
  // todo: 加载时先不注册鼠标事件。根据情况按需处理
  initEvents(viewer);

  // 加载显示默认的场景并聚焦默认视图
  nextTick(() => {
    // 1.2s后飞入目标位置
    flyToByParams(viewer, 1.2);
  });

  doEventSend("map-inited", { a: 1 });

  return true;
};
</script>

<style lang="scss" scoped>
.scene-container {
  width: 100%;
  height: 100vh; /* 或固定高度，如 600px */
  position: relative; /* 关键！确保控件能正确定位 */
  margin: 0;
  padding: 0;
  overflow: hidden; /* 可选，防止滚动条影响布局 */
}
</style>
