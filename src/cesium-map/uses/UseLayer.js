/*
 * @Author: xionghaiying
 * @Date: 2022-06-21 17:49:25
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 19:23:21
 * @Description: UseLayer
 */
import Cesium from "@/utils/cesium";
export default function UseLayer() {
  // 加载或卸载数据
  // 加载WmsLayer矢量线划数据
  function loadWmsLayer(layerNode, toEarth = window.earthObj) {
    let theLayer = findLayerByParam(layerNode, toEarth)
    if (theLayer) {
      theLayer.show = true
    } else {
      let theViewer = toEarth
      let imageryLayer  = theViewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapServiceImageryProvider({
          url: layerNode.url,
          layers: layerNode.params.layers,
          parameters: Object.assign({},layerNode.params, {
            transparent: true, // 设置透明度
            format: 'image/png',
          }),
        })
      );
      imageryLayer.id = layerNode.id;
    }
  }

  // 加载
  function loadWmtsLayer(layerNode, toEarth = window.earthObj){
    let theLayer = findLayerByParam(layerNode, toEarth)
    if (theLayer) {
      theLayer.show = true
    } else {
      let theViewer = toEarth
      let { params, extData } = layerNode;
      // 基础对象
      let options = {
          url: layerNode.url,
          format: params.format ? params.format : 'image/png', 
          layer: params.layer,
          style: params.style ? params.style : '',
          tileMatrixSetID: params.tileMatrixSetID,
          BIZid:layerNode.id,
          subdomains: params.subdomains,
      };
      // 天地图特殊处理
      if(params.layer === 'tdtBasicLayer'){
        options = Object.assign({}, options, {    
          subdomains: params.subdomains,
        }) 
      }else {
        // 4326坐标系这样定义
        const tilingScheme = new Cesium.GeographicTilingScheme({
          numberOfLevelZeroTilesX: 2,
          numberOfLevelZeroTilesY: 1,
        });
        // eslint-disable-next-line max-len
        let rectangle2 = null
        if(extData && extData.rectangles){
          rectangle2 = new Cesium.Rectangle(
            Cesium.Math.toRadians(extData.rectangles[0]), 
            Cesium.Math.toRadians(extData.rectangles[1]), 
            Cesium.Math.toRadians(extData.rectangles[2]), 
            Cesium.Math.toRadians(extData.rectangles[3])
          );
        }
        options = Object.assign({}, options, {
          tilingScheme: params.tilingScheme ? params.tilingScheme : tilingScheme,
          ellipsoid: Cesium.Ellipsoid.WGS84,
          rectangle: rectangle2 ,
          maximumLevel: params.maximumLevel ? params.maximumLevel : 21,
          minimumLevel: params.minimumLevel ? params.minimumLevel : 5,
        }) 
      }

      let wmtsImageryProvider = new Cesium.WebMapTileServiceImageryProvider(options);
      // const wmtsImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
      //   url: 'https://{s}.tianditu.gov.cn/vec_w/wmts?tk=d5884019533677e99fed5ed36e05c4d3&service=WMTS&request=GetTile&version=1.0.0', // 天地图示例
      //   //`https://t0.tianditu.gov.cn/img_w/wmts?
      //   //SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w
      //   //&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=fd1a28bea0a80604b9b2744ccb6e208a`
      //   layer: 'vec',
      //   style: 'default',
      //   format: 'tiles',
      //   tileMatrixSetID: 'w',
      //   subdomains: ['t0', 't1', 't2', 't3', 't4'], // 天地图的 5 个子域名
      //   maximumLevel: 18,
      //   tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18']
      // });
      const imageryLayer = theViewer.imageryLayers.addImageryProvider(wmtsImageryProvider);
      // 加载后的处理
      if(extData && extData.brightness){
        imageryLayer.brightness = 0.3
      }
      imageryLayer.id = layerNode.id;
    }
  }

  // 加载地形
  function loadTerrainProvider(layerNode, toEarth = window.earthObj){
    let theViewer = toEarth;
    if (layerNode.type === 'ArcGISTiledElevationTerrainProvider') {
      theViewer.terrainProvider =
        new Cesium.ArcGISTiledElevationTerrainProvider({
          url: layerNode.url,
        })
    } else if (layerNode.type === 'CesiumTerrainProvider') {
      theViewer.terrainProvider = new Cesium.CesiumTerrainProvider({
        url: layerNode.url,
        requestVertexNormals: layerNode.requestVertexNormals || false,
        requestWaterMask: layerNode.requestWaterMask || false,
      })
    } else {
      console.log('Scene@initOthers,不支持的类型！')
    }
  }

  // 隐藏图层
  function unloadMapServiceLayer(layerNode, toEarth = window.earthObj) {
    let theLayer = findLayerByParam(layerNode, toEarth)
    if (theLayer) {
      theLayer.show = false
    }
  }
  
  // 通过 图层配置 信息查找数据目录图层
  function findLayerByParam(layerNode, toEarth = window.earthObj) {
    let theViewer = toEarth
    let layerCollection = theViewer.imageryLayers
    for (
      let i = 0,
        len = layerCollection.length,
        tmpLayer = null;
      i < len;
      i++
    ) {
      tmpLayer = layerCollection.get(i)
      if (tmpLayer && tmpLayer.id === layerNode.id ) {
        return tmpLayer
      }
    }
    return null
  }

  // 格式化数据
  function formatList({
    list,
    isAddValue = false,
  }) {
    let out = [];
    //过滤geometry为空的数据
    if(Array.isArray(list)){
      list = list.filter((it)=> it.geometry);
    }else {
      return list
    }
    if(!list.length){
      return out
    }
    if(list.length && list[0].hasOwnProperty('geometry')){
      [].concat(list || []).forEach((tmp) => {
      if (tmp && tmp.geometry && tmp.geometry.coordinates &&(tmp.geometry.coordinates.length  ||  Number(tmp.geometry.coordinates[0]) > 0 )) {
          //补充一些参数 todo:最好能在服务接口中增加
          if(tmp.properties&&!tmp.properties.hasOwnProperty('id')){
            //此ID用于补全featrue对象
            tmp.properties = {
              id:tmp.properties.deviceCode || tmp.properties.facilityCode,
              ...tmp.properties
            }
            //此ID用于 featrue.getId 方法的使用
            if(isAddValue){
              tmp = {
                id:tmp.properties.deviceCode,
                grouptype:tmp.properties.deviceType,
                ...tmp
              }
            }else{
              tmp = {
                id:tmp.properties.deviceCode || tmp.properties.facilityCode,
                ...tmp
              }
            }
            out.push(tmp)
          }
          else{
              
              let feature={};
              feature.type="feature";
              feature.geometry=tmp.geometry;
              feature.properties={
                id:tmp.equipCode,
                ...tmp
              };
              Reflect.deleteProperty(feature.properties, "geometry");
              out.push(feature)
          } 
        }
      });    
    }
    // 补充结构
    const geojson= {
      type: 'FeatureCollection',
      features: out,
    }
    return geojson
  }



  return {
    loadWmsLayer,
    loadWmtsLayer,
    loadTerrainProvider,
    unloadMapServiceLayer,
    findLayerByParam,
  }
}
