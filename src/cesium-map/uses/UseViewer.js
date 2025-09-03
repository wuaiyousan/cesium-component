/*
 * @Author: xionghaiying
 * @Date: 2025-07-31 10:11:24
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 11:13:38
 * @Description: 
 */
/*
 * @Author: xionghaiying
 * @Date: 2022-05-10 09:28:25
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 11:10:06
 * @Description: UseViewer
 */

export default function UseViewer() {
  // 获取相机参数
  function getView(camera) {
    let td = Cesium.Math.toDegrees
    return {
      lon: Number(td(camera.positionCartographic.longitude).toFixed(5)),
      lat: Number(td(camera.positionCartographic.latitude).toFixed(5)),
      height: Number(camera.positionCartographic.height.toFixed(2)),
      // 偏航
      heading: Number(td(camera.heading).toFixed(2)),
      // 俯仰
      pitch: Number(td(camera.pitch).toFixed(2)),
      // 翻滚
      roll: Number(td(camera.roll).toFixed(2)),
    }
  }

  // 飞行到视图
  function flyToView(to, camera, toDuration = 0.8) {
    camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(to.lon, to.lat, to.height),
      orientation: {
        heading: Cesium.Math.toRadians(to.heading),
        pitch: Cesium.Math.toRadians(to.pitch),
        roll: Cesium.Math.toRadians(to.roll),
      },
      duration: toDuration,
    })
  }

  return {
    getView,
    flyToView,
  }
}
