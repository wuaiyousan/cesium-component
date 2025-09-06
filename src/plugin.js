/*
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:13
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-06 16:14:47
 */
import CesiumMap from './cesium-map/CesiumMap.vue'
import eventMapBus from "./cesium-map/utils/eventMapBus";

const plugin = {
  install(app) {
    app.component('CesiumMap', CesiumMap)
  }
}

export default plugin
export const { doEventOn, doEventSend } = eventMapBus();
