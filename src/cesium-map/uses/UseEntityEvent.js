/*
 * @Author: xionghaiying
 * @Date: 2025-08-29 15:32:48
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-06 15:05:46
 * @Description: entity对象监听管理
 */

import Cesium from "../utils/exportCesium";
export default function UseEntityEvent() {
  /**
   * @description: 给entity对象的自定义属性添加监听
   * @param {*} entity
   * @return {*}
   */
  function addListenerToProperties({ entity }) {
    entity.properties.definitionChanged.addEventListener(function (allProperty, changeProperty, oldValue, newValue) {
      // console.log('所有属性：', allProperty);
      // console.log(`变化的属性名${changeProperty},oldValue:${oldValue},newValue:${newValue}`);
      if (changeProperty === "type") {
        console.log("xhy002");
        //
        entity.polyline.material = Cesium.Color.fromCssColorString("#fff000");
        entity.polyline.width = newValue

        // 控制显影
        // entity.show = false;

        //
        let testPos = [112.97, 28.24, 112.95, 28.2, 112.93, 28.2, 112.91, 28.22];
        entity.polyline.positions = Cesium.Cartesian3.fromDegreesArray(testPos);
      }
    });
  }

  return {
    addListenerToProperties,
  };
}
