/*
 * @Author: xionghaiying
 * @Date: 2022-05-10 09:28:25
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-03 16:37:08
 * @Description: UseViewer
 */
import UseDataSource from "./UseDataSource.js";
import mapConf from "../config/map.config.js";
import { basicLayerTypes } from "../config/default.config.js"

export default function UseViewer() {
  const { loadDataSourceByParams } = UseDataSource();
  /**
   * @description: 初始化map.config的配置图层
   * @return {*}
   */
  function initLayers() {
    // 初始化DataSouce
    // 基础数据源
    let basicDataSource = mapConf.getBasicLayer();
    basicDataSource.forEach((source) => {
      let { id, title, layerName, dataType, userName, index, visible, extData } = source;
      loadDataSourceByParams({ id, title, name: id, type: dataType, show: visible, extData });
    });

    // 其余数据源
    // let otherDataSource = mapConf.getLayers().filter((item) => item.groupType === "dataSource");
    let otherDataSource =  mapConf.getLayers().flatMap((group) =>
      group.groupList.filter(
        (val) =>  val.visible && basicLayerTypes.includes(val.dataType)  
      )
    );
    otherDataSource.forEach((list) => {
        let { id, title, layerName, dataType, userName, index, visible, extData } = list;
        loadDataSourceByParams({ id, title, name: id, type: dataType, show: visible, extData });
    });
  }
  /**
   * @description: 给整个viewer对象添加自定义属性
   * @param {*} data
   * @return {*}
   */
  function setPropertiesToViewer({ data }) {
    if (!data) return;
    for (const [key, value] of Object.entries(data)) {
      window._viewer.properties[key] = value;
    }
    // todo:增加监听判断
    if (data.hasOwnProperty("troopsType")) {
      console.log("troopsType", data.troopsType);
    }
  }

  // 获取相机参数
  function getView(camera) {
    let td = Cesium.Math.toDegrees;
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
    };
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
    });
  }

  return {
    initLayers,
    getView,
    flyToView,
  };
}
