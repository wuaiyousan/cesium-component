/*
 * @Author: xionghaiying
 * @Date: 2025-04-15 18:33:55
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-04-15 18:33:55
 * @Description: 基础公共方法类
 */

export default function FormatUtil() {
  // 获取点位对应的高程
  function heightByLonlat({ carto, lon, lat, dz = 5 }) {
    let toScene = window.earthObj && window.earthObj.scene
    if (toScene) {
      return toScene.globe.getHeight(carto || new Cesium.Cartographic.fromDegrees(lon, lat)) + dz
    }
    return 0
  }

  // cartesian3转球面坐标
  function cartesian3ToCarto(cartesian3, byDegrees = false) {
    let toEarth = window.earthObj
    let scene = toEarth._viewer.scene
    let cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian3)
    if (byDegrees) {
      let toD = Cesium.Math.toDegrees
      return {
        lon: toD(cartographic.longitude),
        lat: toD(cartographic.latitude),
        height: cartographic.height
      }
    }
    return {
      lon: cartographic.longitude,
      lat: cartographic.latitude,
      height: cartographic.height
    }
  }

  // 通过经纬度来获取
  function positionByLonlat({ lon, lat, byRadians = true, dz = 30 }) {
    let height = heightByLonlat({ lon, lat, dz })
    if (byRadians) {
      let toR = Cesium.Math.toRadians
      return [toR(lon), toR(lat), height]
    }
    return [lon, lat, height]
  }

  // 计算一个圆
  function computeCircle(radius, edges = 10) {
    const positions = []
    const toRadians = Cesium.Math.toRadians
    for (let i = 0, radians = 0; i < 360; i += edges) {
      radians = toRadians(i)
      positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)))
    }
    return positions
  }

  // 替代 eval
  function evalVal(str) {
    return new Function("return " + str)()
  }

  // 屏幕坐标转经纬度
  function pixel2Lonlat(pos) {
    let toEarth = window.earthObj
    let scene = toEarth.scene
    let cartographic = scene.globe.ellipsoid.cartesianToCartographic(scene.pickPosition(pos))
    let toD = Cesium.Math.toDegrees
    return {
      lon: toD(cartographic.longitude),
      lat: toD(cartographic.latitude)
    }
  }

  // 经纬度转屏幕坐标
  function lonlat2Pixel(log, lat) {
    let toEarth = window.earthObj
    let scene = toEarth.scene
    let cartesian3 = Cesium.cartesian3.fromDegrees(log, lat)
    let cartesian2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian3)
    return cartesian2
  }

  // propertyBagToObj
  function propertyBagToObj(propertyBag) {
    let obj = {}
    for (const propertyName in propertyBag) {
      if (propertyBag.isConstant) {
        obj = Object.assign({}, {}, propertyBag.getValue(propertyBag[propertyName][0]))
      }
    }
    //
    let lastEntity = {
      id: obj.id,
      code: obj.code || obj.deviceCode || obj.facilityCode,
      name: obj.name || obj.deviceName || obj.facilityName,
      type: obj.type || obj.deviceTypeName || obj.facilityTypeName,
      groupType: obj.groupType || "",
      rawData: obj,
      extData: {
        from: "SenceClick"
      }
    }

    return lastEntity
  }

  // 经纬度转度分秒
  function decimalToDms(decimal, isLatitude = true) {
    // 检查经纬度是否在有效范围内
    if (isLatitude && (decimal < -90 || decimal > 90)) {
      throw new Error("纬度必须在 [-90, 90] 范围内")
    }
    if (!isLatitude && (decimal < -180 || decimal > 180)) {
      throw new Error("经度必须在 [-180, 180] 范围内")
    }

    // 计算绝对值部分
    let absDecimal = Math.abs(decimal)
    let degrees = Math.floor(absDecimal)
    let minutesPart = (absDecimal - degrees) * 60
    let minutes = Math.floor(minutesPart)
    let seconds = Math.round((minutesPart - minutes) * 60)

    // 处理进位
    if (seconds === 60) {
      minutes += 1
      seconds -= 60
    }
    if (minutes === 60) {
      degrees += 1
      minutes -= 60
    }

    // 确定方向
    let direction = ""
    if (isLatitude) {
      direction = decimal >= 0 ? "N" : "S"
    } else {
      direction = decimal >= 0 ? "E" : "W"
    }

    return {
      degrees,
      minutes,
      seconds,
      direction
    }
  }

  // 必须是4326坐标参考，次方法才有效。批量增加geojson对象高程
  function addElevationInGeojson(geojson, Liftingheight, groupType) {
    let jsonList = geojson
    if (!jsonList.features.length) {
      return false
    }
    let features = jsonList.features
    let dataType = jsonList.features[0].geometry.type
    if (["MultiPoint", "MultiLineString"].includes(dataType)) {
      features.forEach((feat) => {
        feat.geometry.coordinates[0].forEach((cood) => {
          cood.push(Liftingheight)
        })
        //
        feat.properties.groupType = groupType
      })
    } else if (["MultiPolygon"].includes(dataType)) {
      features.forEach((feat) => {
        feat.geometry.coordinates[0][0].forEach((cood) => {
          cood.push(Liftingheight)
        })
        //
        feat.properties.groupType = groupType
      })
    } else if (["Point"].includes(dataType)) {
      features.forEach((feat) => {
        feat.geometry.coordinates.push(Liftingheight)
        //
        feat.properties.groupType = groupType
      })
    } else if (["LineString", "Polygon"].includes(dataType)) {
      features.forEach((feat) => {
        feat.geometry.coordinates[0].forEach((cood) => {
          cood.push(Liftingheight)
        })
        //
        feat.properties.groupType = groupType
      })
    }
    return jsonList
  }

  //纹理图绘制 暂时只支持5个颜色
  function getColorRamp(elevationRamp) {
    var ramp = document.createElement("canvas")
    ramp.width = 1
    ramp.height = 100
    var ctx = ramp.getContext("2d")

    var values = elevationRamp
    var grd = ctx.createLinearGradient(0, 0, 0, 100)
    grd.addColorStop(values[0], "#3273C3") //black
    grd.addColorStop(values[1], "#2657A8") //blue
    grd.addColorStop(values[2], "#224F9F") //pink
    grd.addColorStop(values[3], "#133671") //red
    grd.addColorStop(values[4], "#112F64") //orange
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 1, 100)
    return ramp
  }

  // 计算距离
  function measureDistance(points){
    const geodesic = new Cesium.EllipsoidGeodesic()
    const carto1 = Cesium.Cartographic.fromCartesian(points[0])
    const carto2 = Cesium.Cartographic.fromCartesian(points[1])
    geodesic.setEndPoints(carto1,carto2)
    return geodesic.surfaceDistance.toFixed(2);
  }

  // 面积测量
  function measureArea(positions){
    const polygon = new Cesium.PolygonGeometry({
      PolygonHierarchy: new Cesium.PolygonHierarchy(positions),
      ellipsoid: Cesium.Ellipsoid.WGS84
    });
    const  geometry = Cesium.PolygonGeometry.createGeometry(polygon)
    return geometry.area;
  }

  // 高度测量(需要地形服务)
  async function measureHeight(viewer, position){
    const terrainProvider = viewer.terrainProvider;
    const cartographic = Cesium.Cartographic.fromCartesian(position);

    // 异步获取地形高度
    const [updatedPosition] = await Cesium.sampleTerrain(
      terrainProvider,
      11, //细节层级
      [cartographic]
    )

    return updatedPosition.height
  }

  // 角度测量
  function measureAngle(pointA,pointB,pointC){
    // 想来BA 和 BC
    const vectorBA = Cesium.Cartesian3.subtract(pointA, pointB, new Cesium.Cartesian3())
    const vectorBC = Cesium.Cartesian3.subtract(pointC, pointB, new Cesium.Cartesian3())

    // 归一化向量
    Cesium.Cartesian3.normalize(vectorBA, vectorBA)
    Cesium.Cartesian3.normalize(vectorBC, vectorBC)

    // 计算点积并得到夹角(弧度)
    const dot = Cesium.Cartesian3.dot(vectorBA, vectorBC)
    const angleRad = Math.acos(dot)

    // 转为角度
    return Cesium.Math.toDegrees(dot)
  }
  return {
    // 坐标转换
    heightByLonlat,
    cartesian3ToCarto,
    positionByLonlat,
    computeCircle,
    evalVal,
    pixel2Lonlat,
    propertyBagToObj,
    addElevationInGeojson,
    getColorRamp,
    decimalToDms,
    measureDistance,
    measureArea,
    measureHeight,
    measureAngle
  }
}
