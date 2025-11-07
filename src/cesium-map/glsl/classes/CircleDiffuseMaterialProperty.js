/*
 * @Author: xionghaiying
 * @Date: 2022-09-26 15:11:51
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-01 15:46:17
 * @Description: 扩散圆
 */
import Cesium from "../../utils/exportCesium.js";

export default class CircleDiffuseMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._speed = undefined
    this.color = options.color
    this.speed = options.speed
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType(time) {
    return Cesium.Material.CircleDiffuseMaterialType
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.color = Cesium.Property.getValueOrDefault(
      this._color,
      time,
      Cesium.Color.RED,
      result.color
    )
    result.speed = Cesium.Property.getValueOrDefault(
      this._speed,
      time,
      10,
      result.speed
    )
    return result
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof CircleDiffuseMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._speed, other._speed))
    )
  }
}

Object.defineProperties(CircleDiffuseMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
  speed: Cesium.createPropertyDescriptor('speed'),
})

// 只在 Material 上定义材质类型相关属性
Cesium.Material.CircleDiffuseMaterialProperty = 'CircleDiffuseMaterialProperty'
Cesium.Material.CircleDiffuseMaterialType = 'CircleDiffuseMaterialType'
Cesium.Material.CircleDiffuseMaterialSource = `
uniform vec4 color;
uniform float speed;

czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st * 2.0 - 1.0;
  float r = length(st);
  
  float t = fract(czm_frameNumber * speed / 1000.0);
  float time = mod(t, 4.0) * 0.3;
  
  // 创建扩散波形
  float wave = smoothstep(time - 0.25, time, r) * smoothstep(time + 0.025, time, r);
  
  // 边缘柔和淡出，避免硬边黑圈
  float edgeFade = 1.0 - smoothstep(0.35, 0.5, r);
  
  // 组合波形和边缘淡出
  float alpha = wave * edgeFade * color.a;
  
  material.diffuse = color.rgb;
  material.alpha = alpha;
  
  return material;
}
`

Cesium.Material._materialCache.addMaterial(
  Cesium.Material.CircleDiffuseMaterialType,
  {
    fabric: {
      type: Cesium.Material.CircleDiffuseMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        speed: 10.0,
      },
      source: Cesium.Material.CircleDiffuseMaterialSource,
    },
    translucent: function (material) {
      return true
    },
  }
)
