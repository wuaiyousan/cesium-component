/*
 * @Author: xionghaiying
 * @Date: 2022-06-10 20:34:30
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-01 10:10:35
 * @Description: UseScene
 */
import Cesium from "@/utils/exportCesium";
import eventMapBus from "@/utils/eventMapBus.js";
import { viewConf } from "../config/scene.config.js";
import UseLayer from "./UseLayer.js";

const { doEventSubscribe, doEventSend } = eventMapBus();

export default function UseScene() {
  // navigationHelpButton
  function localizeNavigationHelpButton(earth) {
    let toViewer = earth._viewer;
    if (toViewer.navigationHelpButton) {
      toViewer.navigationHelpButton.viewModel.tooltip = "操作指南";
      let clickHelper =
        toViewer.navigationHelpButton.container.getElementsByClassName(
          "cesium-click-navigation-help"
        )[0];
      let touchHelper =
        toViewer.navigationHelpButton.container.getElementsByClassName(
          "cesium-touch-navigation-help"
        )[0];

      let button =
        toViewer.navigationHelpButton.container.getElementsByClassName(
          "cesium-navigation-button-right"
        )[0];
      button.innerHTML = button.innerHTML.replace(">Touch", ">触摸操作");
      button = toViewer.navigationHelpButton.container.getElementsByClassName(
        "cesium-navigation-button-left"
      )[0];
      button.innerHTML = button.innerHTML.replace(">Mouse", ">鼠标操作");

      let click_help_pan = clickHelper.getElementsByClassName(
        "cesium-navigation-help-pan"
      )[0];
      click_help_pan.innerHTML = "平移视图";
      let click_help_pan_details =
        click_help_pan.parentNode.getElementsByClassName(
          "cesium-navigation-help-details"
        )[0];
      click_help_pan_details.innerHTML = "按下左键 + 拖动";

      let click_help_zoom = clickHelper.getElementsByClassName(
        "cesium-navigation-help-zoom"
      )[0];
      click_help_zoom.innerHTML = "缩放视图";
      click_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "按下右键 + 拖动";
      click_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[1].innerHTML = "或滚轮滑动";

      let click_help_rotate = clickHelper.getElementsByClassName(
        "cesium-navigation-help-rotate"
      )[0];
      click_help_rotate.innerHTML = "旋转视图";
      click_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "按下滚轮 + 拖动";
      click_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[1].innerHTML = "或Ctrl + 按下左键/右键 + 拖动";

      //触屏操作
      let touch_help_pan = touchHelper.getElementsByClassName(
        "cesium-navigation-help-pan"
      )[0];
      touch_help_pan.innerHTML = "平移视图";
      touch_help_pan.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "单指拖动";

      let touch_help_zoom = touchHelper.getElementsByClassName(
        "cesium-navigation-help-zoom"
      )[0];
      touch_help_zoom.innerHTML = "缩放视图";
      touch_help_zoom.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指向内或向外滑动";

      let touch_help_tilt = touchHelper.getElementsByClassName(
        "cesium-navigation-help-rotate"
      )[0];
      touch_help_tilt.innerHTML = "倾斜视图";
      touch_help_tilt.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指拖拽，相同方向";

      let touch_help_rotate = touchHelper.getElementsByClassName(
        "cesium-navigation-help-tilt"
      )[0];
      touch_help_rotate.innerHTML = "旋转视图";
      touch_help_rotate.parentNode.getElementsByClassName(
        "cesium-navigation-help-details"
      )[0].innerHTML = "双指拖拽，相反方向";
    }
  }

  // homeButton
  function localizeHomeButton(earth) {
    let toViewer = earth._viewer;
    if (toViewer.homeButton) {
      toViewer.homeButton.viewModel.tooltip = "复位视角";
      toViewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        (evt) => {
          evt.cancel = true;
          // 复位的位置
          flyToByParams(earth);
        }
      );
    }
  }

  // sceneModePicker
  function localizeSceneModePicker(earth) {
    let toViewer = earth._viewer;
    if (toViewer.sceneModePicker) {
      toViewer.sceneModePicker.viewModel.tooltip3D = "三维视图";
      toViewer.sceneModePicker.viewModel.tooltip2D = "二维视图";
      toViewer.sceneModePicker.viewModel.tooltipColumbusView = "哥伦布视图";
      // 去掉二三维切换动画效果
      toViewer.sceneModePicker.viewModel.duration = 0;
    }
  }

  // fullscreenButton
  function localizeFullscreenButton(earth) {
    let toViewer = earth._viewer;
    if (toViewer.fullscreenButton) {
      let toModel = toViewer.fullscreenButton.viewModel;
      let toTitle = toViewer.fullscreenButton.container.getElementsByClassName(
        "cesium-fullscreenButton"
      )[0];
      if (toModel.isFullscreen) {
        toTitle.title = "退出全屏";
      } else {
        toTitle.title = "全屏";
      }
      // 添加事件后置处理
      toModel.command.afterExecute.addEventListener((evt) => {
        window.setTimeout(() => {
          if (toModel.isFullscreen) {
            toTitle.title = "退出全屏";
          } else {
            toTitle.title = "全屏";
          }
        }, 800);
      });
    }
  }

  function localizeControls(earth) {
    let { showCompass, showDistanceLegend, showZoom } = viewOptions;
    // 显示指北针 - 比例尺
    earth.camera.navigator.showCompass = showCompass;
    earth.camera.navigator.showDistanceLegend = showDistanceLegend;

    // navigationDiv - id for compass div HTMLElement
    let toNavi = document.getElementById("navigationDiv");
    if (toNavi) {
      let toCompass = showCompass && toNavi.children[0];
      if (toCompass) {
        toCompass.title =
          "拖动外圈：旋转视图。 拖动内部陀螺仪：自由轨道。双击：重置视图。提示：也可以通过按住Ctrl键并拖动地图来释放轨道。";
        toCompass.getElementsByClassName("compass-outer-ring")[0].title =
          "单击并拖动以旋转相机";
      }
      let toControl = showZoom && toNavi.children[1];
      if (toControl) {
        // zoomIn
        toControl.children[0].title = "放大";
        // zoomOut
        toControl.children[2].title = "缩小";
      }
    }
    // homeButton
    localizeHomeButton(earth);
    // sceneModePicker
    localizeSceneModePicker(earth);
    // navigationHelpButton
    localizeNavigationHelpButton(earth);
    // fullscreenButton
    localizeFullscreenButton(earth);
  }

  // 依据参数飞入到目标位置
  function flyToByParams(Viewer, toDuration = 0.5, toView = {}) {
    let theViewer = Viewer;
    let to = Object.assign({}, location, toView);
    if (theViewer && theViewer.camera) {
      theViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(to.lon, to.lat, to.height),
        orientation: {
          heading: Cesium.Math.toRadians(to.heading),
          pitch: Cesium.Math.toRadians(to.pitch),
          roll: Cesium.Math.toRadians(to.roll),
        },
        // 1.2s动画过去
        duration: toDuration,
      });
    }
  }

  // ========================================================= //

  const { location, globe, scene, settings, viewOptions } = viewConf;

  // 场景基础设置
  function basicSetting(earth) {
    let toViewer = earth;

    // 初始化控件并作本地化等
    // todo: useTool来统一处理
    // localizeControls(earth)

    // 设置globe属性
    for (const key in globe) {
      if (Object.hasOwnProperty.call(globe, key)) {
        toViewer.scene.globe[key] = globe[key];
      }
    }

    // 设置scene属性
    for (const key in scene) {
      if (Object.hasOwnProperty.call(scene, key)) {
        toViewer.scene[key] = scene[key];
      }
    }

    // 其他设置
    if (settings.disableLeftDbClick === false) {
      toViewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
    }
  }
  const { loadWmsLayer, loadTerrainProvider, loadWmtsLayer } = UseLayer();
  // 初始化一些需要特别处理的场景类型数据
  function initOthers(toEarth, otherScenes, toKey = "code") {
    let toViewer = toEarth;
    let aliveCodes = ["600", "500", "300", "200"];
    if (toViewer) {
      let fromSceneList = []
        .concat(otherScenes)
        .filter((val) => val && val.checked && aliveCodes.includes(val[toKey]));
      fromSceneList.forEach((val) => {
        // MapServiceLayer
        if (val[toKey] === "600") {
          loadWmtsLayer(val, toEarth);
        }
        // 地形
        if (val[toKey] === "500") {
          loadTerrainProvider(val, toEarth);
        }
        // 矢量地图数据
        if (val[toKey] === "200") {
          initVectorInfo(val, toEarth);
        }
      });
    }
  }

  // 事件
  function initEvents(toEarth) {
    let viewer = toEarth;

    // 左键点击
    if (settings.enableLeftClick) {
      viewer.screenSpaceEventHandler.setInputAction(
        leftClickHandler,
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    }

    // 光标移动
    if (settings.enableMouseMove) {
      viewer.screenSpaceEventHandler.setInputAction(
        mousemoveHandler,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }

    // 场景拾取
    if (settings.enablePicking !== undefined) {
      if (settings.enablePicking === true) {
        // 开启拾取操作
        toEarth.interaction.picking.enabled = true;
        // TODO:something
      } else {
        toEarth.interaction.picking.enabled = false;
      }
    }

    // 默认鼠标事件修改
    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
      Cesium.CameraEventType.PINCH,
      Cesium.CameraEventType.RIGHT_DRAG,
    ];
  }

  function leftClickHandler(movement) {
    doEventSend("scene-left-click", movement);
  }
  function mousemoveHandler(movement) {
    doEventSend("scene-mouse-move", movement);
  }

  // 通过 uuids 查找到场景对象列表
  function findItemListByIds(toEarth, ids, toKey = "uuid") {
    let idList = []
      .concat(ids)
      .filter((val) => val !== undefined && val !== null);
    return []
      .concat(toEarth.sceneTree.root.children)
      .filter((val) => val && idList.includes(val[toKey]));
  }

  // 通过坐标获取高程
  function heightByLocation(toEarth, lon, lat, dh = 0.2) {
    let height = toEarth._viewer.scene.globe.getHeight(
      new Cesium.Cartographic.fromDegrees(lon, lat)
    );
    return height + dh;
  }

  // 初始化矢量地图数据加载
  function initVectorInfo(obj, toEarth) {
    // wms
    loadWmsLayer(obj, toEarth);
  }

  return {
    flyToByParams,
    basicSetting,
    initOthers,
    initEvents,
    findItemListByIds,
    heightByLocation,
  };
}
