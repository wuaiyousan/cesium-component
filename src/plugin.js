/*
 * @Description:
 * @Author: xionghaiying
 * @Date: 2025-07-29 14:59:13
 * @LastEditors: xionghiaying 
 * @LastEditTime: 2025-11-04 17:00:56
 */
import CesiumMap from "./cesium-map/CesiumMap.vue";
import eventMapBus from "./cesium-map/utils/eventMapBus";
// 导入 Element Plus 组件
import { ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElForm, ElFormItem, ElInput, ElDialog, ElColorPicker } from "element-plus";

const plugin = {
  install(app) {
    // 注册 CesiumMap 组件
    app.component("CesiumMap", CesiumMap);

    // 注册 Element Plus 组件
    app.component("ElButton", ElButton);
    app.component("ElDropdown", ElDropdown);
    app.component("ElDropdownMenu", ElDropdownMenu);
    app.component("ElDropdownItem", ElDropdownItem);
    app.component("ElForm", ElForm);
    app.component("ElFormItem", ElFormItem);
    app.component("ElInput", ElInput);
    app.component("ElDialog", ElDialog);
    app.component("ElColorPicker", ElColorPicker);
  },
};

export default plugin;
export const { doEventOn, doEventSend } = eventMapBus();
