<!--
 * @Author: xionghaiying
 * @Date: 2025-08-06 10:57:23
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-02 09:09:22
 * @Description: 
-->
<template></template>

<script setup>
import { onMounted, onUnmounted } from "vue";

import Cesium from "../utils/exportCesium.js";

import eventMapBus from "@/utils/eventMapBus.js";
import UseDataSource from "@/uses/UseDataSource.js";
import UseEntity from "../uses/UseEntity.js";
import TurfUtil from "../utils/TurfUtil.js";

const { doEventSubscribe, doEventSend, doEventOff } = eventMapBus();
const { loadDataSourceByParams } = UseDataSource();
const { createPolyline, createPolygon, updateEntityProperties } = UseEntity();
const { getCircleByTurf, getSectorByTurf, getDifferenceByTurf } = TurfUtil();

// 测试
const mapTest = (data) => {
  console.log("xhy----mapTest", data);
};

const creatPolylineFun = ({ data }) => {
  let positions = [];
  data.forEach((item) => {
    let { longitude, latitude, altitude } = item;
    let xhy = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
    positions.push(xhy);
  });
  createPolyline({ id: "xhy001", positions });
};

const createPolygonFun = ({ center, radius, bearing1, bearing2 }) => {
  let bigSector = getSectorByTurf({ center, radius: radius[0], bearingOne: bearing1, bearingTwo: bearing2 });
  let smallCircle = getCircleByTurf({ center, radius: radius[1] });

  let difference = getDifferenceByTurf({ polygons: [bigSector, smallCircle] });

  console.log("2222", bigSector, smallSector, difference);
  // createPolygon({ id: "xhy002", positions: bigSector.geometry.coordinates[0].flat() });
  // createPolygon({ id: "xhy003", positions: smallCircle.geometry.coordinates[0].flat() });

  createPolygon({ id: "xhy004", positions: difference.geometry.coordinates[0].flat() });
};

const mapInited = () => {
  // 订阅与发送
  doEventSubscribe("map-test", mapTest);

  //#region ------DataSource------
  doEventSubscribe("map-add-dataSoure", loadDataSourceByParams);

  //#endregion ------DataSource------

  //#region ------entity------
  doEventSubscribe("entity-polyline-add", creatPolylineFun);

  doEventSubscribe("entity-polygon-add", createPolygonFun);

  doEventSubscribe("entity-properties-update", updateEntityProperties);

  //#endregion ------entity------

  //#region ------weather------

  //#endregion ------weather------
};

//
doEventSubscribe("map-inited", mapInited);

onUnmounted(() => {
  doEventOff("map-test", mapTest);

  doEventOff("map-add-dataSoure", loadDataSourceByParams);
});
</script>

<style lang="scss" scoped></style>
