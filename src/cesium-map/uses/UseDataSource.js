/*
 * @Author: xionghaiying
 * @Date: 2024-06-26 15:31:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-01 11:42:25
 * @FilePath: \visualization\src\views\map\uses\UseDataSource.js
 * @Description: DataSource 方法集合
 */
import Cesium from "@/utils/cesium";

export default function UseDataSource() {
  // 创建
  function loadDataSourceByParams({ type = "custom",name = "basicDraw", dataList = null }) {
    let theDS = findDataSourceByName(name)
    if (!theDS) {
      let viewer = window.earthObj
      switch (type) {
        case "custom":
          const customDataSoure = new Cesium.CustomDataSource(name)
          viewer.dataSources.add(customDataSoure)
          return customDataSoure
          break
        case "geoJson":
          if(!dataList){
            const geoJsonDataSource = new Cesium.GeoJsonDataSource({ name,dataList })
            viewer.dataSources.add(geoJsonDataSource)
            return geoJsonDataSource
          }
          break
        default:
          break
      }
    }
    return theDS
  }

  // 卸载
  function unloadDataSourceLayer(key) {
    const DataSources = window.earthObj.dataSources
    let theDS = findDataSourceByName(key)
    DataSources.remove(theDS[0])
  }

  // 隐藏
  function hideOrShowDataSourceLayer(key, show) {
    let theDS = findDataSourceByName(key)
    if (theDS) {
      theDS.show = show
    }
  }

  // 根据name获取DataSoure
  function findDataSourceByName(key) {
    const DataSources = window.earthObj.dataSources
    let theDS = DataSources.getByName(key)
    if (theDS.length === 1) {
      return theDS[0]
    }
    return false
  }

  // 根据属性获取DataSoure
  function findDataSourceByParam(key, keyVal = "tag") {
    let out = null
    const DataSources = window.earthObj.dataSources
    for (let i = 0, len = DataSources.length, t = null; i < len; i++) {
      t = DataSources.get(i)
      if (t[keyVal] === key) {
        out = t
        break
      }
    }
    return out
  }
  // 显影图层
  function hideOrShowLayer({ key, show, modelCode = false }) {
    // DataSoure
  }

  // 通过参数获取相应类型测站
  function findEntityByParam({ key, keyVal = "id", sourceKey }) {
    let ToViewer = (window.earthObj) || null
    if (!ToViewer) {
      return false
    }
    let theDs = findDataSourceByParam(sourceKey)
    if (theDs) {
      let theEntity = null
      if (keyVal === "id") {
        theEntity = theDs.entities.getById(key)
      } else {
        theEntity = theDs.entities.values.find((entity) => entity.properties.getValue()[keyVal] === key)
      }
      return theEntity
    }
    return false
  }

  return {
    findEntityByParam,
    loadDataSourceByParams,
    unloadDataSourceLayer,
    hideOrShowDataSourceLayer,
    hideOrShowLayer
  }
}
