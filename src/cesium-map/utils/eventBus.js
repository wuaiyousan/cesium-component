import mitt from "mitt";

export default function eventBus() {
  // 创建 mitt 实例
  const emitter = mitt();

  // 全局总线消息上 - 订阅与发送
  function doEventSubscribe(eventName, eventHandler) {
    if (emitter) {
      emitter.on(eventName, eventHandler);
    } else {
      console.error("[doEventSubscribe]:global target emitter is empty!");
    }
    onUnmounted(() => {
      if (emitter) {
        emitter.off(eventName, eventHandler);
      }
    });
  }

  function doEventSend(eventName, eventInfo) {
    if (emitter) {
      emitter.emit(eventName, eventInfo);
    } else {
      console.error("[doEventSend]:global target emitter is empty!");
    }
  }

  return {
    // 全局总线消息处理
    doEventSubscribe,
    doEventSend,
  };
}
