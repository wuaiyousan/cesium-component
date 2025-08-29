/*
 * @Author: xionghaiying
 * @Date: 2025-08-29 15:32:48
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-29 16:37:33
 * @Description: entity对象监听管理
 */
export default function UseEntityEvent() {
  /**
   * @description: 给entity对象的自定义属性添加监听
   * @param {*} entity
   * @return {*}
   */
  function addListenerToProperties({ entity }) {
    entity.properties.definitionChanged.addEventListener(function (allProperty, changeProperty, oldValue, newValue, a, b ,c) {
      console.log('所有属性：', allProperty);
      console.log(`变化的属性名${changeProperty},oldValue:${oldValue},newValue:${newValue}`);
      if (changeProperty === "type") {
        console.log("xhy002");
      }
    });
  }

  return {
    addListenerToProperties,
  };
}
