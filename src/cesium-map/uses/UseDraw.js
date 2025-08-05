/*
 * @Author: xionghaiying
 * @Date: 2025-06-20 15:31:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-05 09:21:19
 * @Description:  绘制
 */
import Cesium from "@/utils/exportCesium";
const { Cartesian2 } = Cesium;
import DashedArrowMaterialProperty from "../glsl/classes/DashedArrowMaterialProperty.js";
import UseDataSource from "./UseDataSource.js";
import FormatUtil from "@/utils/FormatUtil.js";

const { loadDataSourceByParams } = UseDataSource();
const { cartesian3ToCarto, measureDistance, measureArea } = FormatUtil();

export default function UseDraw() {
  let dataSources = null; // 绘制实体的DS
  let handler = null;
  let activeShape = null; // 动态图形
  let activePoints = []; // 已确定的顶点坐标
  let floatingPoint = null; // 鼠标移动时的浮动点
  let drawingMode = null; //当前绘制模式
  let label = []; // 标签集合
  let certainEntity = null; // 绘制完成的实体集合
  let posistions = []; // 绘制结果的坐标点集合

  // 移除事件监听器
  function disabledContextMenu(e) {
    e.preventDefault();
  }
  // 启动绘制模式
  function startDrawing({ mode, ops = {}, callback = () => {} }) {
    dataSources = loadDataSourceByParams({ name: "basicDraw" });
    // 清除绘制事件
    resetDrawing();
    drawingMode = mode;
    setupHandlers({ ops, callback });
  }

  // 设置事件监听
  function setupHandlers({ ops, callback = () => {} }) {
    let viewer = window.earthObj;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //移除鼠标右击事件
    document.addEventListener("contextmenu", disabledContextMenu);

    // 鼠标左键添加点
    handler.setInputAction((e) => {
      const position = getPosition(e.position);
      if (!position) return;

      activePoints.push(position);
      if (drawingMode === "point") {
        addFixedPoint({ ...ops, position });
      } else if (drawingMode === "polyline") {
        updateDynamicShape();
        if (activePoints.length > 1) {
          // createLabel(position)
        }
      } else if (drawingMode === "polygon") {
        updateDynamicShape();
      } else if (drawingMode === "rectangle") {
        viewer.canvas.style.cursor = "crosshair";
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
          () => finalizeShape(callback),
          Cesium.ScreenSpaceEventType.LEFT_UP
        );
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动更新浮动点
    handler.setInputAction((e) => {
      const position = getPosition(e.endPosition);
      if (!position) return;

      if (floatingPoint) {
        floatingPoint.position = position;
      } else if (drawingMode !== "point") {
        floatingPoint = addFloatingPoint(position);
        if (drawingMode === "rectangle" && activePoints) {
          updateDynamicShape();
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 右击、双击结束绘制
    if (drawingMode === "point") {
      handler.setInputAction(() => {
        finalizeShape(callback);
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    } else if (drawingMode === "polyline") {
      handler.setInputAction(
        () => finalizeShape(callback),
        Cesium.ScreenSpaceEventType.RIGHT_CLICK
      );
    } else if (drawingMode === "polygon") {
      handler.setInputAction(
        () => finalizeShape(callback),
        Cesium.ScreenSpaceEventType.RIGHT_CLICK
      );
    } else if (drawingMode === "rectangle") {
      // handler.setInputAction(() => finalizeShape(callback), Cesium.ScreenSpaceEventType.LEFT_UP)
    }
  }

  // 点集的特殊性,将其独立于外部处理.
  function addFixedPoint(ops) {
    let { label, size, color, position } = ops;
    //
    if (activePoints.length > 1) {
      certainEntity.position = position;
    } else {
      certainEntity = dataSources.entities.add({
        position: position,
        // billboard:{
        //   image:pp,
        //   width: 10,
        //   height: 10,
        //   color:Cesium.Color.fromCssColorString(color),
        //   scale: 2.0,
        // }
        point: {
          pixelSize: size ? size : 12,
          color: color
            ? Cesium.Color.fromCssColorString(color)
            : Cesium.Color.RED,
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 2,
        },
        label: label
          ? {
              text: label,
              pixelOffset: new Cartesian2(0, -20),
            }
          : undefined,
      });
    }
  }

  // 添加浮动点
  function addFloatingPoint(position) {
    let viewer = window.earthObj;
    return viewer.entities.add({
      position,
      point: {
        pixelSize: 8,
        color: Cesium.Color.ORANGE,
      },
    });
  }

  // 创建标签
  function createLabel(position) {
    return dataSources.entities.add({
      position: position,
      label: {
        text: measureDistance([activePoints[0], position]).toString(),
        font: "14px sans-serif",
        fillColor: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1,
        pixelOffset: new Cesium.Cartesian3(30, 10),
      },
    });
  }

  // 更新动态图形
  function updateDynamicShape() {
    let viewer = window.earthObj;
    if (!activeShape) {
      if (drawingMode === "polyline") {
        activeShape = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(
              () => [...activePoints, floatingPoint.position._value],
              false
            ),
            width: 5,
            material: new Cesium.PolylineArrowMaterialProperty(
              Cesium.Color.RED
            ),
          },
        });
      } else if (drawingMode === "polygon") {
        activeShape = viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.CallbackProperty(
              () =>
                new Cesium.PolygonHierarchy([
                  ...activePoints,
                  floatingPoint.position._value,
                ]),
              false
            ),
            material: Cesium.Color.GREEN.withAlpha(0.5),
          },
        });
      } else if (drawingMode === "rectangle") {
        if (floatingPoint && activePoints) {
          activeShape = viewer.entities.add({
            rectangle: {
              coordinates: new Cesium.CallbackProperty(
                () =>
                  Cesium.Rectangle.fromCartesianArray([
                    ...activePoints,
                    floatingPoint.position._value,
                  ]),
                false
              ),
              material: Cesium.Color.RED.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.RED,
            },
          });
        }
      }
    }
  }

  // 完成绘制
  function finalizeShape(callback = () => {}) {
    if (drawingMode === "point") {
    } else if (
      (drawingMode === "polyline" && activePoints.length >= 2) ||
      (drawingMode === "polygon" && activePoints.length >= 3)
    ) {
      if (drawingMode === "polyline") {
        certainEntity = dataSources.entities.add({
          polyline: {
            positions: activePoints,
            clampToGround: true, //贴地
            width: 5, // 这个宽度会被材质自动继承
            material: new DashedArrowMaterialProperty({
              color: Cesium.Color.BLUE,
              dashLength: 0.05,
              gapLength: 0.03
            })
            // material: new Cesium.PolylineDashMaterialProperty({
            //   color: Cesium.Color.YELLOW,
            // }),
          },
        });
      } else {
        certainEntity = dataSources.entities.add({
          polygon: {
            hierarchy: activePoints,
            material: Cesium.Color.GREEN.withAlpha(0.5),
          },
        });
      }
    } else if (drawingMode === "rectangle") {
      let viewer = window.earthObj;
      viewer.canvas.style.cursor = "default";
      certainEntity = dataSources.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromCartesianArray([
            ...activePoints,
            floatingPoint.position._value,
          ]),
          material: Cesium.Color.RED.withAlpha(0.3),
          outline: true,
          outlineColor: Cesium.Color.RED,
        },
      });
    }
    resetDrawing();

    posistions = activePoints;
    let flag = typeof callback === "function";
    if (flag) {
      callback({
        success: true,
        msg: "add entities",
        data: { id: certainEntity.id, coods: activePoints },
      });
    }
  }

  // 重置状态
  function resetDrawing() {
    if (handler && !handler.isDestroyed()) handler.destroy();
    let viewer = window.earthObj;
    // 恢复鼠标右击事件
    document.removeEventListener("contextmenu", disabledContextMenu);
    if (floatingPoint) viewer.entities.remove(floatingPoint);
    if (activeShape) viewer.entities.remove(activeShape);
    floatingPoint = null;
    activeShape = null;
    activePoints = [];
  }

  // 获取地图坐标
  function getPosition(screenPosition) {
    let viewer = window.earthObj;
    return viewer.camera.pickEllipsoid(
      screenPosition,
      viewer.scene.globe.ellipsoid
    );
  }

  // 清除绘制状态
  function clearDraw() {
    if (dataSources) dataSources.entities.removeAll();
    if (handler && !handler.isDestroyed()) handler.destroy();
    posistions = [];
    floatingPoint = null;
    activeShape = null;
    activePoints = [];
  }

  function labelPostion(positions) {
    // 计算中点
    const midPoint = Cesium.Cartesian3.lerp(
      positions[0],
      positions[1],
      0.5,
      new Cesium.Cartesian3()
    );

    return midPoint;
  }

  return {
    startDrawing,
    clearDraw,
  };
}
