import eventMapBus from "@/utils/eventMapBus.js";
import UseDataSource from "@/uses/UseDataSource.js";


const { loadDataSourceByParams } = UseDataSource;
const { doEventSubscribe, doEventSend } = eventMapBus();

doEventSubscribe("map-add-dataSoure", ({ callback = () => {} }) => {
  loadDataSourceByParams({ name: "basicDraw" });
});

// 测试
const mapTest = (data) => {
  console.log("xhy----mapTest", data);
};
// 订阅与发送
doEventSubscribe("map-test", mapTest);

//#region ------weather------

doEventSubscribe("map-add-fog", () => {
  const instance = new FogEffect(viewer, {
    visibility: 0.2,
    color: new Color(0.8, 0.8, 0.8, 0.3),
  });
  instance.show(true);
});

//#endregion ------weather------
