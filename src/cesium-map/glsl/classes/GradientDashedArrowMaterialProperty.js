/*
 * @Description: 虚线+箭头材质属性（类似图片效果），增加箭头底边宽度配置
 */
import Cesium from "@/utils/cesium";

export default class DashedArrowMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._width = undefined;
    this._arrowSize = undefined;
    this._dashLength = undefined;
    this._gapLength = undefined;
    this._arrowBaseWidth = undefined; // 新增：箭头底边宽度

    this.color = options.color;
    this.width = options.width;
    this.arrowSize = options.arrowSize;
    this.dashLength = options.dashLength;
    this.gapLength = options.gapLength;
    this.arrowBaseWidth = options.arrowBaseWidth; // 新增
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType(time) {
    return Cesium.Material.DashedArrowMaterialType;
  }

  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    
    result.color = Cesium.Property.getValueOrDefault(
      this._color, 
      time, 
      Cesium.Color.RED,
      result.color
    );
    result.width = Cesium.Property.getValueOrDefault(
      this._width, 
      time, 
      2.0,
      result.width
    );
    result.arrowSize = Cesium.Property.getValueOrDefault(
      this._arrowSize, 
      time, 
      0.2,
      result.arrowSize
    );
    result.dashLength = Cesium.Property.getValueOrDefault(
      this._dashLength,
      time,
      0.05,
      result.dashLength
    );
    result.gapLength = Cesium.Property.getValueOrDefault(
      this._gapLength,
      time,
      0.05,
      result.gapLength
    );
    result.arrowBaseWidth = Cesium.Property.getValueOrDefault(
      this._arrowBaseWidth,
      time,
      0.8, // 默认箭头底边宽度为0.8（比默认线宽2.0的比例）
      result.arrowBaseWidth
    );
    
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof DashedArrowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._width, other._width) &&
        Cesium.Property.equals(this._arrowSize, other._arrowSize) &&
        Cesium.Property.equals(this._dashLength, other._dashLength) &&
        Cesium.Property.equals(this._gapLength, other._gapLength) &&
        Cesium.Property.equals(this._arrowBaseWidth, other._arrowBaseWidth))
    );
  }
}

// 定义属性描述符
Object.defineProperties(DashedArrowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor("color"),
  width: Cesium.createPropertyDescriptor("width"),
  arrowSize: Cesium.createPropertyDescriptor("arrowSize"),
  dashLength: Cesium.createPropertyDescriptor("dashLength"),
  gapLength: Cesium.createPropertyDescriptor("gapLength"),
  arrowBaseWidth: Cesium.createPropertyDescriptor("arrowBaseWidth"), // 新增
});

// 注册材质类型
Cesium.Material.DashedArrowMaterialProperty = "DashedArrowMaterialProperty";
Cesium.Material.DashedArrowMaterialType = "DashedArrowMaterialType";
Cesium.Material.DashedArrowMaterialSource = `
  czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;
    
    // 虚线部分（前 1-arrowSize 比例）
    if (st.s < 1.0 - arrowSize) {
      float patternLength = dashLength + gapLength;
      float patternPos = mod(st.s, patternLength);
      
      // 如果是间隔部分则丢弃
      if (patternPos > dashLength) {
        discard;
      }
    }
    
    // 箭头部分（最后 arrowSize 比例）
    if (st.s > 1.0 - arrowSize) {
      float arrowPos = (st.s - (1.0 - arrowSize)) / arrowSize;
      
      // 使用 arrowBaseWidth 控制箭头底边宽度
      float currentArrowWidth = mix(arrowBaseWidth, 0.0, arrowPos);
      if (st.t > 0.5 + currentArrowWidth * 0.5 || 
          st.t < 0.5 - currentArrowWidth * 0.5) {
        discard;
      }
    }
    
    material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;
  }
`;

// 注册材质
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.DashedArrowMaterialType,
  {
    fabric: {
      type: Cesium.Material.DashedArrowMaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
        width: 2.0,
        arrowSize: 0.2,
        dashLength: 0.05,
        gapLength: 0.05,
        arrowBaseWidth: 0.8 // 新增默认值
      },
      source: Cesium.Material.DashedArrowMaterialSource,
    },
    translucent: function (material) {
      return true;
    },
  }
);