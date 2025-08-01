/*
 * @Author: xionghaiying
 * @Date: 2024-06-21 15:03:31
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-01 14:53:28
 * @Description: 地图配置
 */

// 地图配置
let mapConf = {
  // 项目自部署iServer
  superMapUrl: "http://222.219.141.174:8090",
  // geoserver地址
  geoserverUrl: "http://39.91.167.36:8090/geoserver",
  // 底图方案 todo:暂时没有用，以后用于做切换底图方案
  getScenarioList: function () {
    return [
      {
        scenarioName: "矢量",
        scenarioType: "vector",
        layerList: [
          {
            id: "mapservice_vec_w",
            code: "600",
            title: "天地图-矢量",
            url: `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=fd1a28bea0a80604b9b2744ccb6e208a`,
            params: {
              layer: "tdtBasicLayer",
              style: "default",
              format: "tiles",
              tileMatrixSetID: "GoogleMapsCompatible",
              subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            },
            opacity: 1,
            zIndex: 0,
            checked: true,
            extData: {},
          },
          {
            id: "mapservice_cva_w",
            code: "600",
            title: "天地图-矢量注记",
            url: `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=fd1a28bea0a80604b9b2744ccb6e208a`,
            params: {
              layer: "tdtBasicLayer",
              style: "default",
              format: "tiles",
              tileMatrixSetID: "GoogleMapsCompatible",
              subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            },
            opacity: 1,
            zIndex: 1,
            checked: false,
            extData: {},
          },
        ],
        isDefault: false,
      },
      {
        scenarioName: "影像",
        scenarioType: "image",
        layerList: [
          {
            id: "mapservice_img_w",
            code: "600",
            title: "天地图-影像",
            url: `https://t3.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=fd1a28bea0a80604b9b2744ccb6e208a`,
            params: {
              layer: "tdtBasicLayer",
              style: "default",
              format: "tiles",
              tileMatrixSetID: "GoogleMapsCompatible",
              subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            },
            opacity: 1,
            zIndex: 0,
            checked: true,
            extData: {},
          },
          {
            id: "mapservice_cia_w",
            code: "600",
            title: "天地图-影像注记",
            url: `https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=fd1a28bea0a80604b9b2744ccb6e208a`,
            params: {
              layer: "tdtBasicLayer",
              style: "default",
              format: "tiles",
              tileMatrixSetID: "GoogleMapsCompatible",
              subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            },
            opacity: 1,
            zIndex: 1,
            checked: false,
            extData: {},
          },
        ],
        isDefault: true,
      },
      {
        scenarioName: "地形",
        scenarioType: "terrian",
        layerList: [
          {
            id: "modelservice_terrain",
            code: "500",
            type: "CesiumTerrainProvider",
            title: "地形",
            url: "/3dModel/terrians",
            params: {},
            opacity: 1,
            zIndex: 2,
            checked: true,
            extData: {},
          },
        ],
        isDefault: false,
      },
    ];
  },
  // 获取图层配置
  getLayers: function () {
    return [
      // 行政区划
      {
        groupName: "行政区划",
        groupType: "district",
        groupList: [
          // geoserver WMS服务
          {
            id: "mapservice_County",
            dataType: "mapservice",
            type: "wms",
            title: "东阿县",
            url: `${mapConf.geoserverUrl}/DongAn/wms`,
            params: {
              layers: "DongAn:County_Level",
            },
            opacity: 1,
            zIndex: 1,
            visible: true,
          },
          // geoserver 要素服务
          {
            id: "featuresmap_County",
            dataType: "featuresmap",
            type: "get",
            title: "东阿县",
            url: `${mapConf.geoserverUrl}/DongAn/ows`,
            params: {
              service: "WFS",
              version: "1.0.0",
              request: "GetFeature",
              outputFormat: "application/json",
              typeName: "DongAn:County_Level",
              maxFeatures: "1000",
            },
            opacity: 1,
            zIndex: 1,
            visible: true,
            extData: {
              classType: "County",
            },
          },
          // geoserver WMTS服务
          {
            id: "mapservice_Town",
            dataType: "mapservice",
            type: "wmts",
            title: "乡镇",
            url: `${mapConf.geoserverUrl}/gwc/service/wmts/rest/DongAn:Town_Level/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png`,
            params: {
              layer: "DongAn:Town_Level",
              tileMatrixSetID: "EPSG:4326",
              format: "image/png",
              maximumLevel: 21,
              minimumLevel: 5,
            },
            opacity: 1,
            zIndex: 7,
            visible: true,
            extData: {
              rectangles: [
                116.04431727200006, 36.126622534000035, 116.54407316300004,
                36.52445016200006,
              ],
            },
          },
          // geoserver 要素服务
          {
            id: "featuresmap_Town",
            dataType: "featuresmap",
            type: "get",
            title: "镇级",
            url: `${mapConf.geoserverUrl}/DongAn/ows`,
            params: {
              service: "WFS",
              version: "1.0.0",
              request: "GetFeature",
              outputFormat: "application/json",
              typeName: "DongAn:Town_Level",
              maxFeatures: "1000",
            },
            opacity: 1,
            zIndex: 1,
            visible: true,
            extData: {
              classType: "Town",
              liftingHeight: 2030.0,
            },
          },
        ],
        isIndeterminate: false,
        checkAll: false,
        checkList: [],
      },
      // 河流湖泊
      {
        groupName: "河流湖泊",
        groupType: "water-system",
        groupList: [],
        isIndeterminate: false,
        checkAll: false,
        checkList: [],
      },

      // 供水管网
      {
        groupName: "供水管网",
        groupType: "pipe-network",
        groupList: [
          // 接口服务
          {
            id: "mapservice_pipeline_jk",
            dataType: "dataservice",
            type: "get",
            title: "管网",
            url: `${mapConf.geoserverUrl}/iserver/services/map-gpBaseMapWS/rest/maps/gpCXGSMapDs`,
            params: {
              layersID: "[0:8,10]",
            },
            opacity: 1,
            zIndex: 12,
            visible: true,
            extData: {},
          },
        ],
        isIndeterminate: false,
        checkAll: false,
        checkList: [],
      },
    ];
  },
};

export default mapConf;
