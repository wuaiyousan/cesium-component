/*
 * @Author: xionghaiying
 * @Date: 2022-05-10 09:28:25
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 10:34:54
 * @Description: UseViewer
 */
import SW100 from '../assets/stations/SW100.svg'


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

  // 将相机移至提供的一个或多个实体或数据源
  function zoomToTargetbyParam(viewer, keyVal, key = 'code', opts = { duration: 1 }) {
    let tilesets = viewer.scene.primitives._primitives.filter((it)=>it[key] === keyVal)
    viewer.flyTo(tilesets[0], opts);
  }

  // 加载贴地内容项
  function unloadGroundLayer(id) {
    let toDel = findGroundLayerById(id)
    if (toDel) {
      window.earthObj._scene.groundPrimitives.remove(toDel)
    }
  }

  // 切换显示贴地图层
  function toggleGroundLayer(id, isShow) {
    let toLayer = findGroundLayerById(id)
    if (toLayer) {
      toLayer.show = isShow
    }
  }

  function findGroundLayerById(id, keyProp = 'uuid') {
    let out = null
    let groundCol = window.earthObj._scene.groundPrimitives
    for (let i = 0, len = groundCol.length, t = null; i < len; i++) {
      t = groundCol.get(i)
      if (t[keyProp] === id) {
        out = t
        break
      }
    }
    return out
  }

  // --------------------------------------- Entity图层 --------------------------------------- //
  // 查找
  function findEntityLayer(id, keyProp = 'uuid') {
    let out = null
    let dataSources = window.earthObj._viewer.dataSources
    for (let i = 0, len = dataSources.length, t = null; i < len; i++) {
      t = dataSources.get(i)
      if (t[keyProp] === id) {
        out = t
        break
      }
    }
    return out
  }

  // 卸载
  function unloadEntityLayer(id) {
    let toDel = findEntityLayer(id)
    if (toDel) {
      window.earthObj._viewer.dataSources.remove(toDel)
    }
  }

  // 切换显示Entity图层
  function toggleEntityLayer(id, isShow) {
    let toLayer = findEntityLayer(id)
    if (toLayer) {
      toLayer.show = isShow
    }
  }

  // 找到对应的测站实体并更新信息
  // let couter = 0
  async function updateStationTips(info) {
    // 降雨返回的数据结构与其他不同，是一个object
    let { ra, ri, flow, ...others } = info
    let to = ra || ri || flow || others
    if (!to) {
      return
    }
    // 1.依据不同类别区分处理
    let valObj = {}
    if (ra) {
      valObj.tenMinute = ra.value && ra.value.tenMinute
    }
    if (ri) {
      valObj.z = ri.value
    }
    if (flow) {
      valObj.mpQ = flow.value
    }
    if (others) {
      valObj = Object.assign({}, others)
    }
    // 2.label.text更新
    let { stcd, sttp, mot } = to || {}
    let layer = findEntityLayer(sttp, 'tag')
    let toEntity = layer && layer.entities.getById(stcd)
    // V1 - 通过图片的方式更新信息面板 - 性能差
    // V2 - 通过entity上label信息组合出展示内容
    if (toEntity && toEntity._label) {
      let toLabel = toEntity._label
      let oldTxt = toLabel.text._value
      let toVal = newLabelValueByParams(
        Object.assign(
          {
            sttp,
            mot,
          },
          valObj
        ),
        oldTxt
      )
      toLabel.text._value = toVal
    }
  }

  function newLabelValueByParams(
    it,
    oldTxt,
    multiSperator = ' | ',
    seperator = ':'
  ) {
    let oldArr = oldTxt.split(seperator)
    let val = ''
    let toType = String(it.sttp || it.type).toUpperCase()
    switch (toType) {
      case 'PZ':
        let toArr = String(oldArr[1]).split(multiSperator)
        if (notEmpty(it.tenMinute)) {
          toArr[0] = it.tenMinute
        }
        if (notEmpty(it.z)) {
          toArr[1] = it.z
        }
        val = `${toArr[0]}${multiSperator}${toArr[1]}`
        break
      case 'PP':
        val = showValue(it.tenMinute) || showValue(it.value)
        break
      case 'ZZ':
        val = showValue(it.z) || showValue(it.value)
        break
      case 'SG':
        val = showValue(it.mpQ) || showValue(it.value)
        break
      case 'VWM':
        val = showValue(it.cw) || showValue(it.value)
        break
      case 'WQ':
        val = showValue(it.appraise) || showValue(it.value)
        break
      default:
        break
    }
    return [oldArr[0], seperator, val].join('')
  }

  // 通过参数获取相应类型测站
  function findStationEntity(sttp, stId) {
    let layer = findEntityLayer(sttp, 'tag')
    if (layer) {
      return layer.entities.values.find(
        (it) => it && it.customInfo && JSON.parse(it.customInfo).stId === stId
      )
    }
    return null
  }

  // --------------------------------------- Entity图层 --------------------------------------- //

  // --------------------------------------- Popup & Overlay --------------------------------------- //
  // V1(通过全局uniquePopup对象更新) - 更新测站弹窗（性能问题）

  // V2(通过动态创建的方式更新组件内容) - 废除
  // --------------------------------------- Popup & Overlay --------------------------------------- //

  async function createStationByParams({
    uuid,
    tag,
    jsonList,
    icon,
    show,
  }) {
    let dataSource = new Cesium.CustomDataSource()
    let entityCol = dataSource.entities
    let fromList = [].concat(jsonList || [])
    let ids = fromList.map((it) => it.code)
    let displayCond = new Cesium.DistanceDisplayCondition(0.0, 60000.0) // float格式
    await Promise.all(
      fromList.map(async (it) => {
        if (it) {
          let { id: stId, code, name, lon, lat, sttp, playUrl } = it
          let pos = Cesium.Cartesian3.fromDegrees(lon, lat)
          // let { img, txt } = stationInfoByParams(it)
          entityCol.add({
            id: `station_${code}`,
            name,
            position: pos,
            billboard: {
              image: icon,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              // Make a billboard that is only visible when the distance to the camera is between 10 and 20 meters.
              distanceDisplayCondition: displayCond,
            },
            customInfo: JSON.stringify({
              stId,
              code,
              name,
              lon,
              lat,
              sttp,
            }),
          })
          // 测站常驻信息展板
          // entityCol.add({
          //   id: code,
          //   position: pos,
          //   billboard: {
          //     image: img,
          //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          //     horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
          //     distanceDisplayCondition: displayCond,
          //     pixelOffset: new Cesium.Cartesian2(0.0, -52.0),
          //   },
          //   label: {
          //     text: txt,
          //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          //     horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
          //     distanceDisplayCondition: displayCond,
          //     pixelOffset: new Cesium.Cartesian2(0.0, -52.0),
          //     font: 'bold 16px PingFangSC-Regular, Arial, Helvetica',
          //     // fillColor: Cesium.Color.WHITE,
          //     fillColor: Cesium.Color.fromCssColorString('#FFF777'),
          //   },
          // })
        }
      })
    )
    // 更新entity - tag | 查找图层通过配置的 uuid
    dataSource.uuid = uuid
    dataSource.tag = tag
    dataSource.show = show
    return { dataSource, ids }
  }

  // 测站展示信息背景图
  function statiomImgByText(txt) {
    return SW100
  }

  // 获取测站展示文本
  function labelValueByParams(it, multiSperator = ' | ') {
    let val = ''
    let toType = String(it.sttp || it.type).toUpperCase()
    switch (toType) {
      case 'PZ':
        val = `${showValue(it.tenMinute)}${multiSperator}${showValue(it.z)}`
        break
      case 'PP':
        val = showValue(it.tenMinute)
        break
      case 'ZZ':
        val = showValue(it.z) || showValue(it.value)
        break
      case 'SG':
        val = showValue(it.mpQ) || showValue(it.value)
        break
      case 'VWM':
        val = showValue(it.cw) || showValue(it.value)
        break
      case 'WQ':
        val = showValue(it.appraise) || showValue(it.value)
        break
      default:
        break
    }
    return val
  }

  // 展示的具体字段项内容
  function showValue(val, defVal = '') {
    return notEmpty(val) ? val : defVal
  }
  function notEmpty(val) {
    return val !== undefined && val !== null && val !== '' ? true : false
  }

  function stationInfoByParams(it, seperator = ':', multiSperator = ' | ') {
    // 信息板文字
    let name = it.name
    let val = labelValueByParams(it, multiSperator)
    // 所需背景图
    let toTxt = val === '' ? name : `${name}${seperator}${val}`
    return {
      img: statiomImgByText(toTxt),
      txt: toTxt,
    }
  }

  return {
    // view
    getView,
    flyToView,
    zoomToTargetbyParam,
    // groundPrimitives
    findGroundLayerById,
    unloadGroundLayer,
    toggleGroundLayer,
    // entity
    findEntityLayer,
    unloadEntityLayer,
    toggleEntityLayer,
    updateStationTips,
    findStationEntity,
    // 场景标记物
    createStationByParams,
    statiomImgByText,
  }
}
