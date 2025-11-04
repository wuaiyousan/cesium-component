/*
 * @Author: xionghaiying
 * @Date: 2024-06-26 15:31:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-06 14:56:50
 * @FilePath: \map\utils\UseEntity.js
 * @Description:  方法集合
 */
import Cesium from "../utils/exportCesium.js";
import { station } from "../config/default.config";
import FormatUtil from "../utils/FormatUtil.js";
import DashedArrowMaterialProperty from "../glsl/classes/DashedArrowMaterialProperty.js";
import UseEntityEvent from "./UseEntityEvent.js";
import UseDataSource from "./UseDataSource.js";

export default function UseEntity() {
  const { getColorRamp } = FormatUtil();
  const { addListenerToProperties } = UseEntityEvent();
  const { findDataSourceByParam, findDataSourceByName } = UseDataSource();
  // 本地图标映射
  const storeMap = {
    imgMap: station,
  };

  // --------------------------------------- Label start ------------------------------------- //
  /**
   * @description: 增加Entity上的文字
   * @param {*} type: 0: point/billboard, 1: polyline, 2: polygon
   * @param {*} id: 当前对象的ID
   * @param {*} labeltype: 当前label的类型
   * @param {*} ForceID: 当前对象的parentID
   * @param {*} positions: 坐标点集
   * @param {*} dataSoure: 数据源
   * @param {*} labelText: 文字信息
   * @return {*}
   */
  function addLabelToEntity({ type = 0, id, subEntityType, ForceID, position, dataSoure, labelText, isShow = false }) {
    let theDS = dataSoure;
    let labelEntity = new Cesium.Entity({
      id,
      position,
      label: {
        text: labelText,
        font: "14px sans-serif",
        fillColor: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        // pixelOffset: new Cesium.Cartesian3(30, 10),
      },
    });
    // 补充属性
    labelEntity.properties = {
      ForceID,
      subEntityType,
    };
    labelEntity.show = isShow;
    theDS.entities.add(labelEntity);
  }
  // --------------------------------------- Label end ------------------------------------- //

  // --------------------------------------- Billboard属性 start ------------------------------------- //
  function createBillboard(entity, icon) {
    let displayCond = new Cesium.DistanceDisplayCondition(0.0, 100000.0); // float格式
    let theEntity = entity;
    let billboard = {
      image: icon,
      scale: 1.5,
      // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 根据具体方案设置是否贴地
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      // Make a billboard that is only visible when the distance to the camera is between 10 and 20 meters.
      distanceDisplayCondition: displayCond,
    };
    theEntity.billboard = billboard;
  }
  // --------------------------------------- Billboard属性 end --------------------------------------- //

  // --------------------------------------- Wall属性 start ------------------------------------- //
  function createWall(entity) {
    let theEntity = entity;
    let wall = {
      positions: entity.polygon.hierarchy._value.positions,
      material: getColorRamp([0.0, 0.19, 0.46, 0.69, 1.0], true),
    };
    theEntity.wall = wall;
  }
  // --------------------------------------- Wall属性 end --------------------------------------- //

  // --------------------------------------- Point属性 start ------------------------------------- //
  function createPoint({ viewer, id, position, options }) {
    const basePoint = {
      color: Cesium.Color.RED,
      pixelSize: 10,
    };
    const pointEntity = new Cesium.Entity({
      id,
      position,
      point: { ...basePoint, ...options },
    });
    viewer.entities.add(pointEntity);
    return pointEntity;
  }
  // --------------------------------------- Point属性 end --------------------------------------- //

  // --------------------------------------- Polyline属性 start ------------------------------------- //
  function createPolyline({ layerName = "basic_drawing", dataList }) {
    // 查找dataSource
    let theDS = findDataSourceByName(layerName);
    if (!theDS) return;

    dataList.forEach((item) => {
      let { id, positions, options } = item;
      // todo: 统一处理样式问题
      const baseOptions = {
        width: 5,
        material: Cesium.Color.fromCssColorString("#a5f1a5"),
      };

      let styleOps = getPolylineStyleByParam(options);

      const polylineOps = { ...baseOptions, ...styleOps };
      const polylineEntity = new Cesium.Entity({
        id,
        polyline: {
          positions,
          ...polylineOps,
        },
      });
      polylineEntity.properties = {
        type: 3,
        state: "xhy",
      };
      addListenerToProperties({ entity: polylineEntity });
      theDS.entities.add(polylineEntity);
    });
  }

  /**
   * @description: 单个更新entity的属性
   * @param {*} layerName：数据源名称
   * @param {*} data: 需要修改的属性集合
   * @return {*}
   */
  function updatePolyline({ layerName = "xhytest", data }) {
    if (!data) return;
    // 查找dataSoure
    let theDS = findDataSourceByName(layerName);
    if (!theDS) return;
    // todo: 格式化数据
    // 查找当前实体 TODO:逻辑上参数可以修改，因为findDataSourceByName 已经获得了dataSource
    let entity = findEntityByParam({ key: data.ID, sourceKey: layerName });
    if (!entity) return;

    // 修改positions 属性
    if (data.hasOwnProperty("Points")) {
      let newPosition = [];
      data.Points.forEach((point) => {
        let { longitude, latitude, altitude } = point;
        newPosition.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude));
      });
      entity.polyline.positions = newPosition;
    }
  }

  /**
   * @description: 根据参数设置不同的线样式
   * @param {*} width : 宽度
   * @param {*} lineType： 线型。0：普通实线， 1：带箭头实线， 2：虚线， 3：带箭头虚线， 4：实线+虚线+箭头
   * @param {*} lineColor：线的颜色
   * @return {*}
   */
  function getPolylineStyleByParam({ width = 6, lineType = 0, lineColor = "#25aff3" }) {
    let material = null;
    let clampToGround = false;
    let materialColor = Cesium.Color.fromCssColorString(lineColor);

    switch (lineType) {
      case 0:
        material = materialColor;
        break;
      case 1:
        material = new Cesium.PolylineArrowMaterialProperty(materialColor);
        break;
      case 2:
        material = new Cesium.PolylineDashMaterialProperty({
          color: materialColor,
        });
        break;
      case 3:
        clampToGround = true;
        material = new DashedArrowMaterialProperty({
          color: materialColor,
          dashLength: 0.3,
          gapLength: 0.3,
          centerLinePosition: 0.0,
        });
        break;
      case 4:
        clampToGround = true;
        material = new DashedArrowMaterialProperty({
          color: materialColor,
          dashLength: 0.3,
          gapLength: 0.3,
          centerLinePosition: 0.5,
        });
        break;
      default:
        break;
    }

    return {
      width,
      clampToGround,
      material,
    };
  }

  // --------------------------------------- Polyline属性 end --------------------------------------- //

  // --------------------------------------- Polygon属性 start --------------------------------------- //
  function createPolygon({ layerName = "basic_drawing", dataList }) {
    // 查找dataSource
    let theDS = findDataSourceByName(layerName);
    if (!theDS) return;

    dataList.forEach((item) => {
      let { id, info, xh_extData } = formatSensorPolygon(item);
      // 判断是否有坐标点集合
      if (info.positions.length > 2) {
        let isShow = true;

        const polygonEntity = new Cesium.Entity({
          id,
          polygon: {
            hierarchy: {
              positions: Cesium.Cartesian3.fromDegreesArray(info.positions),
              holes: getHoles({ holes: info.holes }),
            },
            material: Cesium.Color.BLUE.withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.BLUE,
            height: info.height,
            show: isShow,
          },
        });
        // 统一补充属性的对象名为：properties
        polygonEntity.properties = {
          ...xh_extData,
        };
        // 添加监听
        // addListenerToProperties({ entity: polygonEntity });
        // 加载polyline实体
        theDS.entities.add(polygonEntity);
      }
    });
    // viewer.zoomTo(viewer.entities);
  }

  function getHoles({ holes }) {
    if (!holes) return [];
    let holesArr = [];
    holes.forEach((hole) => {
      let holeObj = {
        positions: Cesium.Cartesian3.fromDegreesArray(hole),
      };
      holesArr.push(holeObj);
    });

    return holesArr;
  }

  /**
   * @description: 更新polygon坐标
   * @param {*} layerName
   * @param {*} data
   * @return {*}
   */
  function updatePolygonPositions({ layerName = "xhytest", data }) {
    if (!data) return;
    // 查找dataSoure
    let theDS = findDataSourceByName(layerName);
    if (!theDS) return;
    // todo: 格式化数据
    // 查找当前实体 TODO:逻辑上参数可以修改，因为findDataSourceByName 已经获得了dataSource
    let entity = findEntityByParam({ key: data.ID, sourceKey: layerName });
    if (!entity) return;

    // 修改positions 属性
    let { info } = formatSensorPolygon(data);
    entity.polygon.hierarchy = Cesium.Cartesian3.fromDegreesArray(info.positions);
    entity.polygon.height = info.height;
  }
  // --------------------------------------- Polygon属性 end --------------------------------------- //

  // --------------------------------------- 公共方法 start ------------------------------------- //

  // 效果entity对象的自定义属性
  function updateEntityProperties({ id, sourceName, changeObj }) {
    let theEntity = findEntityByParam({ key: id, sourceKey: sourceName });
    if (theEntity) {
      // 此方法为替换整个properties，不能触发绑定的监听事件
      // theEntity.properties = changeObj;
      for(const [key, value] of Object.entries(changeObj)){
        theEntity.properties[key] = value
      }
    }
  }

  /**
   * @description: 根据ID隐藏entity对象以及与它关联的其他entity对象
   * @param {*} layerName: 图层名称
   * @param {*} id：实体ID
   * @param {*} visiable: 显影
   * @return {*}
   */
  function setEntityVisiableByID({ layerName, id, visiable = true }) {
    // 查找主体entity对象
    let entity = findEntityByParam({ key: id, sourceKey: layerName });
    entity.show = visiable;
    // 查找附属entity
    let subEntity = findEntityByParam({ key: id, keyVal: "ForceID", sourceKey: layerName });
    subEntity.forEach((item) => {
      item.show = visiable;
    });
  }

  /**
   * @description: 根据类型隐藏entity对象
   * @param {*} layerName: 图层名称
   * @param {*} labelType： 注记类型
   * @param {*} visiable: 显影
   * @param {*} isMutex: 是否互斥，true时当前dataSouce下只显示此类数据
   * @return {*}
   */
  function setEntityVisiableByType({ layerName, subEntityType, visiable = true, isMutex = false }) {
    let theDS = findDataSourceByName(layerName);
    if (isMutex) {
      let allEntitys = theDS.entities.values;
      allEntitys.forEach((entity) => (entity.show = !visiable));
    }

    let subEntitys = findEntityByParam({ key: subEntityType, keyVal: "subEntityType", sourceKey: layerName });
    subEntitys.forEach((item) => {
      item.show = visiable;
    });
  }

  /**
   * @description: 根据ID删除entity对象以及与它关联的其他entity对象
   * @param {*} layerName: 图层名称
   * @param {*} id: 实体ID
   * @return {*}
   */
  function deleteEntityByID({ layerName, id }) {
    // 查找dataSource
    let theDs = findDataSourceByName(layerName);
    if (!theDs) return;
    // 查找主体entity对象
    let entity = findEntityByParam({ key: id, sourceKey: layerName });
    if (entity) theDs._entityCollection.removeById(id);
  }

  /**
   * @description: 通过参数获取Entity
   * @param {*} key 关键属性
   * @param {*} keyVal 查找关键字
   * @param {*} findType 查找类型 0：equal，1：startWith，2：includes
   * @param {*} sourceKey dataSource的name属性
   * @return {*}
   */
  function findEntityByParam({ key, keyVal = "id", findType = 0, sourceKey }) {
    let ToViewer = window.earthObj || null;
    if (!ToViewer) {
      return false;
    }
    let theDs = findDataSourceByName(sourceKey);
    if (theDs) {
      let theEntity = null;
      if (keyVal === "id") {
        theEntity = theDs.entities.getById(key);
      } else {
        switch (findType) {
          case 0:
            theEntity = theDs.entities.values.find((entity) => entity.properties.getValue()[keyVal] === key);
            break;
          case 1:
            theEntity = theDs.entities.values.filter((entity) => key.startWith(entity.properties?.[keyVal].getValue()));
            break;
          case 2:
            theEntity = theDs.entities.values.filter((entity) => key.includes(entity.properties?.[keyVal].getValue()));
            break;
          default:
            break;
        }
      }
      return theEntity;
    }
    return false;
  }
  // --------------------------------------- 公共方法 end ------------------------------------- //

  return {
    createPoint,
    createPolyline,
    createPolygon,
    updateEntityProperties,
  };
}
