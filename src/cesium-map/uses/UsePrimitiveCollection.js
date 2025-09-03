/*
 * @Author: xionghaiying
 * @Date: 2025-09-03 11:08:22
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 11:53:27
 * @Description: UsePrimitiveCollection
 */
import Cesium from "../utils/exportCesium.js"
export default function UsePrimitiveCollection() {
  function loadPrimitiveCollection({ id, properties = {} }) {
    const collection = new Cesium.PrimitiveCollection();
    window.earthObj.scene.primitives.add(collection);
    // 补充属性
    collection.uuid = id;
    collection.properties = properties;
    return collection;
  }

  // 加载贴地内容项
  function unloadGroundLayer(id) {
    let toDel = findGroundLayerById(id);
    if (toDel) {
      window.earthObj.scene.groundPrimitives.remove(toDel);
    }
  }

  // 切换显示贴地图层
  function toggleGroundLayer(id, isShow) {
    let toLayer = findGroundLayerById(id);
    if (toLayer) {
      toLayer.show = isShow;
    }
  }

  function findGroundLayerById(id, keyProp = "uuid") {
    let out = null;
    let groundCol = window.earthObj.scene.groundPrimitives;
    for (let i = 0, len = groundCol.length, t = null; i < len; i++) {
      t = groundCol.get(i);
      if (t[keyProp] === id) {
        out = t;
        break;
      }
    }
    return out;
  }

  return {
    loadPrimitiveCollection,
    findGroundLayerById,
    unloadGroundLayer,
    toggleGroundLayer,
  };
}
