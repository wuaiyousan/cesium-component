/*
 * @Author: xionghiaying
 * @Date: 2025-11-06 15:03:53
 * @LastEditors: xionghiaying 
 * @LastEditTime: 2025-11-06 15:09:01
 * @Description: 穿梭线材质属性
 */
import * as Cesium from "cesium"

export default class PolylineTrailLinkMaterialProperty {
  constructor(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this._time = (new Date()).getTime();
    this.color = options.color;
    this.duration = options.duration;
    this.trailImage  = options.trailImage ;
  }

  get isConstant() {
    return false
  }

  get definitionChanged() {
    return this._definitionChanged
  }

  getType(time) {
    return Cesium.Material.PolylineTrailLinkMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = this.trailImage;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
  }

  equals(other) {
    return this === other ||
    (other instanceof PolylineTrailLinkMaterialProperty &&
      Cesium.Property.equals(this._color, other._color) &&
      Cesium.Property.equals(this._image, other._image))
  }
}

  
  Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color')
  });
  
  // 只在 Material 上定义材质类型相关属性
  Cesium.Material.PolylineTrailLinkMaterialProperty = 'PolylineTrailLinkMaterialProperty'
  Cesium.Material.PolylineTrailLinkMaterialType = 'PolylineTrailLinkMaterialType'
  Cesium.Material.PolylineTrailLinkMaterialSource = `
                                                    czm_material czm_getMaterial(czm_materialInput materialInput)
                                                      {
                                                            czm_material material = czm_getDefaultMaterial(materialInput);
                                                            vec2 st = materialInput.st;
                                                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));
                                                            material.alpha = colorImage.a * color.a;
                                                            material.diffuse = (colorImage.rgb+color.rgb)/2.0;
                                                            return material;
                                                      }
                                                    `
  
  Cesium.Material._materialCache.addMaterial(
    Cesium.Material.PolylineTrailLinkMaterialType,
    {
    fabric: {
      type: Cesium.Material.PolylineTrailLinkMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.1),
        image: Cesium.Material.DefaultImageId,
        time: -20
      },
      source: Cesium.Material.PolylineTrailLinkMaterialSource,
    },
    translucent: function (material) {
      return true;
    }
  });


