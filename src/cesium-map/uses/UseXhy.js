import Cesium from "../utils/exportCesium";
export default function UseXhy() {
  // 为折线的每个线段创建文字标签
  function createSegmentLabels(positions, baseText, options = {}) {
    const {
      baseFontSize = 14,
      minFontSize = 14,
      maxFontSize = 20,
      fontFamily = "Arial",
      color = Cesium.Color.WHITE,
      backgroundColor = new Cesium.Color(0.1, 0.1, 0.1, 0.0),
      padding = 6,
      offset = 2,
    } = options;

    // 为每个线段创建标签
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      let segmentText = baseText[i]

      createSingleLabel(
        [start, end], // 线段的两端点
        segmentText,
        {
          baseFontSize,
          minFontSize,
          maxFontSize,
          fontFamily,
          color,
          backgroundColor,
          padding,
          offset,
          segmentIndex: i,
        }
      );
    }
  }

  // 创建单个文字标签
  function createSingleLabel(segmentPositions, text, options = {}) {
    const viewer = window.earthObj;
    const {
      baseFontSize = 14,
      minFontSize = 6,
      maxFontSize = 20,
      fontFamily = "Arial",
      color = Cesium.Color.WHITE,
      backgroundColor = new Cesium.Color(0.1, 0.1, 0.1, 0.8),
      padding = 6,
      offset = 2,
      segmentIndex = 0,
    } = options;

    // 计算标签位置（线段中点）
    const labelPosition = computeSegmentPosition(segmentPositions[0], segmentPositions[1], 0.5);

    // 创建初始文字画布
    const initialFontSize = computeDynamicFontSize(viewer.camera.positionCartographic.height, baseFontSize, minFontSize, maxFontSize);
    const initialFont = `${initialFontSize}pt ${fontFamily}`;
    const initialImage = createTextCanvas(text, initialFont, color, backgroundColor, padding);

    // 创建billboard（贴地）
    const billboard = viewer.entities.add({
      position: labelPosition,
      billboard: {
        image: initialImage,
        rotation: new Cesium.CallbackProperty(() => computeSegmentRotation(segmentPositions), false),
        pixelOffset: new Cesium.Cartesian2(20, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        scale: new Cesium.CallbackProperty(() => computeDynamicScale(), false),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    // 存储标签配置信息
    billboard._labelConfig = {
      text,
      baseFontSize,
      minFontSize,
      maxFontSize,
      fontFamily,
      color,
      backgroundColor,
      padding,
      segmentPositions,
      segmentIndex,
    };

    // 监听相机变化，动态更新文字大小
    let lastUpdateTime = 0;
    const updateInterval = 100;

    viewer.camera.changed.addEventListener(function () {
      const now = Date.now();
      if (now - lastUpdateTime > updateInterval) {
        lastUpdateTime = now;
        updateLabelSize(billboard);
      }
    });

    // 初始更新一次
    setTimeout(() => updateLabelSize(billboard), 100);

    roadLabels.push(billboard);
    return billboard;
  }

  // 计算线段上的位置
  function computeSegmentPosition(start, end, fraction) {
    const interpolated = new Cesium.Cartesian3();
    Cesium.Cartesian3.lerp(start, end, fraction, interpolated);

    const cartographic = Cesium.Cartographic.fromCartesian(interpolated);
    return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
  }

  // 计算线段旋转角度
  function computeSegmentRotation(segmentPositions) {
    const viewer = window.earthObj;
    const start = segmentPositions[0];
    const end = segmentPositions[1];

    try {
      const startScreen = viewer.scene.cartesianToCanvasCoordinates(start);
      const endScreen = viewer.scene.cartesianToCanvasCoordinates(end);

      if (!startScreen || !endScreen) return 0;

      const direction = new Cesium.Cartesian2();
      Cesium.Cartesian2.subtract(endScreen, startScreen, direction);

      const length = Cesium.Cartesian2.magnitude(direction);
      if (length < 1) {
        return 0;
      }

      Cesium.Cartesian2.normalize(direction, direction);
      const angle = Math.atan2(direction.y, direction.x);
      return -angle;
    } catch (error) {
      return 0;
    }
  }

  // 根据相机高度计算动态缩放比例
  function computeDynamicScale() {
    const viewer = window.earthObj;
    const cameraHeight = viewer.camera.positionCartographic.height;
    const minHeight = 100;
    const maxHeight = 100000;

    const clampedHeight = Cesium.Math.clamp(cameraHeight, minHeight, maxHeight);
    const scale = 1.0 / Math.log10(clampedHeight / minHeight + 1);

    return Cesium.Math.clamp(scale, 0.1, 3.0);
  }

  // 根据相机高度更新文字大小
  function updateLabelSize(billboard) {
    const viewer = window.earthObj;
    if (!billboard._labelConfig) return;

    const config = billboard._labelConfig;
    const cameraHeight = viewer.camera.positionCartographic.height;

    // 计算动态字体大小
    const dynamicFontSize = computeDynamicFontSize(cameraHeight, config.baseFontSize, config.minFontSize, config.maxFontSize);

    // 创建安全的字体字符串
    const dynamicFont = `${dynamicFontSize}pt ${config.fontFamily}`;

    // 创建新的文字画布
    const newImage = createTextCanvas(config.text, dynamicFont, config.color, config.backgroundColor, config.padding);

    // 更新billboard的图像
    billboard.billboard.image = newImage;
  }

  // 根据相机高度计算字体大小
  function computeDynamicFontSize(cameraHeight, baseSize, minSize, maxSize) {
    const minHeight = 100;
    const maxHeight = 50000;

    const clampedHeight = Cesium.Math.clamp(cameraHeight, minHeight, maxHeight);
    const normalizedHeight = (clampedHeight - minHeight) / (maxHeight - minHeight);
    const fontSize = baseSize * Math.exp(-normalizedHeight * 2);

    return Cesium.Math.clamp(fontSize, minSize, maxSize);
  }

  // 安全的文字画布创建函数
  function createTextCanvas(text, font, color, bgColor, padding = 8) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 安全解析字体
    let fontSize = 14;
    if (font && typeof font === "string") {
      const sizeMatch = font.match(/(\d+)/);
      if (sizeMatch) {
        fontSize = parseInt(sizeMatch[0]);
      }
      fontSize = Math.max(6, Math.min(fontSize, 48));
    }

    const safeFont = `${fontSize}pt Arial`;
    ctx.font = safeFont;

    // 测量文字尺寸
    const metrics = ctx.measureText(text);
    const width = Math.max(metrics.width + padding * 2, 40);
    const height = Math.max(fontSize * 1.5 + padding * 2, 25);

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    // 重新设置字体
    ctx.font = safeFont;

    // 绘制背景
    if (bgColor) {
      ctx.fillStyle = `rgba(${Math.round(bgColor.red * 255)}, ${Math.round(bgColor.green * 255)}, ${Math.round(bgColor.blue * 255)}, ${
        bgColor.alpha
      })`;
      ctx.fillRect(0, 0, width, height);
    }

    // 绘制文字
    ctx.fillStyle = `rgb(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)})`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);

    return canvas;
  }
    // 存储所有标签的引用
    const roadLabels = [];
  function xhyTestFun() {
    const viewer = window.earthObj;

    // 创建测试线段（贴地）
    const roadPositions = [
      Cesium.Cartesian3.fromDegrees(116.3, 39.95),
      Cesium.Cartesian3.fromDegrees(116.35, 39.93),
      Cesium.Cartesian3.fromDegrees(116.4, 39.92),
      Cesium.Cartesian3.fromDegrees(116.45, 39.93),
      Cesium.Cartesian3.fromDegrees(116.5, 39.95),
    ];

    // 创建弯曲的测试线段
    const curvedRoadPositions = [
      Cesium.Cartesian3.fromDegrees(116.25, 39.88),
      Cesium.Cartesian3.fromDegrees(116.3, 39.87),
      Cesium.Cartesian3.fromDegrees(116.35, 39.89),
      Cesium.Cartesian3.fromDegrees(116.4, 39.88),
      Cesium.Cartesian3.fromDegrees(116.45, 39.86),
      Cesium.Cartesian3.fromDegrees(116.5, 39.87),
    ];



    // 为弯曲道路创建标签
    createSegmentLabels(curvedRoadPositions, ["xhy001", "xhy002", "xhy003"], {
      baseFontSize: 12,
      minFontSize: 12,
      maxFontSize: 18,
      color: Cesium.Color.CYAN,
      backgroundColor: new Cesium.Color(0.1, 0.2, 0.3, 0.0),
      labelsPerSegment: 1, // 每个线段1个标签
    });


    viewer.entities.add({
      polyline: {
        positions: curvedRoadPositions,
        width: 3,
        material: Cesium.Color.BLUE,
        clampToGround: true,
      },
    });

    viewer.zoomTo(viewer.entities);
  }

  return {
    xhyTestFun,
  };
}
