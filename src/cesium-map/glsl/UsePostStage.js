/*
 * @Author: xionghaiying
 * @Date: 2022-09-26 15:11:51
 * @LastEditors: xionghaiying
 * @LastEditTime: 2022-09-27 15:46:30
 * @Description: 后处理
 */
import CircleScan from './classes/CircleScan'
import FormatUtil from '../utils/FormatUtil'
import './classes/CircleDiffuseMaterialProperty'
import './classes/CircleRippleMaterialProperty'

import './classes/PolylineTrailLinkMaterialProperty'
import imgflow from '../assets/images/flow.png'

export default function UsePostStage() {
  const store = {
    circleScan: null,
    // datasource
    circleDiffuse: null,
    circleRipple: null,
  }
  const { heightByLonlat } = FormatUtil()

  // test

  function addTrailLink() {
    let data = [
      [104.04790878295898, 30.665822980309592],
      [104.02791023254393, 30.641600497335878],
      [104.02336120605469, 30.683534290222845]
    ]
    let viewer = window.earthObj._viewer;
    data.forEach(item => {
      let coor = Array.prototype.concat.apply(
        [],
        [[item[0], item[1], 0], [item[0], item[1], 10000]]
      );
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(coor),
          width: 16,
          material: new Cesium.PolylineTrailLinkMaterialProperty({color: Cesium.Color.CHARTREUSE , trailImage: imgflow, duration: 3000}),
        },
      });
    })
  }



  // ---------------------------- 扫描 ---------------------------- //

  function addCircleScan({
    lon,
    lat,
    radius = 400,
    color = '#C345F5',
    duration = 3000,
  }) {
    let viewer = window.earthObj._viewer
    if (!viewer) {
      return
    }
    let circleScan = null
    if (!store.circleScan) {
      circleScan = new CircleScan(viewer)
      store.circleScan = circleScan
    } else {
      circleScan = store.circleScan
    }

    return circleScan.add(
      [lon, lat, heightByLonlat({ lon, lat })],
      color,
      radius,
      duration
    )
  }

  function removeCircleScan(stage) {
    if (stage && store.circleScan) {
      store.circleScan.remove(stage)
    }
  }

  function clearCircleScan() {
    if (store.circleScan) {
      store.circleScan.clear()
    }
  }

  // ---------------------------- 扩散 ---------------------------- //

  function addCircleDiffuse({
    lon,
    lat,
    semiMinorAxis = 400,
    semiMajorAxis = 400,
    color = '#FEDE6E',
    speed = 10.0,
  }) {
    let viewer = window.earthObj._viewer
    let ds = null
    if (!store.circleDiffuse) {
      ds = new Cesium.CustomDataSource()
      ds.tag = 'circle_diffuse'
      store.circleDiffuse = ds
      viewer.dataSources.add(ds)
    } else {
      ds = store.circleDiffuse
    }
    let entCol = ds.entities
    return entCol.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      name: 'circle_diffuse_' + entCol.values.length,
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new Cesium.CircleDiffuseMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          speed,
        }),
      },
    })
  }

  // 移除
  function removeCircleDiffuse(ent) {
    if (ent && store.circleDiffuse) {
      let entCol = store.circleDiffuse.entities
      if (entCol.contains(ent)) {
        entCol.remove(ent)
      }
    }
  }

  // 清空
  function clearCircleDiffuse() {
    let viewer = window.earthObj._viewer
    if (store.circleDiffuse) {
      viewer.dataSources.remove(store.circleDiffuse)
      store.circleDiffuse = null
    }
  }

  // ---------------------------- 波纹 ---------------------------- //
  function addCircleRipple({
    lon,
    lat,
    semiMinorAxis = 300,
    semiMajorAxis = 300,
    color = '#FEDE6E',
    speed = 10.0,
    count = 4,
    gradient = 0.2,
  }) {
    let viewer = window.earthObj._viewer
    let ds = null
    if (!store.circleRipple) {
      ds = new Cesium.CustomDataSource()
      ds.tag = 'circle_ripple'
      store.circleRipple = ds
      viewer.dataSources.add(ds)
    } else {
      ds = store.circleRipple
    }
    let entCol = ds.entities
    return entCol.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      name: 'circle_ripple_' + entCol.values.length,
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new Cesium.CircleRippleMaterialProperty({
          color: Cesium.Color.fromCssColorString(color),
          speed,
          count,
          gradient,
        }),
      },
    })
  }

  function removeCircleRipple(ent) {
    if (ent && store.circleRipple) {
      let entCol = store.circleRipple.entities
      if (entCol.contains(ent)) {
        entCol.remove(ent)
      }
    }
  }
  function clearCircleRipple() {
    let viewer = window.earthObj._viewer
    if (store.circleRipple) {
      viewer.dataSources.remove(store.circleRipple)
      store.circleRipple = null
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
  }
}
