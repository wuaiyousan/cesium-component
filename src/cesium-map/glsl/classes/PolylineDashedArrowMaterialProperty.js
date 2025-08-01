/*
 * @Author: xionghaiying
 * @Description: 自定义材质：渐变虚线 + 实心箭头（基于图片描述实现）
 */
import Cesium from "@/utils/cesium";

export default class GradientDashedArrowMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._dashCount = undefined;
    this._arrowSize = undefined;
    this._gradientFactor = undefined;

    this.color = options.color;
    this.dashCount = options.dashCount;       // 虚线矩形数量
    this.arrowSize = options.arrowSize;       // 箭头占线条比例
    this.gradientFactor = options.gradientFactor; // 渐变因子
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.GradientDashedArrowMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    
    result.color = Cesium.Property.getValueOrDefault(
      this._color, 
      time, 
      Cesium.Color.BLACK,  // 默认黑色，符合图片描述
      result.color
    );
    result.dashCount = Cesium.Property.getValueOrDefault(
      this._dashCount, 
      time, 
      3,                  // 默认3个虚线矩形，如图片所示
      result.dashCount
    );
    result.arrowSize = Cesium.Property.getValueOrDefault(
      this._arrowSize, 
      time, 
      0.2,                // 箭头占20%长度
      result.arrowSize
    );
    result.gradientFactor = Cesium.Property.getValueOrDefault(
      this._gradientFactor, 
      time, 
      1.5,                // 渐变因子，控制矩形大小变化
      result.gradientFactor
    );
    
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof GradientDashedArrowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._dashCount, other._dashCount) &&
        Cesium.Property.equals(this._arrowSize, other._arrowSize) &&
        Cesium.Property.equals(this._gradientFactor, other._gradientFactor))
    );
  }
}

// 定义属性描述符
Object.defineProperties(GradientDashedArrowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor("color"),
  dashCount: Cesium.createPropertyDescriptor("dashCount"),
  arrowSize: Cesium.createPropertyDescriptor("arrowSize"),
  gradientFactor: Cesium.createPropertyDescriptor("gradientFactor"),
});

// 注册材质类型
Cesium.Material.GradientDashedArrowMaterialProperty = "GradientDashedArrowMaterialProperty";
Cesium.Material.GradientDashedArrowMaterialType = "GradientDashedArrowMaterialType";
Cesium.Material.GradientDashedArrowMaterialSource = `
  czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    
    // 计算虚线矩形部分（占1-arrowSize比例）
    float linePart = 1.0 - arrowSize;
    if (st.s < linePart) {
      // 将st.s映射到0-1范围
      float normalizedPos = st.s / linePart;
      
      // 计算当前处于哪个虚线矩形
      float segment = floor(normalizedPos * dashCount);
      float segmentPos = fract(normalizedPos * dashCount);
      
      // 渐变高度计算（矩形高度逐渐增加）
      float height = 0.5 * pow(gradientFactor, segment);
      
      // 判断是否在矩形范围内
      if (segmentPos > 0.2 && segmentPos < 0.8 && 
          st.t > 0.5 - height && st.t < 0.5 + height) {
        material.diffuse = color.rgb;
        material.alpha = color.a;
        return material;
      }
      
      discard;
    }
    // 箭头部分
    else {
      float arrowPos = (st.s - linePart) / arrowSize;
      
      // 实心箭头（三角形）
      float arrowWidth = 0.5;
      if (st.t > 0.5 + arrowWidth * (1.0 - arrowPos) || 
          st.t < 0.5 - arrowWidth * (1.0 - arrowPos)) {
        discard;
      }
      
      material.diffuse = color.rgb;
      material.alpha = color.a;
      return material;
    }
  }
`;

// 注册材质
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.GradientDashedArrowMaterialType,
  {
    fabric: {
      type: Cesium.Material.GradientDashedArrowMaterialType,
      uniforms: {
        color: new Cesium.Color(0.0, 0.0, 0.0, 1.0), // 纯黑
        dashCount: 3,
        arrowSize: 0.2,
        gradientFactor: 1.5
      },
      source: Cesium.Material.GradientDashedArrowMaterialSource,
    },
    translucent: function (material) {
      return true;
    },
  }
);