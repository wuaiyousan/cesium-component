/*
 * @Description: test
 */
import Cesium from "@/utils/exportCesium";

export default class DashedArrowMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._dashLength = undefined;
    this._gapLength = undefined;

    this.color = options.color;
    this.dashLength = Cesium.defaultValue(options.dashLength, 0.05);
    this.gapLength = Cesium.defaultValue(options.gapLength, 0.03);
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

    result.dashLength = Cesium.Property.getValueOrDefault(
      this._dashLength,
      time,
      0.05,
      result.dashLength
    );

    result.gapLength = Cesium.Property.getValueOrDefault(
      this._gapLength,
      time,
      0.03,
      result.gapLength
    );

    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof DashedArrowMaterialProperty &&
        Cesium.Property.equals(this._color, other._color) &&
        Cesium.Property.equals(this._dashLength, other._dashLength) &&
        Cesium.Property.equals(this._gapLength, other._gapLength))
    );
  }
}

// 定义属性描述符
Object.defineProperties(DashedArrowMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor("color"),
  dashLength: Cesium.createPropertyDescriptor("dashLength"),
  gapLength: Cesium.createPropertyDescriptor("gapLength"),
});

// 注册材质类型
Cesium.Material.DashedArrowMaterialProperty = "DashedArrowMaterialProperty";
Cesium.Material.DashedArrowMaterialType = "DashedArrowMaterialType";
Cesium.Material.DashedArrowMaterialSource = `
uniform vec4 color;
uniform float dashLength;  // 虚线段的长度
uniform float gapLength;   // 间隔的长度

float getPointOnLine(vec2 p0, vec2 p1, float x)
{
    float slope = (p0.y - p1.y) / (p0.x - p1.x);
    return slope * (x - p0.x) + p0.y;
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 st = materialInput.st;

#if (__VERSION__ == 300 || defined(GL_OES_standard_derivatives))
    float base = 1.0 - abs(fwidth(st.s)) * 10.0 * czm_pixelRatio;
#else
    float base = 0.975;
#endif

    vec2 center = vec2(1.0, 0.5);
    float ptOnUpperLine = getPointOnLine(vec2(base, 1.0), center, st.s);
    float ptOnLowerLine = getPointOnLine(vec2(base, 0.0), center, st.s);

    float halfWidth = 0.15;
    
    // 虚线模式计算
    float dashAndGap = dashLength + gapLength;
    float dashPosition = mod(st.s * 10.0, dashAndGap); // 调整10.0可以控制虚线密度
    float isDash = step(dashPosition, dashLength);
    
    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    float t = step(base, materialInput.st.s);
    t *= 1.0 - step(ptOnUpperLine, st.t);
    t *= step(ptOnLowerLine, st.t);

    // 抗锯齿距离计算
    float dist;
    if (st.s < base)
    {
        float d1 = abs(st.t - (0.5 - halfWidth));
        float d2 = abs(st.t - (0.5 + halfWidth));
        dist = min(d1, d2);
         // 只在虚线部分显示
      if (isDash < 0.5) {
        discard;  // 完全丢弃间隔部分的像素
      }
    }
    else
    {
        float d1 = czm_infinity;
        if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
        {
            d1 = abs(st.s - base);
        }
        float d2 = abs(st.t - ptOnUpperLine);
        float d3 = abs(st.t - ptOnLowerLine);
        dist = min(min(d1, d2), d3);
    }

    vec4 outsideColor = vec4(0.0);
    vec4 currentColor = mix(outsideColor, color, clamp(s + t, 0.0, 1.0));
    vec4 outColor = czm_antialias(outsideColor, color, currentColor, dist);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
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
        dashLength: 0.05,
        gapLength: 0.03,
      },
      source: Cesium.Material.DashedArrowMaterialSource,
    },
    translucent: function (material) {
      return true;
    },
  }
);
