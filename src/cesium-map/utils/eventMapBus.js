/*
 * @Author: xionghaiying
 * @Date: 2025-07-31 09:17:49
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-08-22 09:23:57
 * @Description:
 */
import mitt from "mitt";
// 创建 mitt 实例
const emitter = mitt();
export default function eventMapBus() {
  // 全局总线消息上 - 订阅与发送
  function doEventSubscribe(eventName, eventHandler) {
    if (emitter) {
      emitter.on(eventName, eventHandler);
    } else {
      console.error("[doEventSubscribe]:global target emitter is empty!");
    }
    // onUnmounted(() => {
    //   if (emitter) {
    //     emitter.off(eventName, eventHandler);
    //   }
    // });
  }

  function doEventSend(eventName, eventInfo) {
    if (emitter) {
      emitter.emit(eventName, eventInfo);
    } else {
      console.error("[doEventSend]:global target emitter is empty!");
    }
  }

  function doEventOff (eventName, eventHandler) {
    if (emitter) {
      emitter.off(eventName, eventHandler);
    }else {
      console.error("[doEventSubscribe]:global target emitter is empty!");
    }
  }

  return {
    // 全局总线消息处理
    doEventSubscribe,
    doEventSend,
    doEventOff
  };
}
