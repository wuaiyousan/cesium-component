/*
 * @Description: 
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:06:08
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-07-31 16:49:14
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
// 设置cesium静态文件的引用路径
const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
      CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src/cesium-map"),
      },
    },
    plugins: [
      vue(), 
      // 将cesium的静态文件拷贝到公共文件夹。这个方法不知道为什么不可以。。。。很奇怪
      viteStaticCopy({
        targets: [
          { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
          { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
          { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
          { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
        ],
      }),
    ],
  };
});
