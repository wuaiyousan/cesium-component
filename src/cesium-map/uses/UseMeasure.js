/*
 * @Author: xionghaiying
 * @Date: 2025-09-25 15:43:48
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-25 17:59:18
 * @Description: 量算
 */
import Cesium from "../utils/exportCesium.js";
export default function UseMeasure() {
  function circleMeasure() {}

  // 绘制状态变量
  let drawingMode = false;
  let centerPoint = null;
  let temporaryCircle = null;
  let radiusLine = null;
  let handler = null;
  let currentRadius = 0.0;
  let mousePosition = null;
  let finalRadiusLine = null;
  let radiusLabel = null;

  // 开始绘制模式
  function startDrawing() {
    const viewer = window.earthObj;
    
    // 重置之前的状态
    resetDrawingState();
    
    drawingMode = true;
    console.log("开始绘制圆形，请点击地图确定圆心");
    
    // 设置事件处理器
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 第一次点击确定圆心
    handler.setInputAction(function (event) {
      const position = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
      if (position && Cesium.defined(position)) {
        centerPoint = position;
        console.log("圆心已确定，现在拖动鼠标调整半径");

        // 创建临时圆形 - 使用固定值初始化和安全的回调
        temporaryCircle = viewer.entities.add({
          position: centerPoint,
          ellipse: {
            semiMinorAxis: 0, // 初始小半径
            semiMajorAxis: 0, // 初始小半径
            material: Cesium.Color.YELLOW.withAlpha(0.4),
            outline: true,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 2,
          },
        });

        // 创建临时半径线
        radiusLine = viewer.entities.add({
          polyline: {
            positions: [centerPoint, centerPoint], // 初始位置相同
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.CYAN,
              dashLength: 16.0,
            }),
          },
        });

        // 移除之前的鼠标移动事件（避免重复绑定）
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        // 鼠标移动时更新半径和半径线
        handler.setInputAction(function (moveEvent) {
          const newMousePosition = viewer.camera.pickEllipsoid(moveEvent.endPosition, viewer.scene.globe.ellipsoid);
          if (centerPoint && newMousePosition && Cesium.defined(newMousePosition)) {
            mousePosition = newMousePosition;
            
            // 计算半径（确保是有效数字）
            const newRadius = Cesium.Cartesian3.distance(centerPoint, mousePosition);
            if (!isNaN(newRadius) && isFinite(newRadius) && newRadius > 0) {
              currentRadius = newRadius;
              
              // 直接更新实体的属性，而不是使用 CallbackProperty
              if (temporaryCircle && temporaryCircle.ellipse) {
                temporaryCircle.ellipse.semiMinorAxis = newRadius;
                temporaryCircle.ellipse.semiMajorAxis = newRadius;
              }
              
              if (radiusLine && radiusLine.polyline) {
                radiusLine.polyline.positions = [centerPoint, mousePosition];
              }
              
              // 计算与正北的角度
              const angle = calculateNorthAngle(centerPoint, mousePosition);
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 移除之前的点击事件（避免重复绑定）
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        
        // 第二次点击完成绘制
        handler.setInputAction(function (secondClick) {
          if (centerPoint && temporaryCircle) {
            const finalMousePosition = viewer.camera.pickEllipsoid(secondClick.position, viewer.scene.globe.ellipsoid);
            if (finalMousePosition && Cesium.defined(finalMousePosition)) {
              completeDrawing(viewer, finalMousePosition);
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }

  // 完成绘制
  function completeDrawing(viewer, finalMousePosition) {
    mousePosition = finalMousePosition;
    currentRadius = Cesium.Cartesian3.distance(centerPoint, mousePosition);
    
    // 验证半径有效性
    if (isNaN(currentRadius) || !isFinite(currentRadius) || currentRadius <= 0) {
      console.error("无效的半径值:", currentRadius);
      resetDrawingState();
      return;
    }
    
    const finalAngle = calculateNorthAngle(centerPoint, mousePosition);

    // 移除临时圆形和半径线
    if (temporaryCircle) {
      viewer.entities.remove(temporaryCircle);
      temporaryCircle = null;
    }
    
    if (radiusLine) {
      viewer.entities.remove(radiusLine);
      radiusLine = null;
    }

    try {
      // 创建最终圆形
      const circleEntity = viewer.entities.add({
        position: centerPoint,
        name: "绘制的圆形",
        ellipse: {
          semiMinorAxis: currentRadius,
          semiMajorAxis: currentRadius,
          material: Cesium.Color.GREEN.withAlpha(0.4),
          outline: true,
          outlineColor: Cesium.Color.GREEN,
          outlineWidth: 3,
        },
        description: `圆形半径: ${(currentRadius / 1000).toFixed(2)} 公里`,
      });

      // 创建最终的半径线（保留）
      finalRadiusLine = viewer.entities.add({
        polyline: {
          positions: [centerPoint, mousePosition],
          width: 3,
          material: Cesium.Color.CYAN,
        },
      });

      // 在半径线终点添加半径和角度标注
      radiusLabel = viewer.entities.add({
        position: mousePosition,
        label: {
          text: `半径: ${(currentRadius / 1000).toFixed(2)} km\n角度: ${finalAngle.toFixed(1)}°`,
          font: "14pt sans-serif",
          fillColor: Cesium.Color.WHITE,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(15, 0),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          scale: 0.8,
        },
        billboard: {
          image: "data:image/svg+xml;base64," + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="8" fill="cyan" stroke="white" stroke-width="2"/>
            </svg>
          `),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          scale: 0.8,
        },
      });

      // 在圆心添加标注
      viewer.entities.add({
        position: centerPoint,
        label: {
          text: "圆心",
          font: "12pt sans-serif",
          fillColor: Cesium.Color.WHITE,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, 20),
          scale: 0.7,
        },
      });

      console.log("圆形绘制完成");
    } catch (error) {
      console.error("绘制圆形时出错:", error);
    }

    // 重置状态（但不移除最终图形）
    resetDrawingState(false);
  }

  // 计算与正北的角度（0-360度）
  function calculateNorthAngle(center, point) {
    try {
      const centerCartographic = Cesium.Cartographic.fromCartesian(center);
      const pointCartographic = Cesium.Cartographic.fromCartesian(point);

      const centerLon = Cesium.Math.toDegrees(centerCartographic.longitude);
      const centerLat = Cesium.Math.toDegrees(centerCartographic.latitude);
      const pointLon = Cesium.Math.toDegrees(pointCartographic.longitude);
      const pointLat = Cesium.Math.toDegrees(pointCartographic.latitude);

      // 计算两点间的方位角（从正北顺时针）
      const dLon = ((pointLon - centerLon) * Math.PI) / 180;
      const y = Math.sin(dLon) * Math.cos((pointLat * Math.PI) / 180);
      const x =
        Math.cos((centerLat * Math.PI) / 180) * Math.sin((pointLat * Math.PI) / 180) -
        Math.sin((centerLat * Math.PI) / 180) * Math.cos((pointLat * Math.PI) / 180) * Math.cos(dLon);

      let angle = (Math.atan2(y, x) * 180) / Math.PI;
      angle = (angle + 360) % 360; // 转换为0-360度

      return isNaN(angle) ? 0 : angle;
    } catch (error) {
      console.error("计算角度时出错:", error);
      return 0;
    }
  }

  // 取消绘制
  function cancelDrawing() {
    resetDrawingState();
    console.log("绘制已取消");
  }

  // 重置绘制状态
  function resetDrawingState(removeFinalEntities = true) {
    const viewer = window.earthObj;
    drawingMode = false;
    
    // 移除事件处理器
    if (handler) {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.destroy();
      handler = null;
    }

    // 移除临时实体
    if (temporaryCircle) {
      viewer.entities.remove(temporaryCircle);
      temporaryCircle = null;
    }

    if (radiusLine) {
      viewer.entities.remove(radiusLine);
      radiusLine = null;
    }

    // 可选：移除最终实体
    if (removeFinalEntities) {
      if (finalRadiusLine) {
        viewer.entities.remove(finalRadiusLine);
        finalRadiusLine = null;
      }
      
      if (radiusLabel) {
        viewer.entities.remove(radiusLabel);
        radiusLabel = null;
      }
      
      // 移除所有圆形实体（根据名称筛选）
      const entities = viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        if (entity.name === "绘制的圆形") {
          viewer.entities.remove(entity);
        }
      }
    }

    centerPoint = null;
    currentRadius = 0;
    mousePosition = null;
  }

  // 清除所有绘制的图形
  function clearAll() {
    resetDrawingState(true);
    console.log("已清除所有图形");
  }

  return {
    circleMeasure,
    startDrawing,
    cancelDrawing,
    clearAll
  };
}