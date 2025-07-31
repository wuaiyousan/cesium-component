/*
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:13
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 15:44:20
 */
import CesiumViewer from './cesium-map/CesiumViewer.vue'
import eventMapBus from "./cesium-map/utils/eventMapBus";

const plugin = {
  install(app) {
    app.component('CesiumViewer', CesiumViewer)
  }
}

export default plugin
export const { doEventSubscribe, doEventSend } = eventMapBus();
