import eventMapBus from "@/utils/eventMapBus.js";
import UseDataSource from "@/uses/UseDataSource.js";

const { loadDataSourceByParams } = UseDataSource;
const { doEventSubscribe, doEventSend } = eventMapBus();

doEventSubscribe("map-add-dataSoure", ({ callback = () => {} }) => {
  loadDataSourceByParams({ name: "basicDraw" });
});

const mapTest = (data) => {
    console.log("xhy----mapTest", data);
  };
// 订阅与发送
doEventSubscribe("map-test", mapTest);

