/*
 * @Author: xionghaiying
 * @Date: 2022-07-08 17:06:49
 * @LastEditors: xionghaiying
 * @LastEditTime: 2024-07-10 10:49:12
 * @Description: 图层配置
 */

import mapConfig from "./map.config.js";

// 依据场景和专题的图层配置
const layersObj = {
  "/supply/comprehensive": [
    {
      type: "district",
      list: [
        { id: 'featuresmap_County', checked: true },
        { id: 'featuresmap_Town', checked: false },
      ],
    },
    // {
    //   type: 'dma-partition',
    //   list: [
    //     { id: 'dataservice_fenqu', checked: true },
    //   ]
    // },
    {
      type: 'pipe-network',
      list: [
        { id: 'mapservice_pipeline', checked: true },
        { id: 'mapservice_pipeline_all', checked: false },
      ],
    },
    {
      type: 'stations',
      list: [{ id: 'dataservice_PZ', checked: true }],
    },
    {
      type: 'water-engineering',
      list: [{ id: 'dataservice_shuiyuan', checked: true }],
    },
  ],
  "/supply/DMA": [
    {
      type: "district",
      list: [
        { id: 'featuresmap_County', checked: true },
        // { id: 'mapservice_Town', checked: false },
      ],
    },
    {
      type: 'dma-partition',
      list: [
        { id: 'dataservice_fenqu', checked: true },
      ]
    },
  ],
  "/supply/om-inspection": [
    {
      type: "district",
      list: [
        { id: 'featuresmap_County', checked: true },
      ],
    },
    {
      type: 'xj-engineering',
      list: [{ id: 'dataservice_engineering', checked: true }],
    },
  ],
};

//  通过模块图层路径获取所有图层
function getLayersByPath(path, detailConf = layersObj, typeConf = theObj) {
  let out = [];
  [].concat(detailConf[path] || []).forEach((typeItem) => {
    if (typeItem) {
      let { type, list } = typeItem;
      let toTypeList = typeConf[type];
      let single = null;
      list.forEach((it) => {
        single = toTypeList.find((k) => k.id === it.id);
        if (single) {
          out.push(Object.assign({}, single, it));
        }
      });
    }
  });
  return out;
}

// 依据图层配置属性，获取新的图层
function layerByGroup(fromGroup, fromLayerConf) {
  let { id, visible, configParam } = fromLayerConf;
  return Object.assign(
    {},
    fromGroup.groupList.find((val) => {
      if(val.id === id){
        return val
      }
    }),
    { visible, configParam, groupType: fromGroup.groupType  }
  );
}

// 通过图层组设置checkbox状态
function checkboxByGroup(theGroup) {
  // 默认选中的图层
  let toSelect = theGroup.list
    .filter((val) => val.checked)
    .map((val) => val.id);
  let total = theGroup.list.length;
  let count = toSelect.length;
  return {
    checkAll: total === count,
    checkList: toSelect,
    isIndeterminate: count > 0 && count < total,
  };
}

// 通过moduleId装配图层组
function getlayersByModule(moduleId) {
  let layerGroups = layersObj[moduleId];
  if (!layerGroups) {
    return [];
  }
  let fromLayers = mapConfig.getLayers();
  // 重新装配图层组
  let toList = [];
  for (let i = 0, len = layerGroups.length; i < len; i++) {
    let theGroup = layerGroups[i];
    // 找到当前图层组
    let toGroup = fromLayers.find((val) => val.groupType === theGroup.type);
    toList.push(
      Object.assign(
        {},
        toGroup,
        {
          // 匹配当前模块的图层列表
          groupList: theGroup.list.map((val) => layerByGroup(toGroup, val)),
        },
        checkboxByGroup(theGroup)
      )
    );
  }
  return toList;
}

// 获取所有的图层映射
function getLayersMap(layersConf = layersObj) {
  let out = {};
  Object.keys(layersConf).forEach((it) => {
    out[it] = getLayersByPath(it);
  });
  return out;
}

export const layersByPath = getLayersByPath;

export const layersByModule = getlayersByModule;
