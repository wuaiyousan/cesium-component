/*
 * @Author: xionghaiying
 * @Date: 2022-06-09 16:37:54
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-04 15:43:38
 * @Description: 效果
 */
import Cesium from "../utils/exportCesium.js";
import roadsList from '../assets/json/roads.json'
import movingWater from '../assets/images/moving-water.png'
import earthspec from '../assets/images/earthspec1k.jpg'
import rivers from '../assets/json/rivers.json'

import UseGlobeMaterial from '../glsl/UseGlobeMaterial.js'
import UsePostStage from '../glsl/UsePostStage.js'
import { viewConf } from '../config/viewer.config.js'

export default function UseEffects() {
  // 记录加载的基础场景内容项
  const cacheObj = {}

  // 加载白膜
  function loadTilesShader(tileset) {
    if (!tileset) {
      return
    }
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [['true', 'rgba(0.0, 127.5, 250.0 ,1.0)']],
      },
    })
    //实现渐变效果
    tileset.tileVisible.addEventListener(function (tile) {
      let content = tile.content
      let featuresLength = content.featuresLength
      for (let i = 0; i < featuresLength; i += 2) {
        let feature = content.getFeature(i)
        let model = feature.content._model

        if (model && model._sourcePrograms && model._rendererResources) {
          Object.keys(model._sourcePrograms).forEach((key) => {
            let program = model._sourcePrograms[key]
            let fragmentShader =
              model._rendererResources.sourceShaders[program.fragmentShader]
            let v_position = ''
            if (fragmentShader.indexOf(' v_positionEC;') != -1) {
              v_position = 'v_positionEC'
            } else if (fragmentShader.indexOf(' v_pos;') != -1) {
              v_position = 'v_pos'
            }
            const color = `vec4(${feature.color.toString()})`

            model._rendererResources.sourceShaders[program.fragmentShader] = `
            varying vec3 ${v_position};
            void main(void){
              vec4 position = czm_inverseModelView * vec4(${v_position},1); // 位置
              gl_FragColor = ${color}; // 颜色
              gl_FragColor *= vec4(vec3(position.z / 50.0), 1.0); // 渐变
              // 动态光环
              float time = fract(czm_frameNumber / 180.0);
              time = abs(time - 0.5) * 2.0;
              float glowRange = 180.0; // 光环的移动范围(高度)
              float diff = step(0.005, abs( clamp(position.z / glowRange, 0.0, 1.0) - time));
              gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
            }
          `
          })
          model._shouldRegenerateShaders = true
        }
      }
    })
  }

  // =================================== 水系 =================================== //

  // 加载贴地水面
  function loadRivers(toEarth) {
    // GroundPrimitive - Primitive
    let toGrounds = toEarth._viewer.scene.groundPrimitives
    let groundCol = new Cesium.PrimitiveCollection()
    let groundPoints = undefined
    ;[].concat(rivers).forEach((it) => {
      if (it) {
        groundPoints = it.positions.flatMap((val) => [val[0], val[1]])
        groundCol.add(
          new Cesium.GroundPrimitive({
            show: true, // 默认隐藏
            allowPicking: false,
            geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(
                  new Cesium.Cartesian3.fromRadiansArray(groundPoints)
                ),
              }),
              attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                  Cesium.Color.WHITE
                ),
              },
            }),
            // 可以设置内置的水面shader
            appearance: new Cesium.EllipsoidSurfaceAppearance({
              material: new Cesium.Material({
                fabric: {
                  type: 'Water',
                  uniforms: {
                    // baseWaterColor: new Cesium.Color.fromCssColorString(
                    //   // 'rgba(23,247,253,0.6)'
                    //   'rgba(64,157,253,1)'
                    // ),
                    // blendColor: new Cesium.Color.fromCssColorString(
                    //   'rgba(5,101,221,1.0)'
                    // ),
                    specularMap: earthspec,
                    normalMap: movingWater,
                    frequency: 10000.0,
                    animationSpeed: 0.01,
                    amplitude: 1.0,
                    specularIntensity: 1,
                  },
                },
              }),
              translucent: false,
            }),
          })
        )
      }
    })
    if (groundCol.length) {
      toGrounds.add(groundCol)
      cacheObj.river = groundCol._guid
    }
  }

  // 卸载贴地水面
  function unloadRivers(toEarth) {
    let toId = cacheObj.river
    if (toId !== undefined) {
      let toGrounds = toEarth._viewer.scene.groundPrimitives
      for (let i = 0, t = null; i < toGrounds.length; i++) {
        t = toGrounds.get(i)
        if (t && t._guid === toId) {
          toGrounds.remove(t)
          cacheObj.river = undefined
          break
        }
      }
    }
  }

  // =================================== 道路 =================================== //

  // 道路网
  let roads = {
    // 存储的是GroundPrimitive对象
    basic: [],
  }

  // 路网 - 基础路线
  function addBasicRoads(toEarth, lineColor, lineWidth = 8) {
    let toList = roads.basic
    lineColor =
      lineColor ||
      Cesium.ColorGeometryInstanceAttribute.fromColor(
        // new Cesium.Color(0.0, 0.82, 0.82, 0.4)
        new Cesium.Color(0.122, 0.412, 0.475, 0.6)
      )
    let toScene = toEarth._viewer.scene
    getRoadsPath().forEach((it) => {
      if (it) {
        toList.push(
          toScene.primitives.add(
            new Cesium.GroundPrimitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.CorridorGeometry({
                  vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
                  positions: Cesium.Cartesian3.fromDegreesArray(it.data),
                  width: lineWidth,
                }),
                attributes: {
                  color: lineColor,
                },
              }),
              classificationType: Cesium.ClassificationType.TERRAIN,
            })
          )
        )
      }
    })
  }

  // 获取所有道路信息(整合的交通道路网geojson数据)
  function getRoadsPath() {
    let out = []
    ;[].concat(roadsList.features).forEach((it) => {
      if (it) {
        let { geometry: geom, properties } = it
        if (geom.type === 'MultiLineString') {
          geom.coordinates.forEach((ln) => {
            if (ln) {
              out.push({
                data: ln.flatMap((v) => v),
                ...properties,
              })
            }
          })
        } else if (geom.type === 'LineString') {
          out.push({
            data: geom.coordinates.flatMap((v) => v),
            ...properties,
          })
        }
      }
    })
    return out
  }

  // =================================== 道路 =================================== //

  // =================================== 场景中交互 =================================== //
  // 闪烁
  function flashTarget(entity, options = {}) {
    let { duration, speed } = Object.assign(
      { duration: 4000, speed: 0.05 },
      options
    )
    let flog = true
    let x = 1
    entity.billboard.show = new Cesium.CallbackProperty(() => {
      if (flog) {
        x = x - speed
        if (x <= 0) {
          flog = false
        }
      } else {
        x = x + speed
        if (x >= 1) {
          flog = true
        }
      }
      return x >= 0.5
    }, false)
    // 闪烁duration（毫秒）后取消
    window.setTimeout(() => {
      if (entity && entity.billboard) {
        entity.billboard.show = true
      }
    }, duration)
  }

  // 圆形效果
  function effectCircle(entity, addFn, removeFn, options = {}) {
    let { duration } = Object.assign({ duration: 4000 }, options)
    // 拿entity存储的信息
    if (entity.customInfo) {
      let { lon, lat } = JSON.parse(entity.customInfo)
      let one = addFn({ lon, lat })
      window.setTimeout(() => {
        removeFn(one)
      }, duration)
    }
  }

  const { strategies } = viewConf
  const {
    addCircleScan,
    removeCircleScan,
    addCircleDiffuse,
    removeCircleDiffuse,
    addCircleRipple,
    removeCircleRipple,
  } = UsePostStage()

  // 在选中物上使用动画
  function animateTarget(entity, options = {}) {
    if (!entity) {
      return
    }
    let animType = strategies.animType
    if (animType === 'FLASH') {
      flashTarget(entity, options)
    } else if (animType === 'CIRCLE_SCAN') {
      effectCircle(entity, addCircleScan, removeCircleScan)
    } else if (animType === 'CIRCLE_DIFFUSE') {
      effectCircle(entity, addCircleDiffuse, removeCircleDiffuse)
    } else if (animType === 'CIRCLE_RIPPLE') {
      effectCircle(entity, addCircleRipple, removeCircleRipple)
    }
  }

  // =================================== 场景中交互 =================================== //

  // =================================== 地形上色 =================================== //
  const { setViewer, changeElevationExtremum, removeGlobeMaterial } =
    UseGlobeMaterial()
  function loadGlobelMaterial(toEarth, { minHeight, maxHeight }) {
    setViewer(toEarth._viewer)
    if (minHeight !== undefined && maxHeight !== undefined) {
      changeElevationExtremum(minHeight, maxHeight)
    }
  }

  function unloadGlobelMaterial() {
    removeGlobeMaterial()
  }

  // =================================== 天气效果 =================================== //



  return {
    loadTilesShader,
    loadRivers,
    unloadRivers,
    // 道路
    addBasicRoads,
    // 地形上色
    loadGlobelMaterial,
    unloadGlobelMaterial,
    
    animateTarget,
  }
}
