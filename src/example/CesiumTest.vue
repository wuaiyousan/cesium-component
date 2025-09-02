<!--
 * @Author: xionghaiying
 * @Date: 2025-08-04 16:34:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-01 17:47:18
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import { modulesList } from "./js/cesium-test.data";
import eventMapBus from "@/utils/eventMapBus.js";

import xhytest from "./assets/json/xhy001.json";

const { doEventSubscribe, doEventSend } = eventMapBus();

const toModule = ref();

function applyUpdates(originalData, updateData) {
  // 遍历并更新
  return originalData.map((forceOrig) => {
    const forceIdOrig = forceOrig.ForceID;
    const sensorsOrig = forceOrig.Sensors;

    // 找到对应的更新条目
    const forceUpdate = updateData.find((f) => f.ForceID === forceIdOrig);
    if (!forceUpdate) return forceOrig; // 没有更新数据则原样返回

    const sensorsUpdate = forceUpdate.Sensors;

    // 对每个原始传感器，查找是否有更新，并使用 {...旧, ...新} 的方式更新字段
    const updatedSensors = sensorsOrig.map((sensorOrig) => {
      const assembleIdOrig = sensorOrig.AssembleID;
      const updateForThisSensor = sensorsUpdate.find((s) => s.AssembleID === assembleIdOrig);

      if (!updateForThisSensor) {
        return sensorOrig; // 没有更新项，保持原样
      }

      // ✅ 关键：使用对象展开语法，保留原字段，仅覆盖更新的字段
      return {
        ...sensorOrig, // 保留原始所有字段
        ...updateForThisSensor, // 用更新数据中的字段覆盖（如 WorkState, SimState...）
      };
    });

    // 返回更新后的 Force 条目
    return {
      ...forceOrig,
      Sensors: updatedSensors,
    };
  });
}

const xhyTest = () => {
  // 原始数据
  const originalData = [
    {
      ForceID: 32000052,
      Sensors: [
        {
          AssembleID: 2500000133,
          AssembleName: "BZK－007无人侦察机合成孔径雷达（SAR/GMTI）侦察系统",
          ComponentID: 1200000060,
          WorkID: 2441000064,
          WorkState: 0,
          SimState: 0,
          Waveband: 7,
          Roll: 0.0,
          Course: 0.0,
          SweepAngle: 90.0,
          RangeToAir: 0.0,
          RangeToSurface: 20.0,
          RangeToSubsurface: 0.0,
          RangeToGround: 10.0,
        },
        {
          AssembleID: 2500000134,
          AssembleName: "BZK－007无人侦察机光电侦察设备",
          ComponentID: 1205000028,
          WorkID: 2440000193,
          WorkState: 0,
          SimState: 0,
          Waveband: 24,
          Roll: 0.0,
          Course: 0.0,
          SweepAngle: 60.0,
          RangeToAir: 0.0,
          RangeToSurface: 55.0,
          RangeToSubsurface: 0.0,
          RangeToGround: 15.0,
        },
      ],
    },
  ];

  // 变化数据（只包含要更新的字段）
  const updateData = [
    {
      ForceID: 32000052,
      Sensors: [
        {
          AssembleID: 2500000133,
          WorkState: 1,
          SimState: 1,
        },
        {
          AssembleID: 2500000134,
          WorkState: 1,
          SimState: 1,
          RangeToSurface: 5.0,
          RangeToGround: 5.0,
        },
      ],
    },
  ];

  let updatedData = applyUpdates(originalData, updateData);

  // 打印结果（美化格式，方便查看）
  console.log(JSON.stringify(updatedData, null, 2));
};

const onTest = () => {
  doEventSend("map-test", { a: 1, b: "2" });
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
  let data = [
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
  doEventSend("entity-polyline-add", { data });
};

const updateEntityProperties = () => {
  let data = {
    type: 2,
  };
  doEventSend("entity-properties-update", { id: "xhy001", sourceName: "basicDraw", changeObj: data });
};

const addEntityPolygon = () => {
  let center = [112.96, 28.24];
  let radius = [50, 5];
  let bearing1 = 25;
  let bearing2 = 45;

  doEventSend("entity-polygon-add", { center, radius, bearing1, bearing2 });
};

//#endregion ------ entity ------

//#region ------ EntityEventListener -------
const addEntityEventListener = () => {
  doEventSend("entity-EventListener-add", { data });
};

//#endregion ------ EntityEventListener -------
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
</style>
