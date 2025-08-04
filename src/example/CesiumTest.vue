<!--
 * @Author: xionghaiying
 * @Date: 2025-08-04 16:34:56
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-04 17:03:56
 * @Description: 
-->
<template>
  <div class="biz-panel">
    <div class="panel-block">
      <div class="title">选择模块</div>
      <div class="line">
        <span class="line-label">模块标识：</span>
        <el-select class="line-input" size="small" v-model="toModule" placeholder="请选择" clearable>
          <el-option-group v-for="group in modulesList" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-option-group>
        </el-select>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">BaseTest</div>
      <div class="line">
        <el-button  @click="onTest">测试</el-button>
      </div>
    </div>
    <div class="panel-block">
      <div class="title">Draw</div>
      <div class="line">
        <el-button  @click="onDraw()">point</el-button>
        <el-button  @click="onDraw()">polyline</el-button>
        <el-button  @click="onDraw()">polygon</el-button>
        <el-button  @click="onDraw()">rectangle</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {  modulesList } from "./js/cesium-test.data";
import eventMapBus from "@/utils/eventMapBus.js";

const { doEventSubscribe,doEventSend } = eventMapBus();

const toModule = ref()

const onTest = ()=>{
    doEventSend("map-test", { a: 1, b: "2" });
}

//#region ------ 绘制 ------
const onDraw = ()=>{
    doEventSend("map-draw-point", {
        callback:(res)=>{
            console.log('map-draw-point', res);
        }
    });
}

//#endregion ------ 绘制 ------

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