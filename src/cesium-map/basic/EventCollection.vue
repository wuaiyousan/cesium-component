<template></template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import eventMapBus from "@/utils/eventMapBus.js";
import UseDataSource from "@/uses/UseDataSource.js";
import UseEntity from "../uses/UseEntity.js";
import Cesium from "../utils/exportCesium.js";

const { doEventSubscribe, doEventSend, doEventOff } = eventMapBus();
const { loadDataSourceByParams } = UseDataSource();
const { creatPolyline } = UseEntity();

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
  creatPolyline({ id: "001", positions });
};

const mapInited = () => {
  // 订阅与发送
  doEventSubscribe("map-test", mapTest);

  //#region ------DataSource------
  doEventSubscribe("map-add-dataSoure", loadDataSourceByParams);

  //#endregion ------DataSource------

  //#region ------entity------
  doEventSubscribe("entity-polyline-add", creatPolylineFun);

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
