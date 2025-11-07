/*
 * @Author: xionghaiying
 * @Date: 2022-09-26 15:11:51
 * @LastEditors: xionghiaying 
 * @LastEditTime: 2025-11-07 09:15:26
 * @Description: 后处理
 */
import Cesium from "../utils/exportCesium.js";
import CircleScan from "./classes/CircleScan";
import FormatUtil from "../utils/FormatUtil";
import CircleDiffuseMaterialProperty from "./classes/CircleDiffuseMaterialProperty";
import CircleRippleMaterialProperty from "./classes/CircleRippleMaterialProperty";

import PolylineTrailLinkMaterialProperty from "./classes/PolylineTrailLinkMaterialProperty";
import imgflow from "../assets/images/flow.png";

import LineFlickerMaterialProperty from "./classes/LineFlickerMaterialProperty";

export default function UsePostStage() {
  const store = {
    circleScan: null,
    // datasource
    circleDiffuse: null,
    circleRipple: null,
    flickerLine: null,
  };
  const { heightByLonlat } = FormatUtil();

  // test

  function addTrailLink() {
    let data = [
      [104.04790878295898, 30.665822980309592],
      [104.02791023254393, 30.641600497335878],
      [104.02336120605469, 30.683534290222845],
    ];
    let viewer = window.earthObj;
    data.forEach((item) => {
      let coor = Array.prototype.concat.apply(
        [],
        [
          [item[0], item[1], 0],
          [item[0], item[1], 10000],
        ]
      );
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(coor),
          width: 16,
          material: new PolylineTrailLinkMaterialProperty({ color: Cesium.Color.CHARTREUSE, trailImage: imgflow, duration: 3000 }),
        },
      });
    });
  }

  // ---------------------------- 扫描 ---------------------------- //

  /**
   * 添加圆形雷达扫描特效
   * @param {Object} options - 扫描配置参数
   * @param {number} options.lon - 经度
   * @param {number} options.lat - 纬度
   * @param {number} [options.radius=400] - 扫描半径(米)
   * @param {string} [options.color="#C345F5"] - 扫描颜色(CSS颜色字符串或rgba格式)
   * @param {number} [options.duration=3000] - 扫描周期时长(毫秒)
   * @returns {PostProcessStage} 返回创建的后处理阶段对象
   */
  function addCircleScan({ lon, lat, radius = 400, color = "#C345F5", duration = 3000 }) {
    let viewer = window.earthObj;
    if (!viewer) {
      return;
    }
    let circleScan = null;
    if (!store.circleScan) {
      circleScan = new CircleScan(viewer);
      store.circleScan = circleScan;
    } else {
      circleScan = store.circleScan;
    }

    return circleScan.add([lon, lat, heightByLonlat({ lon, lat })], color, radius, duration);
  }

  function removeCircleScan(stage) {
    if (stage && store.circleScan) {
      store.circleScan.remove(stage);
    }
  }

  function clearCircleScan() {
    if (store.circleScan) {
      store.circleScan.clear();
    }
  }

  // ---------------------------- 扩散 ---------------------------- //

  /**
   * 添加圆形扩散特效
   * @param {Object} options - 扩散配置参数
   * @param {number} options.lon - 经度
   * @param {number} options.lat - 纬度
   * @param {number} [options.semiMinorAxis=400] - 椭圆短半轴(米)
   * @param {number} [options.semiMajorAxis=400] - 椭圆长半轴(米)
   * @param {string} [options.color="#FEDE6E"] - 扩散颜色(CSS颜色字符串)
   * @param {number} [options.speed=10.0] - 扩散速度
   * @returns {Entity} 返回创建的实体对象
   */
  function addCircleDiffuse({ lon, lat, semiMinorAxis = 400, semiMajorAxis = 400, color = "#FEDE6E", speed = 10.0 }) {
    let viewer = window.earthObj;
    let ds = null;
    if (!store.circleDiffuse) {
      ds = new Cesium.CustomDataSource();
      ds.tag = "circle_diffuse";
      store.circleDiffuse = ds;
      viewer.dataSources.add(ds);
    } else {
      ds = store.circleDiffuse;
    }
    let entCol = ds.entities;
    return entCol.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      name: "circle_diffuse_" + entCol.values.length,
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new CircleDiffuseMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          speed,
        }),
      },
    });
  }

  // 移除
  function removeCircleDiffuse(ent) {
    if (ent && store.circleDiffuse) {
      let entCol = store.circleDiffuse.entities;
      if (entCol.contains(ent)) {
        entCol.remove(ent);
      }
    }
  }

  // 清空
  function clearCircleDiffuse() {
    let viewer = window.earthObj;
    if (store.circleDiffuse) {
      viewer.dataSources.remove(store.circleDiffuse);
      store.circleDiffuse = null;
    }
  }

  // ---------------------------- 波纹 ---------------------------- //

  /**
   * 添加圆形波纹特效
   * @param {Object} options - 波纹配置参数
   * @param {number} options.lon - 经度
   * @param {number} options.lat - 纬度
   * @param {number} [options.semiMinorAxis=300] - 椭圆短半轴(米)
   * @param {number} [options.semiMajorAxis=300] - 椭圆长半轴(米)
   * @param {string} [options.color="#FEDE6E"] - 波纹颜色(CSS颜色字符串)
   * @param {number} [options.speed=10.0] - 波纹速度
   * @param {number} [options.count=4] - 波纹数量
   * @param {number} [options.gradient=0.2] - 波纹渐变系数
   * @returns {Entity} 返回创建的实体对象
   */
  function addCircleRipple({ lon, lat, semiMinorAxis = 300, semiMajorAxis = 300, color = "#FEDE6E", speed = 10.0, count = 4, gradient = 0.2 }) {
    let viewer = window.earthObj;
    let ds = null;
    if (!store.circleRipple) {
      ds = new Cesium.CustomDataSource();
      ds.tag = "circle_ripple";
      store.circleRipple = ds;
      viewer.dataSources.add(ds);
    } else {
      ds = store.circleRipple;
    }
    let entCol = ds.entities;
    return entCol.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      name: "circle_ripple_" + entCol.values.length,
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new CircleRippleMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          speed,
          count,
          gradient,
        }),
      },
    });
  }

  function removeCircleRipple(ent) {
    if (ent && store.circleRipple) {
      let entCol = store.circleRipple.entities;
      if (entCol.contains(ent)) {
        entCol.remove(ent);
      }
    }
  }
  function clearCircleRipple() {
    let viewer = window.earthObj;
    if (store.circleRipple) {
      viewer.dataSources.remove(store.circleRipple);
      store.circleRipple = null;
    }
  }

  // ---------------------------- 线段闪烁 ---------------------------- //

  function addFlickerLine({ positions, color = "#5ee603ff" }) {
    let viewer = window.earthObj;
    let ds = null;
    if (!store.flickerLine) {
      ds = new Cesium.CustomDataSource();
      ds.tag = "flicker_line";
      store.flickerLine = ds;
      viewer.dataSources.add(ds);
    } else {
      ds = store.flickerLine;
    }
    
    let entCol = ds.entities;
    return entCol.add({
      name: "flicker_line_" + entCol.values.length,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(flatPositions),
        material: new LineFlickerMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          // 设置随机变化速度
          speed: 20.0, 
        }),
        width: 3.0,
      },
    });
  }

  function removeFlickerLine(ent){
    if (ent && store.flickerLine) {
      let entCol = store.flickerLine.entities;
      if (entCol.contains(ent)) {
        entCol.remove(ent);
      }
    }
  }

  function clearFlickerLine(){
    let viewer = window.earthObj;
    if (store.flickerLine) {
      viewer.dataSources.remove(store.flickerLine);
      store.flickerLine = null;
    }
  }

  return {
    //
    addTrailLink,
    // 圆扫
    addCircleScan,
    removeCircleScan,
    clearCircleScan,
    // 圆扩
    addCircleDiffuse,
    removeCircleDiffuse,
    clearCircleDiffuse,
    // 波纹
    addCircleRipple,
    removeCircleRipple,
    clearCircleRipple,
    // 线段闪烁
    addFlickerLine,
    removeFlickerLine,
    clearFlickerLine
  };
}
