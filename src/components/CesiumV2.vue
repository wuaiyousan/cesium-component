<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 17:47:38
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-30 14:45:06
-->
<template>
    <div id="cesium-container" ref="cesiumContainer"></div>
  </template>
  
  <script>
  import { onMounted, onUnmounted, ref } from "vue";
  import * as Cesium from "cesium";
  // import "cesium/Build/Cesium/Widgets/widgets.css";
  
  export default {
    name: "CesiumViewer",
    props: {
      options: {
        type: Object,
        default: () => ({}),
      },
    },
    setup(props) {
      const cesiumContainer = ref(null);
      let viewer = null;
      onMounted(async () => {
        if (cesiumContainer.value) {
            console.log('xhy222', window.CESIUM_BASE_URL);
          // 创建 Cesium Viewer
          viewer = new Cesium.Viewer(cesiumContainer.value, {
            ...props.options,
            // 默认配置
            // baseLayer:false,
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
  
      return {
        cesiumContainer,
      };
    },
  };
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
  