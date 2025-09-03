/*
 * @Author: xionghaiying
 * @Date: 2025-09-03 11:11:01
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 11:13:12
 * @Description: UsePrimitive
 */
export default function UsePrimitive() {
  // 定位
  function zoomToPrimitive(viewer, keyVal, key = "code", opts = { duration: 1 }) {
    let tilesets = viewer.scene.primitives._primitives.filter((it) => it[key] === keyVal);
    viewer.flyTo(tilesets[0], opts);
  }
  return {
    zoomToPrimitive
  };
}
