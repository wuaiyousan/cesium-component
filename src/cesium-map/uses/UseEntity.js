/*
 * @Author: xionghaiying
 * @Date: 2024-06-26 15:31:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-22 10:58:34
 * @FilePath: \map\utils\UseEntity.js
 * @Description:  方法集合
 */
import Cesium from "@/utils/exportCesium";
import { station } from "../config/icon.config";
import FormatUtil from "../utils/FormatUtil.js";
import DashedArrowMaterialProperty from "../glsl/classes/xhytest.js";

export default function UseEntity() {
  const { getColorRamp } = FormatUtil();
  // 本地图标映射
  const storeMap = {
    imgMap: station,
  };

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
  function creatPoint({ viewer, id, position, options }) {
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
  function creatPolyline({ id, positions, options = {} }) {
    let viewer = window.earthObj;
    if (!viewer) return;
    const baseOptions = {
      clampToGround: true, //贴地
      width: 5,
      // material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
      material: new DashedArrowMaterialProperty({
        color: Cesium.Color.BLUE,
        dashLength: 0.05,
        gapLength: 0.03,
        centerLinePosition: 0.6,
      })
    };
    const polylineOps = { ...baseOptions, ...options };
    const polylineEntity = new Cesium.Entity({
      id,
      polyline: {
        positions,
        ...polylineOps,
      },
    });
    viewer.entities.add(polylineEntity);
  }
  // --------------------------------------- Polyline属性 end --------------------------------------- //

  // --------------------------------------- Polygon属性 start --------------------------------------- //
  function createPolygon(entity) {
    let theEntity = entity;
    let polygon = {
      // 需要重新赋值一次？？？？？
      hierarchy: entity.polygon.hierarchy,
      extrudedHeight: 2000,
      perPositionHeight: true,
      material: new Cesium.ImageMaterialProperty({
        image: imageImg,
      }),
      outline: true,
      outlineColor: Cesium.Color.BLACK,
    };
    theEntity.polygon = polygon;
  }
  // --------------------------------------- Polygon属性 end --------------------------------------- //

  // --------------------------------------- 删除entity start ------------------------------------- //
  function deleteEntity({ viewer, entity }) {}
  // --------------------------------------- 删除entity end --------------------------------------- //

  return {
    creatPoint,
    creatPolyline,
  };
}
