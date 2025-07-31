/*
 * @Author: xionghaiying
 * @Date: 2022-06-10 20:37:08
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 17:29:34
 * @Description: scene.config
 */
import * as Cesium from "cesium";
// 场景视图配置
export let viewConf = {
  homeView: {
    // lon: 116.26054547821572,
    // lat: 36.000736341949516,
    // height: 40847.4183263135,
    lon: 116.2611554374565,
    lat: 35.764828205833055,
    height: 60847.4,
    heading: 0,
    pitch: -45.44,
    roll: 359.99,
  },
  globe: {
    // 修改球体默认底色
    // baseColor: Cesium.Color.fromCssColorString('#000000'),
    // 开启地形检测
    depthTestAgainstTerrain: false,
    enableLighting: true,
    showGroundAtmosphere: true,
    undergroundColor: Cesium.Color.BLACK.withAlpha(0.1),
  },
  scene: {
    backgroundColor: Cesium.Color.TRANSPARENT,
    debugShowFramesPerSecond:true,//显示帧率（FPS）信息
  },
  settings: {
    // 取消默认的双击事件
    disableLeftDbClick: false,
    // 启用场景中，左键单击
    enableLeftClick: true,
    // 启用场景中，鼠标移动
    enableMouseMove: true,
    // // 启用场景中，拾取交互 - [待完善]
    // enablePicking: true,
  },
  // 视图控件设置
  viewOptions: {
    fullscreenButton: false,
    homeButton: false,
    vrButton: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    // 指北针 & 比例尺 & 缩放控件
    showCompass: false,
    showDistanceLegend: false,
    showZoom: false,
    shouldAnimate: true,
    timeline: true,
  },
  // 地形高程 - 地形分级设色用
  elevation: {
    enable: false,
    minHeight: 900, // 850
    maxHeight: 4000, // 1380
  },
  // 场景中设置
  strategies: {
    // 可选值: ['FLASH','CIRCLE_SCAN','CIRCLE_DIFFUSE','CIRCLE_RIPPLE']
    animType: 'FLASH',
  },
}

// 天地图服务key
export const getTDTKey = function () {
  // '6451442b8eba4fe29af1b47a6d82750b'
  // return 'ee95636dcb9175098ea54d3316a220e1'
  return 'e24c815473fe46d8c8a8cbaf8fdf9b42'
}

// 建筑物面（基础高度信息待输入） - 光效
export let buildingShder = {
  fsBody: `
  // 可以修改的参数
  // 注意shader中写浮点数是，一定要带小数点，否则会报错，比如0需要写成0.0，1要写成1.0
  float _baseHeight = 824.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
  float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _heightRange) 默认是 0-60米
  float _glowRange = 10.0; // 光环的移动范围(高度)

  // 建筑基础色
  float vtxf_height = v_elevationPos.z - _baseHeight;
  float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
  float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
  gl_FragColor *= vec4(vtxf_a12, vtxf_a12, vtxf_a12, 1.0);

  // // 动态光环
  // float vtxf_a13 = fract(czm_frameNumber / 360.0);
  // float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
  // vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
  // float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
  // gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - vtxf_diff);
  `,
}
