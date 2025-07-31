/*
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:13
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 09:09:08
 */
import CesiumViewer from './cesium-map/CesiumViewer.vue'
// import CesiumViewer from './App.vue'

const plugin = {
  install(app) {
    app.component('CesiumViewer', CesiumViewer)
  }
}

export default plugin
// export { CesiumViewer }