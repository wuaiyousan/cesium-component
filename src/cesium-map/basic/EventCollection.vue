<!--
 * @Author: xionghaiying
 * @Date: 2025-08-06 10:57:23
 * @LastEditors: xionghiaying 
 * @LastEditTime: 2025-11-07 14:08:02
 * @Description: 
-->
<template></template>

<script setup>
import { onMounted, onUnmounted } from "vue";

import Cesium from "../utils/exportCesium.js";

import eventMapBus from "../utils/eventMapBus.js";
import UseDataSource from "../uses/UseDataSource.js";
import UseEntity from "../uses/UseEntity.js";
import UsePrimitiveCollection from "../uses/usePrimitiveCollection.js";
import ImageUtil from "../utils/imageUtil.js";

import PostStage from "../glsl/UsePostStage.js";
import UseMeasure from "../uses/UseMeasure.js";

// 临时测试
import UseXhy from "../uses/UseXhy.js";
import UseXhyPrimitive from "../uses/UseXhyPrimitive.js";

import TurfUtil from "../utils/TurfUtil.js";

const { doEventOn, doEventSend, doEventOff } = eventMapBus();
const { loadDataSourceByParams } = UseDataSource();
const { createPolyline, createPolygon, updateEntityProperties } = UseEntity();
const { startDrawing } = UseMeasure();
const { addFlickerLine, addCircleScan } = PostStage();

const { loadPrimitiveCollection } = UsePrimitiveCollection();
const { exportImage } = ImageUtil();

const { getCircleByTurf, getSectorByTurf, getDifferenceByTurf } = TurfUtil();

// 临时测试
const { xhyTestFun } = UseXhy();
const { testPrimitive } = UseXhyPrimitive();

import xhytest from "../assets/json/xhytest.json";

// 测试
const mapTest = (data) => {
  console.log("xhy----mapTest", data);
  xhyTestFun();
};

const creatPolylineFun = ({ data }) => {
  let { id, points } = data;
  let positions = [];

  points.forEach((item) => {
    let { longitude, latitude, altitude } = item;
    let xhy = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
    positions.push(xhy);
  });
  let testData = [
    {
      id,
      positions,
      options: {
        width: 6,
        lineType: 3,
        lineColor: "#25aff3",
      },
    },
  ];

  createPolyline({ layerName: "basic_drawing", dataList: testData });
};

const createPolygonFun = ({ center, radius, bearing1, bearing2 }) => {
  // ??? 当bearingOne为负数时，计算2个扇面的差集，不能正确的计算结果。暂未找到原因
  let bigCirlce = getCircleByTurf({ center, radius: radius[0] });
  let bigSector = getSectorByTurf({ center, radius: radius[0], bearingOne: bearing1, bearingTwo: bearing2 });
  let smallCircle = getCircleByTurf({ center, radius: radius[1] });

  let smallSector = getSectorByTurf({ center, radius: radius[1], bearingOne: bearing1, bearingTwo: bearing2 });

  let difference = getDifferenceByTurf({ polygons: [bigCirlce, smallSector] });

  console.log("2222", bigSector, smallCircle, difference);
  // createPolygon({ id: "xhy002", positions: bigSector.geometry.coordinates[0].flat() });
  // createPolygon({ id: "xhy003", positions: smallCircle.geometry.coordinates[0].flat() });

  createPolygon({ id: "xhy004", positions: xhytest });
};

const exportImageFun = async ({ imageType, callback = () => {} }) => {
  let info = null;
  info = await exportImage({ imageType });
  let flag = typeof callback === "function";
  if (flag) {
    callback({ success: true, msg: "exportImageFun", data: info });
  }
};

const addFlickerLineFun = ({ dataList, color = "#5ee603ff" }) => {
  dataList.forEach((item) => {
    let { positions, id } = item;
    addFlickerLine({ positions, id, color });
  });
};

const mapInited = () => {
  // 订阅与发送
  doEventOn("map-test", mapTest);

  //#region ------DataSource------
  doEventOn("map-add-dataSoure", loadDataSourceByParams);

  //#endregion ------DataSource------

  //#region ------entity------
  doEventOn("entity-polyline-add", creatPolylineFun);

  doEventOn("entity-polygon-add", createPolygonFun);

  doEventOn("entity-properties-update", updateEntityProperties);

  //#endregion ------entity------

  //#region ------primitiveCollection------
  doEventOn("map-add-primitiveCollection", loadPrimitiveCollection);

  //#endregion ------primitiveCollection------

  //#region ------weather------

  //#endregion ------weather------

  //#region ------measure------

  doEventOn("measure-circle", startDrawing);

  //#endregion ------measure------

  //#region ------------------------- 场景截图
  doEventOn("scene-export-image", exportImageFun);
  //#endregion --------------------- 场景截图

  //#region ------------------------- 自定义着色器
  doEventOn("map-add-flickerLine", addFlickerLineFun);
  doEventOn("map-add-circleScan", addCircleScan);
  //#endregion --------------------- 自定义着色器
};

//
doEventOn("map-inited", mapInited);

onUnmounted(() => {
  doEventOff("map-test", mapTest);

  doEventOff("map-add-dataSoure", loadDataSourceByParams);

  doEventOff("entity-polyline-add", creatPolylineFun);
  doEventOff("entity-polygon-add", createPolygonFun);
  doEventOff("entity-properties-update", updateEntityProperties);

  doEventOff("map-add-primitiveCollection", loadPrimitiveCollection);

  doEventOff("measure-circle", startDrawing);

  doEventOff("scene-export-image", exportImage);

  doEventOff("map-add-flickerLine", addFlickerLineFun);
  doEventOff("map-add-circleScan", addCircleScan);

  // doEventOff("map-inited", mapInited);
});
</script>

<style lang="scss" scoped></style>
