/*
 * @Description:
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:57:04
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-05 17:02:32
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 设置cesium静态文件的引用路径
const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

export default defineConfig({
  plugins: [
    vue(),
    // 将cesium的静态文件拷贝到公共文件夹
    viteStaticCopy({
      targets: [
        { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
        { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
        { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
        { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
      ],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/plugin.js"),
      name: "VueCesiumComponent",
      fileName: (format) => `cesium-component.${format}.js`,
      formats: ["es", "umd"], // 明确指定要生成的格式
    },
    rollupOptions: {
      external: ["vue", "cesium"],
      output: {
        globals: {
          vue: "Vue",
          cesium: "Cesium",
        },
        assetFileNames: "style.css", // 固定输出文件名
      },
    },

    outDir: "dist",
    emptyOutDir: true,
    commonjsOptions: {
      strictRequires: true, // 兼容commonjs
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/cesium-map"),
    },
  },
  // 设置 Cesium 静态资源路径（开发和生产环境不同）
  define: {
    CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`),
  },
});
