<!--
 * @Author: xionghaiying
 * @Date: 2025-08-04 16:34:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-25 16:13:44
 * @Description: 
-->
<template>
  <div class="biz-panel">
    <div class="panel-block">
      <div class="title">选择模块</div>
      <div class="line">
        <span class="line-label">ModuleID：</span>
        <el-select class="line-input" v-model="toModule" placeholder="请选择" clearable>
          <el-option-group v-for="group in modulesList" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-option-group>
        </el-select>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">BaseTest</div>
      <div class="line">
        <el-button @click="onTest">测试</el-button>
        <el-button @click="xhyTest">数据结构测试</el-button>
        <el-button @click="getSenceImage">保存视窗图片</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">Draw</div>
      <div class="line">
        <el-button @click="onDraw('point')">point</el-button>
        <el-button @click="onDraw('polyline')">polyline</el-button>
        <el-button @click="onDraw('polygon')">polygon</el-button>
        <el-button @click="onDraw('rectangle')">rectangle</el-button>
      </div>
      <div class="line">
        <el-button @click="onDrawClear()">clearDraw</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">Measure</div>
      <div class="line">
        <el-button @click="onMeasureCircle()">圆</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">weather</div>
      <div class="line">
        <el-button @click="onRain">雨</el-button>
        <el-button @click="onSnow">雪</el-button>
        <el-button @click="onFog">雾</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">entity</div>
      <div class="line">
        <el-button @click="addEntityPolyline">添加polyline</el-button>
        <el-button @click="updateEntityProperties">修改properties属性</el-button>
        <el-button @click="addEntityPolygon">添加polygon</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">entity - EventListener</div>
      <div class="line">
        <el-button @click="addEntityEventListener">addEventListener</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">primitiveCollection</div>
      <div class="line">
        <el-button @click="addPrimitiveCollection">addPrimitiveCollection</el-button>
      </div>
    </div>
    <!-- 隐藏的下载链接 -->
    <a id="download-link" download></a>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { modulesList } from "./js/cesium-test.data";
import eventMapBus from "@/utils/eventMapBus.js";

import xhytest from "./assets/json/xhy001.json";

const { doEventOn, doEventSend } = eventMapBus();

const toModule = ref();

const xhyTest = () => {};


const onTest = (datalist) => {
  // doEventSend("map-test", { a: 1, b: "2" });
};

const getSenceImage = () => {
  doEventSend("scene-export-image", {
    imageType: "png",
    callback: (res) => {
      if (res.success) {
        console.log("22222", res.data);
        // 创建下载链接
        const link = document.getElementById("download-link");
        link.href = res.data;
        link.download = "map.png";

        // 触发下载
        link.click();
      }
    },
  });
};

//#region ------ 绘制 ------
const onDraw = (type) => {
  switch (type) {
    case "point":
      doEventSend("map-draw-point", {
        callback: (res) => {
          console.log("map-draw-point", res);
        },
      });
      break;
    case "polyline":
      doEventSend("map-draw-polyline", {
        callback: (res) => {
          console.log("map-draw-polyline", res);
        },
      });
      break;
    case "polygon":
      doEventSend("map-draw-polygon", {
        callback: (res) => {
          console.log("map-draw-polygon", res);
        },
      });
      break;
    case "rectangle":
      doEventSend("map-draw-rectangle", {
        callback: (res) => {
          console.log("map-draw-rectangle", res);
        },
      });
      break;

    default:
      break;
  }
};

const onDrawClear = () => {
  doEventSend("map-draw-clear");
};
//#endregion ------ 绘制 ------

//#region ------ 效果 ------
const onRain = () => {
  doEventSend("map-add-rain");
};

const onSnow = () => {
  doEventSend("map-add-snow");
};

const onFog = () => {
  doEventSend("map-add-fog");
};

//#endregion ------ 效果 ------

//#region ------ entity ------
const addEntityPolyline = () => {
  let points = [
    {
      longitude: 112.97,
      latitude: 28.24,
      altitude: 0,
    },
    {
      longitude: 112.95,
      latitude: 28.2,
      altitude: 0,
    },
    {
      longitude: 112.93,
      latitude: 28.2,
      altitude: 0,
    },
  ];
  let data = {
    id: "xhy001",
    points,
  };
  doEventSend("entity-polyline-add", { data });
};

const updateEntityProperties = () => {
  let data = {
    type: 2,
  };
  doEventSend("entity-properties-update", { id: "xhy001", sourceName: "basic_drawing", changeObj: data });
};

const addEntityPolygon = () => {
  let center = [112.95, 28.23];
  let radius = [10, 5];
  let bearing1 = -10;
  let bearing2 = 100;

  doEventSend("entity-polygon-add", { center, radius, bearing1, bearing2 });
};

//#endregion ------ entity ------

//#region ------ EntityEventListener -------
const addEntityEventListener = () => {
  doEventSend("entity-EventListener-add", { data });
};

//#endregion ------ EntityEventListener -------

//#region ------ primitiveCollection -------
const addPrimitiveCollection = () => {
  let data = {
    id: "test-PrimitiveCollection",
    properties: {
      a: 1,
      b: "xhy001",
    },
  };
  doEventSend("map-add-primitiveCollection", data);
};
//#endregion ------ primitiveCollection -------

const onMeasureCircle = () =>{
  doEventSend("measure-circle");
}
</script>

<style lang="scss" scoped>
.biz-panel {
  position: absolute;
  top: 10px;
  left: 2px;
  width: 400px;
  z-index: 1000;
  background: #fff;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;

  .panel-block {
    font-size: 12px;

    .title {
      height: 24px;
      line-height: 24px;
      padding-left: 8px;
      margin-bottom: 8px;
      background: #7f9dc3;
      color: #fff;
    }

    .line {
      margin-bottom: 8px;
    }

    .line-label {
      margin-left: 12px;
    }

    .line-input {
      width: 240px;

      &.sm {
        width: 80px;
      }
    }
    .line-btn {
      margin-left: 12px;
    }
  }
}
#download-link {
  display: none;
}
</style>
