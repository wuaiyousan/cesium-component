<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:29
 * @LastEditors: xionghiaying 
 * @LastEditTime: 2025-11-04 14:24:22
-->

<template>
  <div class="viewer-view">
    <!-- 地图容器 -->
    <ViewerMap :options="viewOptions" class="viewer-map" ref="mapRef" @viewer-loaded="viewerLoaded">
      <MapTools></MapTools>
      <slot name="mapSlot"></slot>
    </ViewerMap>
    <!---->
    <EventCollection/>
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

import mapConfig from "./config/map.config.js";
import { viewConf } from "./config/viewer.config.js";

// 组件
import ViewerMap from "./basic/ViewerMap.vue";
import MapTools from "./basic/MapTools.vue";
import EventCollection from "./basic/EventCollection.vue";

// 事件


const { viewOptions } = viewConf;

onMounted(() => {
  if (mapRef.value) {
    // 初始化场景
    initScene();
  }
});

onBeforeUnmount(() => {
  let toEarth = window.earthObj;
  if (toEarth) {
  }
});

const mapRef = ref(null);

const initScene = () => {
  let toRef = mapRef.value;
  if (toRef) {
    let defaultLayers = mapConfig.getScenarioList().filter((item) => item.isDefault);
    let basicLayers = defaultLayers.flatMap((item) => {
      return item.layerList.filter((it) => it.checked);
    });
    toRef.doInit({ sceneList: basicLayers });
  }
};

const viewerLoaded = () => {
  const viewer = window.earthObj;
  viewer.scene.sun.show = true; //太阳
  viewer.scene.moon.show = false; //月亮

  // 后处理渲染
  // const fs =
  // 	'uniform sampler2D colorTexture;\n' +
  // 	'varying vec2 v_textureCoordinates;\n' +
  // 	'uniform float scale;\n' +
  // 	'uniform vec3 offset;\n' +
  // 	'void main() {\n' +
  // 	'    vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
  // 	'    gl_FragColor = vec4(color.rgb * scale + offset, 1.0);\n' +
  // 	'}\n';
  // viewer.scene.postProcessStages.add(
  // 	new Cesium.PostProcessStage({
  // 		fragmentShader: fs,
  // 		uniforms: {
  // 			scale: 1.1,
  // 			offset: function () {
  // 				return new Cesium.Cartesian3(0.1, 0.2, 0.3);
  // 			},
  // 		},
  // 	})
  // );
};
</script>

<style scoped>
.viewer-view {
  width: 100%;
  height: 100%;
}
.viewer-map {
  top: 0;
  left: 0;
  height: 100%;
}
</style>
