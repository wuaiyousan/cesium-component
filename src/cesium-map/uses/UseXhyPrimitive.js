import Cesium from "../utils/exportCesium";
export default function UseXhyPrimitive() {
  // 存储所有文字图元的引用
  const labelPrimitives = [];

  // 使用 Primitive 创建道路标签
  function createRoadLabelPrimitive(positions, text, options = {}) {
    const viewer = window.earthObj;
    const {
      fraction = 0.5,
      baseFontSize = 14,
      minFontSize = 8,
      maxFontSize = 24,
      fontFamily = "Arial",
      fontWeight = "normal",
      fontStyle = "normal",
      color = Cesium.Color.WHITE,
      backgroundColor = new Cesium.Color(0.1, 0.1, 0.1, 0.8),
      padding = 8,
      offset = 2,
    } = options;

    // 计算标签位置
    const labelPosition = computeInterpolatedPosition(positions, fraction);

    // 创建 BillboardCollection
    const billboardCollection = new Cesium.BillboardCollection({
      scene: viewer.scene,
      debugShowBoundingVolume: false,
    });

    // 初始创建文字画布
    const initialFontSize = computeDynamicFontSize(viewer.camera.positionCartographic.height, baseFontSize, minFontSize, maxFontSize);
    const initialFont = `${fontStyle} ${fontWeight} ${initialFontSize}pt ${fontFamily}`;
    const initialImage = createTextCanvas(text, initialFont, color, backgroundColor, padding);

    // 添加 Billboard
    const billboard = billboardCollection.add({
      position: labelPosition,
      image: initialImage,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      scale: 1.0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });

    // 存储配置信息
    const labelConfig = {
      positions,
      fraction,
      text,
      baseFontSize,
      minFontSize,
      maxFontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      color,
      backgroundColor,
      padding,
      offset,
      billboardCollection,
      billboard,
      lastUpdateTime: 0,
      updateInterval: 200, // 更新间隔(ms)
    };

    // 添加到场景
    viewer.scene.primitives.add(billboardCollection);
    labelPrimitives.push(labelConfig);

    return labelConfig;
  }

  // 更新所有标签的大小和方向
  function updateLabelSizes() {
    const viewer = window.earthObj;
    const now = Date.now();
    const cameraHeight = viewer.camera.positionCartographic.height;

    labelPrimitives.forEach((labelConfig) => {
      if (now - labelConfig.lastUpdateTime < labelConfig.updateInterval) {
        return;
      }

      labelConfig.lastUpdateTime = now;

      try {
        // 更新字体大小
        const dynamicFontSize = computeDynamicFontSize(cameraHeight, labelConfig.baseFontSize, labelConfig.minFontSize, labelConfig.maxFontSize);

        const font = `${labelConfig.fontStyle} ${labelConfig.fontWeight} ${dynamicFontSize}pt ${labelConfig.fontFamily}`;
        const newImage = createTextCanvas(labelConfig.text, font, labelConfig.color, labelConfig.backgroundColor, labelConfig.padding);

        // 更新 Billboard 图像
        labelConfig.billboard.image = newImage;

        // 更新位置（确保贴地）
        const newPosition = computeInterpolatedPosition(labelConfig.positions, labelConfig.fraction);
        labelConfig.billboard.position = newPosition;

        // 更新旋转角度
        const rotation = computeScreenRotation(labelConfig.positions, labelConfig.fraction);
        labelConfig.billboard.rotation = rotation;
      } catch (error) {
        console.warn("更新标签失败:", error);
      }
    });
  }

  // 计算动态字体大小
  function computeDynamicFontSize(cameraHeight, baseSize, minSize, maxSize) {
    const minHeight = 100;
    const maxHeight = 50000;

    const clampedHeight = Cesium.Math.clamp(cameraHeight, minHeight, maxHeight);
    const normalizedHeight = (clampedHeight - minHeight) / (maxHeight - minHeight);

    // 使用二次函数实现平滑变化
    const fontSize = baseSize * (1 - normalizedHeight * 0.7);

    return Cesium.Math.clamp(fontSize, minSize, maxSize);
  }

  // 创建文字画布
  function createTextCanvas(text, font, color, bgColor, padding = 8) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 设置字体
    ctx.font = font;

    // 测量文字尺寸
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const fontSize = parseInt(font) || 14;
    const height = fontSize * 1.2 + padding * 2;

    // 确保最小尺寸
    canvas.width = Math.max(width, 40);
    canvas.height = Math.max(height, 20);

    // 重新设置字体
    ctx.font = font;

    // 绘制圆角矩形背景
    if (bgColor) {
      const borderRadius = 4;
      ctx.fillStyle = `rgba(${Math.round(bgColor.red * 255)}, ${Math.round(bgColor.green * 255)}, ${Math.round(bgColor.blue * 255)}, ${
        bgColor.alpha
      })`;

      ctx.beginPath();
      ctx.moveTo(borderRadius, 0);
      ctx.lineTo(canvas.width - borderRadius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, borderRadius);
      ctx.lineTo(canvas.width, canvas.height - borderRadius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height);
      ctx.lineTo(borderRadius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - borderRadius);
      ctx.lineTo(0, borderRadius);
      ctx.quadraticCurveTo(0, 0, borderRadius, 0);
      ctx.closePath();
      ctx.fill();
    }

    // 绘制文字
    ctx.fillStyle = `rgb(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)})`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas;
  }

  // 计算屏幕空间旋转角度
  function computeScreenRotation(positions, fraction) {
    const segmentDirection = computeScreenSegmentDirection(positions, fraction);
    if (!segmentDirection) return 0;

    const angle = Math.atan2(segmentDirection.y, segmentDirection.x);
    return -angle;
  }

  // 计算线段在屏幕上的方向
  function computeScreenSegmentDirection(positions, fraction) {
    const viewer = window.earthObj;
    const segmentIndex = findSegmentIndex(positions, fraction);
    if (segmentIndex === -1 || segmentIndex >= positions.length - 1) return null;

    const start = positions[segmentIndex];
    const end = positions[segmentIndex + 1];

    try {
      const startScreen = viewer.scene.cartesianToCanvasCoordinates(start);
      const endScreen = viewer.scene.cartesianToCanvasCoordinates(end);

      if (!startScreen || !endScreen) return null;

      const direction = new Cesium.Cartesian2();
      Cesium.Cartesian2.subtract(endScreen, startScreen, direction);

      const length = Cesium.Cartesian2.magnitude(direction);
      if (length < 1) {
        return new Cesium.Cartesian2(1, 0);
      }

      Cesium.Cartesian2.normalize(direction, direction);
      return direction;
    } catch (error) {
      return null;
    }
  }

  // 计算插值位置
  function computeInterpolatedPosition(positions, fraction) {
    let totalLength = 0;
    const segmentLengths = [];

    for (let i = 0; i < positions.length - 1; i++) {
      const length = Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
      segmentLengths.push(length);
      totalLength += length;
    }

    const targetDistance = totalLength * fraction;
    let accumulatedDistance = 0;

    for (let i = 0; i < positions.length - 1; i++) {
      const segmentLength = segmentLengths[i];

      if (accumulatedDistance + segmentLength >= targetDistance) {
        const segmentFraction = (targetDistance - accumulatedDistance) / segmentLength;

        const start = positions[i];
        const end = positions[i + 1];
        const interpolated = new Cesium.Cartesian3();

        Cesium.Cartesian3.lerp(start, end, segmentFraction, interpolated);

        const cartographic = Cesium.Cartographic.fromCartesian(interpolated);
        return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
      }

      accumulatedDistance += segmentLength;
    }

    const lastPosition = positions[positions.length - 1];
    const cartographic = Cesium.Cartographic.fromCartesian(lastPosition);
    return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
  }

  // 找到文字所在的线段段
  function findSegmentIndex(positions, fraction) {
    const totalLength = computePolylineLength(positions);
    const targetDistance = totalLength * fraction;

    let accumulatedDistance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const segmentLength = Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
      if (accumulatedDistance + segmentLength >= targetDistance) {
        return i;
      }
      accumulatedDistance += segmentLength;
    }

    return positions.length - 2;
  }

  // 计算线段长度
  function computePolylineLength(positions) {
    let length = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      length += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
    }
    return length;
  }

  function testPrimitive() {
    const viewer = window.earthObj;
  // 创建测试线段
  const roadPositions = [
    Cesium.Cartesian3.fromDegrees(116.3, 39.95),
    Cesium.Cartesian3.fromDegrees(116.35, 39.93),
    Cesium.Cartesian3.fromDegrees(116.4, 39.92),
    Cesium.Cartesian3.fromDegrees(116.45, 39.93),
    Cesium.Cartesian3.fromDegrees(116.5, 39.95),
  ];

  const curvedRoadPositions = [
    Cesium.Cartesian3.fromDegrees(116.25, 39.88),
    Cesium.Cartesian3.fromDegrees(116.3, 39.87),
    Cesium.Cartesian3.fromDegrees(116.35, 39.89),
    Cesium.Cartesian3.fromDegrees(116.4, 39.88),
    Cesium.Cartesian3.fromDegrees(116.45, 39.86),
    Cesium.Cartesian3.fromDegrees(116.5, 39.87),
  ];


  // 创建道路标签
  createRoadLabelPrimitive(roadPositions, "长安街", {
    baseFontSize: 16,
    color: Cesium.Color.YELLOW,
    backgroundColor: new Cesium.Color(0.2, 0.2, 0.2, 0.9),
  });

  // 创建弯曲道路标签
  createRoadLabelPrimitive(curvedRoadPositions, "弯曲大道", {
    baseFontSize: 14,
    color: Cesium.Color.CYAN,
    backgroundColor: new Cesium.Color(0.1, 0.2, 0.3, 0.8),
  });

  // 可视化线段
  viewer.entities.add({
    polyline: {
      positions: roadPositions,
      width: 4,
      material: Cesium.Color.ORANGE,
      clampToGround: true,
    },
  });

  viewer.entities.add({
    polyline: {
      positions: curvedRoadPositions,
      width: 3,
      material: Cesium.Color.BLUE,
      clampToGround: true,
    },
  });

    // 添加相机变化监听器
    viewer.camera.changed.addEventListener(updateLabelSizes);

    // 初始更新一次
    setTimeout(updateLabelSizes, 100);

    // 性能优化：限制更新频率
    let lastUpdateTime = 0;
    const MAX_UPDATE_INTERVAL = 100; // 最大更新间隔(ms)

    function throttledUpdateLabelSizes() {
      const now = Date.now();
      if (now - lastUpdateTime > MAX_UPDATE_INTERVAL) {
        lastUpdateTime = now;
        updateLabelSizes();
      }
    }

    // 替换原来的监听器
    viewer.camera.changed.removeEventListener(updateLabelSizes);
    viewer.camera.changed.addEventListener(throttledUpdateLabelSizes);
    viewer.zoomTo(viewer.entities);
  }

  return {
    testPrimitive,
  };
}
