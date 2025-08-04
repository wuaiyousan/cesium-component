/*
 * @Author: xionghaiying
 * @Date: 2025-08-04 15:51:08
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-04 16:14:05
 * @Description: 地图基本操作
 */
import Cesium from "@/utils/exportCesium";
import { viewConf } from "@/config/scene.config.js";

const { location } = viewConf;

export default function UseTools() {
  /**
   * @description: 地图缩小
   * @param {*} proportion：缩小比例
   * @param {*} duration：动画时间
   * @return {*}
   */    
  function mapZoomIn(params= {}) {
    const { proportion = 0.7, duration = 0.5 } = params;
    const camera = window.earthObj.camera;
    const currentHeight = camera.positionCartographic.height;
    const targetHeight = currentHeight * proportion;
    camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(
        camera.positionCartographic.longitude,
        camera.positionCartographic.latitude,
        targetHeight
      ),
      duration,
    });
  }
  /**
   * @description: 地图放大
   * @param {*} proportion：放大比例
   * @param {*} duration：动画时间
   * @return {*}
   */
  function mapZoomOut(params= {}) {
    const { proportion = 1.3, duration = 0.5 } = params
    const camera = window.earthObj.camera;
    const currentHeight = camera.positionCartographic.height;
    const targetHeight = currentHeight * proportion;
    camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(
        camera.positionCartographic.longitude,
        camera.positionCartographic.latitude,
        targetHeight
      ),
      duration,
    });
  }

  /**
   * @description: 复位，读取scene.config.js的初始化配置
   * @param {*} duration：动画时间
   * @return {*}
   */ 
  function mapReset(params = {}) {
    const {duration = 0.8} = params
    let toR = Cesium.Math.toRadians;
    let theViewer = window.earthObj;
    if (theViewer && theViewer.camera) {
      theViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          location.lon,
          location.lat,
          location.height
        ),
        duration,
      });
    }
  }
  return {
    mapZoomIn,
    mapZoomOut,
    mapReset,
  };
}
