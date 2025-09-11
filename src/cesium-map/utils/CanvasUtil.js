/*
 * @Author: xionghaiying
 * @Date: 2025-08-12 19:46:11
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-11 13:50:10
 * @Description: canvas处理
 */
class CanvasUtil {
  static createTextImage(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const padding = 2;
    const fontSize = 16;

    ctx.font = `${fontSize}px Arial, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    canvas.width = textWidth + 2 * padding;
    canvas.height = fontSize + 2 * padding;

    // 背景色（半透明黑）
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 文字颜色
    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, padding, canvas.height / 2);

    return canvas.toDataURL();
  }
}

export default CanvasUtil;
