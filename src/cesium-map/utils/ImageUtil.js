/*
 * @Author: xionghaiying
 * @Date: 2025-09-11 13:43:36
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-11 14:25:34
 * @Description: ImageUtil
 */
export default function ImageUtil() {
  /**
   * @description: 导出当前视窗图片
   * @param {Object} options 配置选项
   * @param {string} options.imageType 图像格式: "image/png" 或 "image/jpeg"
   * @param {number} options.imageQuality 图像质量 (0.1-1.0)
   * @param {number} options.resolutionScale 分辨率缩放
   * @return {Promise} 返回Promise对象，resolve时返回图像数据
   */
  function exportImage(options = {}) {
    const { imageType = "png", imageQuality = 1, resolutionScale = 1 } = options;

    // 返回Promise以便支持异步操作
    return new Promise((resolve, reject) => {
      // 获取分辨率缩放
      const resolutionScaleNum = parseFloat(resolutionScale);
      // 获取图像质量
      const imageQualityNum = parseFloat(imageQuality);

      requestAnimationFrame(function () {
        try {
          const viewer = window.earthObj;
          if (!viewer) {
            throw new Error("Cesium viewer未初始化");
          }

          // 等待场景渲染完成
          viewer.render();

          // 获取canvas和上下文
          const canvas = viewer.scene.canvas;
          const width = canvas.width;
          const height = canvas.height;

          // 创建离屏canvas进行捕获
          const captureCanvas = document.createElement("canvas");
          captureCanvas.width = width * resolutionScaleNum;
          captureCanvas.height = height * resolutionScaleNum;

          const context = captureCanvas.getContext("2d");

          // 设置缩放
          context.scale(resolutionScaleNum, resolutionScaleNum);

          // 绘制当前场景
          context.drawImage(canvas, 0, 0);

          // 获取图像数据
          const imageData = captureCanvas.toDataURL(imageType, imageQualityNum);

          // 解析Promise
          resolve(imageData);
        } catch (error) {
          console.error("捕获图像时出错:", error);

          // 拒绝Promise
          reject(error);
        }
      });
    });
  }

  return {
    exportImage,
  };
}
