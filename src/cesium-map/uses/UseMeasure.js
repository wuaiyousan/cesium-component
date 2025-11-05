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
  let tempRadiusLabel = null; // 临时半径标签

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

        // 创建临时圆形 - 使用 CallbackProperty 动态更新半径
        temporaryCircle = viewer.entities.add({
          position: centerPoint,
          ellipse: {
            semiMinorAxis: new Cesium.CallbackProperty(function() {
              if (!centerPoint || !mousePosition) {
                return 1.0; // 最小值
              }
              const distance = Cesium.Cartesian3.distance(centerPoint, mousePosition);
              return distance > 0.1 ? distance : 1.0;
            }, false),
            semiMajorAxis: new Cesium.CallbackProperty(function() {
              if (!centerPoint || !mousePosition) {
                return 1.0; // 最小值
              }
              const distance = Cesium.Cartesian3.distance(centerPoint, mousePosition);
              return distance > 0.1 ? distance : 1.0;
            }, false),
            material: Cesium.Color.YELLOW.withAlpha(0.4),
            outline: true,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 2,
          },
        });

        // 创建临时半径线 - 使用 CallbackProperty 动态计算位置
        radiusLine = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(function() {
              if (!centerPoint) {
                return [];
              }
              if (!mousePosition || Cesium.Cartesian3.distance(centerPoint, mousePosition) < 0.1) {
                // 返回一个很小的偏移避免相同点
                const offset = Cesium.Cartesian3.add(
                  centerPoint, 
                  new Cesium.Cartesian3(0.1, 0, 0), 
                  new Cesium.Cartesian3()
                );
                return [centerPoint, offset];
              }
              return [centerPoint, mousePosition];
            }, false),
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.CYAN,
              dashLength: 16.0,
            }),
          },
        });

        // 创建临时标签 - 显示实时半径
        tempRadiusLabel = viewer.entities.add({
          position: new Cesium.CallbackProperty(function() {
            return mousePosition || centerPoint;
          }, false),
          label: {
            text: new Cesium.CallbackProperty(function() {
              if (!centerPoint || !mousePosition) {
                return '点击确定半径';
              }
              const distance = Cesium.Cartesian3.distance(centerPoint, mousePosition);
              if (distance < 0.1) {
                return '移动鼠标调整半径';
              }
              const radiusKm = (distance / 1000).toFixed(2);
              const angle = calculateNorthAngle(centerPoint, mousePosition);
              return `半径: ${radiusKm} km\n角度: ${angle.toFixed(1)}°`;
            }, false),
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
            show: true,
          },
        });

        // 移除之前的鼠标移动事件（避免重复绑定）
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        
        // 鼠标移动时只需更新 mousePosition,CallbackProperty 会自动更新圆形和半径线
        handler.setInputAction(function (moveEvent) {
          const newMousePosition = viewer.camera.pickEllipsoid(moveEvent.endPosition, viewer.scene.globe.ellipsoid);
          if (newMousePosition && Cesium.defined(newMousePosition)) {
            mousePosition = newMousePosition;
            
            // 更新当前半径值（用于后续使用）
            if (centerPoint) {
              const distance = Cesium.Cartesian3.distance(centerPoint, mousePosition);
              if (distance >= 0.1) {
                currentRadius = distance;
              }
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

    // 移除临时圆形、半径线和标签
    if (temporaryCircle) {
      viewer.entities.remove(temporaryCircle);
      temporaryCircle = null;
    }
    
    if (radiusLine) {
      viewer.entities.remove(radiusLine);
      radiusLine = null;
    }
    
    if (tempRadiusLabel) {
      viewer.entities.remove(tempRadiusLabel);
      tempRadiusLabel = null;
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
      // 检查点是否有效
      if (!center || !point || !Cesium.defined(center) || !Cesium.defined(point)) {
        return 0;
      }
      
      // 检查两点是否过于接近
      const distance = Cesium.Cartesian3.distance(center, point);
      if (distance < 0.1) {
        return 0; // 距离太小,角度无意义
      }
      
      const centerCartographic = Cesium.Cartographic.fromCartesian(center);
      const pointCartographic = Cesium.Cartographic.fromCartesian(point);
      
      if (!centerCartographic || !pointCartographic) {
        return 0;
      }

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

      // 检查计算结果是否有效
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        return 0;
      }

      let angle = (Math.atan2(y, x) * 180) / Math.PI;
      angle = (angle + 360) % 360; // 转换为0-360度

      return isNaN(angle) || !isFinite(angle) ? 0 : angle;
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
    
    if (tempRadiusLabel) {
      viewer.entities.remove(tempRadiusLabel);
      tempRadiusLabel = null;
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