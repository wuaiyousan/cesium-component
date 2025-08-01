<template>
  <!-- 工具栏 -->
  <div class="map-tooltip">
    <!-- 放大 -->
    <el-button type="primary" @click="mapZoomIn()" class="map-tooltip-button">放大</el-button>
    <el-button type="primary" @click="mapZoomOut()" style="margin-left: 0px">缩小</el-button>

    <!-- <el-button>复位</el-button> -->
    <el-button type="primary" @click="mapReset()" style="margin-left: 0px">复位</el-button>

    <el-button type="primary" @click="startDrawing({ mode: 'point' })" style="margin-left: 0px">点</el-button>
    <el-button type="primary" @click="startDrawing({ mode: 'polyline' })" style="margin-left: 0px">线</el-button>
    <el-button type="primary" @click="startDrawing({ mode: 'rectangle' })" style="margin-left: 0px">矩形</el-button>
    <el-button type="primary" @click="startDrawing({ mode: 'polygon' })" style="margin-left: 0px">面</el-button>

    <el-button type="primary" @click="clearDraw()" style="margin-left: 0px">清除</el-button>

    <el-dialog title="新增实体" width="20%" :close-on-click-modal="false" v-model="dialogVisible">
      <el-form label-width="auto" :model="formLabelAlign" style="max-width: 600px">
        <el-form-item label="标注">
          <el-input v-model="formLabelAlign.label" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="formLabelAlign.color" />
        </el-form-item>
        <el-form-item label="尺寸">
          <el-input v-model="formLabelAlign.size" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="padding: 10px; border-top: 1px solid var(--border-color2)">
          <el-button type="primary" @click="submit()"> 确定 </el-button>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue"
import Cesium from "@/utils/cesium.js";
import eventMapBus from "@/utils/eventMapBus.js";
import UseDataSource from "@/uses/UseDataSource.js"
import UseDraw from "@/uses/UseDraw.js"
import { viewConf } from "@/config/scene.config.js"

const { location } = viewConf
const { doEventSubscribe } = eventMapBus()
const { loadDataSourceByParams } = UseDataSource()
const { startDrawing } = UseDraw()

//#region ------------------------- 弹窗
const formLabelAlign = reactive({
  label: "",
  color: "#ff201c",
  size: ""
})

const dialogVisible = ref(false)

function submit() {
  ElMessage.info(`size: ${formLabelAlign.size}`)
  dialogVisible.value = false
}

//#endregion --------------------- 弹窗

//#region ------------------------- 全局方法
doEventSubscribe("map-draw-point", ({ isSet = false, callback = () => {} }) => {
  // 设置入参属性
  if (isSet) {
    dialogVisible.value = true
    startDrawing({ mode: "point", ops: formLabelAlign, callback })
  } else {
    startDrawing({ mode: "point", callback })
  }
})

doEventSubscribe("map-draw-rectangle", ({ callback = () => {} }) => {
  startDrawing({ mode: "rectangle" })
})

doEventSubscribe("map-draw-polygon", ({ callback = () => {} }) => {
  startDrawing({ mode: "polygon" })
})

doEventSubscribe("map-add-dataSoure", ({ callback = () => {} }) => {
  loadDataSourceByParams({ name: "basicDraw" })
})

//#endregion --------------------- 全局方法
function mapZoomIn() {
  const camera = window.earthObj.camera
  const currentHeight = camera.positionCartographic.height
  const targetHeight = currentHeight * 0.7
  camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(
      camera.positionCartographic.longitude,
      camera.positionCartographic.latitude,
      targetHeight
    ),
    duration: 0.5
  })
}

function mapZoomOut() {
  const camera = window.earthObj.camera
  const currentHeight = camera.positionCartographic.height
  const targetHeight = currentHeight * 1.3
  camera.flyTo({
    destination: Cesium.Cartesian3.fromRadians(
      camera.positionCartographic.longitude,
      camera.positionCartographic.latitude,
      targetHeight
    ),
    duration: 0.5
  })
}

// 复位
function mapReset() {
  let toR = Cesium.Math.toRadians
  let theViewer = window.earthObj
  if (theViewer && theViewer.camera) {
    theViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, location.height),
      duration: 0.8
    })
  }
}

onMounted(() => {
  // console.log("window.earthObj._viewer", window.earthObj)
})
</script>

<style lang="scss" scoped>
.map-tooltip {
  position: absolute;
  right: 25px;
  bottom: 20px;
  width: 36px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 60;
}
.map-tooltip-button {
  height: 36px;
}
</style>
