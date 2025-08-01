<!--
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:29
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-01 10:50:47
-->

<template>
  <div class="scene-view">
    <!-- 地图容器 -->
    <SceneMap
      :options="viewOptions"
      class="scene-map"
      ref="mapRef"
      @scene-loaded="sceneLoaded"
    >
      <MapTools></MapTools>
      <slot name="mapSlot"></slot>
    </SceneMap>
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

import mapConfig from "./config/map.config.js";
import { viewConf } from "./config/scene.config.js";
import eventMapBus from "./utils/eventMapBus.js";

// 组件
import SceneMap from "./basic/SceneMap.vue";
import MapTools from "./basic/MapTools.vue";

const { viewOptions } = viewConf;
const { doEventSubscribe, doEventSend } = eventMapBus();

onMounted(() => {
  if (mapRef.value) {
    // 初始化场景
    initScene();
    // 订阅与发送
    doEventSubscribe("map-test", mapTest);
  }
});

onBeforeUnmount(() => {
  let toEarth = window.earthObj;
  if (toEarth) {
  }
});

const mapTest = (data) => {
  console.log("xhy----mapTest", data);
};

const mapRef = ref(null);

const initScene = () => {
  let toRef = mapRef.value;
  if (toRef) {
    let defaultLayers = mapConfig
      .getScenarioList()
      .filter((item) => item.isDefault);
    let basicLayers = defaultLayers.flatMap((item) => {
      return item.layerList.filter((it) => it.checked);
    });
    toRef.doInit({ sceneList: basicLayers });
  }
};

const sceneLoaded = () => {
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
.scene-view {
  width: 100%;
  height: 100%;
}
.scene-map {
  top: 0;
  left: 0;
  height: 100%;
}
</style>
