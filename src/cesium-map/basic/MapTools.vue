<template>
  <!-- 工具栏 -->
  <div class="map-tooltip">
    <!-- 放大缩小复位 -->
    <el-button @click="mapZoomIn()" class="map-tooltip-button zoom-in"></el-button>
    <el-button @click="mapZoomOut()" style="margin-left: 0px" class="map-tooltip-button zoom-out"></el-button>
    <el-button @click="mapReset()" style="margin-left: 0px" class="map-tooltip-button reposition"></el-button>

    <!-- 基础绘制、清除 -->
    <el-dropdown placement="left" popper-class="custom-dropdown">
      <el-button class="map-tooltip-button map-tools"> </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-button @click="startDrawing({ mode: 'point' })" class="plot-point"></el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button @click="startDrawing({ mode: 'polyline' })" class="plot-line"></el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button @click="startDrawing({ mode: 'polygon' })" class="plot-polygon"></el-button>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-button @click="startDrawing({ mode: 'rectangle' })" class="plot-rectangle"></el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button @click="clearDraw()" style="margin-left: 0px" class="map-tooltip-button draw-clear"></el-button>

    <!-- 雨雪雾 -->
    <el-button @click="showRain()" style="margin-left: 0px" class="map-tooltip-button weather-rain"></el-button>
    <el-button @click="showSnow()" style="margin-left: 0px" class="map-tooltip-button weather-snow"></el-button>
    <el-button @click="showFog()" style="margin-left: 0px" class="map-tooltip-button weather-fog"></el-button>

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
import { onMounted, reactive, ref, onUnmounted } from "vue";
import eventMapBus from "@/utils/eventMapBus.js";
import UseDraw from "@/uses/UseDraw.js";
import UseTools from "@/uses/UseTools.js";
import RainEffect from "@/utils/Weather/rain.js";
import SnowEffect from "@/utils/Weather/snow.js";
import FogEffect from "@/utils/Weather/fog.js";

const { doEventOn } = eventMapBus();
const { startDrawing, clearDraw } = UseDraw();
const { mapZoomIn, mapZoomOut, mapReset } = UseTools();

//#region ------------------------- 弹窗
const formLabelAlign = reactive({
  label: "",
  color: "#ff201c",
  size: "",
});

const dialogVisible = ref(false);

function submit() {
  ElMessage.info(`size: ${formLabelAlign.size}`);
  dialogVisible.value = false;
}

//#endregion --------------------- 弹窗

//#region ------------------------- 雨雪雾
let rainInstance = null;
const showRain = () => {
  rainInstance ??= new RainEffect(window.earthObj, {
    tiltAngle: -0.2,
    rainSize: 1.0,
    rainSpeed: 120.0,
  });

  rainInstance?.show(true);
  snowInstance?.show(false);
  fogInstance?.show(false);
};

let snowInstance = null;
const showSnow = () => {
  snowInstance ??= new SnowEffect(window.earthObj, {
    snowSize: 0.02, // 雪花大小
    snowSpeed: 60.0, // 雪速
  });

  snowInstance?.show(true);
  rainInstance?.show(false);
  fogInstance?.show(false);
};

let fogInstance = null;
const showFog = () => {
  fogInstance ??= new FogEffect(window.earthObj, {
    visibility: 0.2, // 能见度
    color: "rgba(204, 204, 204, 0.3)", //雾气颜色
  });
  fogInstance?.show(true);
  snowInstance?.show(false);
  rainInstance?.show(false);
};
//#endregion --------------------- 雨雪雾

//#region ------------------------- 全局方法
doEventOn("map-draw-point", ({ isSet = false, callback = () => {} }) => {
  // 设置入参属性
  if (isSet) {
    dialogVisible.value = true;
    startDrawing({ mode: "point", ops: formLabelAlign, callback });
  } else {
    startDrawing({ mode: "point", callback });
  }
});

doEventOn("map-draw-polyline", ({ callback = () => {} }) => {
  startDrawing({ mode: "polyline" });
});

doEventOn("map-draw-polygon", ({ callback = () => {} }) => {
  startDrawing({ mode: "polygon" });
});

doEventOn("map-draw-rectangle", ({ callback = () => {} }) => {
  startDrawing({ mode: "rectangle" });
});

doEventOn("map-draw-clear", () => {
  clearDraw();
});

doEventOn("map-add-rain", () => {
  showRain();
});

doEventOn("map-add-snow", () => {
  showSnow();
});

doEventOn("map-add-fog", () => {
  showFog();
});

//#endregion --------------------- 全局方法

onMounted(() => {
  // console.log("window.earthObj._viewer", window.earthObj);
});
onUnmounted(() => {
  // instance.destroy();
});
</script>

<style lang="scss" scoped>
.map-tooltip {
  position: absolute;
  right: 25px;
  bottom: 30px;
  width: 36px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 60;
  .map-tooltip-button {
    height: 36px;
    width: 36px;
    border: 0px;
  }
  .zoom-in {
    background: #f0f0f0 url("../assets/controls/zoom-in.svg") no-repeat center;
    background-size: 60%;
  }
  .zoom-out {
    background: #f0f0f0 url("../assets/controls/zoom-out.svg") no-repeat center;
    background-size: 60%;
  }
  .reposition {
    background: #f0f0f0 url("../assets/controls/reposition.svg") no-repeat center;
    background-size: 60%;
  }
  .map-tools {
    background: #f0f0f0 url("../assets/controls/map-tools.svg") no-repeat center;
    background-size: 60%;
  }
  .draw-clear {
    background: #f0f0f0 url("../assets/controls/draw-clear.svg") no-repeat center;
    background-size: 60%;
  }

  .weather-rain {
    background: #f0f0f0 url("../assets/controls/weather-rain.svg") no-repeat center;
    background-size: 60%;
  }
  .weather-snow {
    background: #f0f0f0 url("../assets/controls/weather-snow.svg") no-repeat center;
    background-size: 60%;
  }
  .weather-fog {
    background: #f0f0f0 url("../assets/controls/weather-fog.svg") no-repeat center;
    background-size: 60%;
  }
}

:deep(.el-dropdown-menu__item) {
  padding: 0px;
}

:deep(.plot-point) {
  background: url("../assets/controls/plot-point.svg") no-repeat center;
  background-size: 60%;
  width: 36px;
  height: 36px;
  border: 0px;
}

:deep(.plot-line) {
  background: url("../assets/controls/plot-line.svg") no-repeat center;
  background-size: 60%;
  width: 36px;
  height: 36px;
  border: 0px;
}

:deep(.plot-polygon) {
  background: url("../assets/controls/plot-polygon.svg") no-repeat center;
  background-size: 60%;
  width: 36px;
  height: 36px;
  border: 0px;
}

:deep(.plot-rectangle) {
  background: url("../assets/controls/plot-rectangle.svg") no-repeat center;
  background-size: 60%;
  width: 36px;
  height: 36px;
  border: 0px;
}
</style>
