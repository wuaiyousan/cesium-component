/*
 * @Author: xionghaiying
 * @Date: 2025-09-12 11:34:59
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-12 11:35:03
 * @Description: ManagedEntityGroup
 */
class ManagedEntityGroup {
    constructor(viewer, options = {}) {
      this.viewer = viewer;
      this.entities = [];
      this.options = options;
      this.mainEntity = null;
    }
  
    // 添加主实体
    addMainEntity(position, pointOptions = {}) {
      this.mainEntity = this.viewer.entities.add({
        position: position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.YELLOW,
          ...pointOptions
        },
        ...this.options
      });
      return this.mainEntity;
    }
  
    // 添加标签实体
    addLabel(text, offsetX = 0, offsetY = 0, labelOptions = {}) {
      if (!this.mainEntity) {
        throw new Error('请先添加主实体');
      }
  
      const labelEntity = this.viewer.entities.add({
        position: this.mainEntity.position,
        label: {
          text: text,
          pixelOffset: new Cesium.Cartesian2(offsetX, offsetY),
          font: '14pt sans-serif',
          fillColor: Cesium.Color.WHITE,
          ...labelOptions
        }
      });
  
      this.entities.push(labelEntity);
      return labelEntity;
    }
  
    // 添加其他类型的实体
    addEntity(entityDefinition) {
      const entity = this.viewer.entities.add({
        ...entityDefinition,
        position: entityDefinition.position || this.mainEntity.position
      });
      this.entities.push(entity);
      return entity;
    }
  
    // 更新整个组的位置
    updatePosition(position) {
      if (this.mainEntity) {
        this.mainEntity.position = position;
      }
      
      this.entities.forEach(entity => {
        if (entity.position) {
          entity.position = position;
        }
      });
    }
  
    // 显示/隐藏整个组
    setVisible(visible) {
      if (this.mainEntity) {
        this.mainEntity.show = visible;
      }
      
      this.entities.forEach(entity => {
        entity.show = visible;
      });
    }
  
    // 移除所有实体
    removeAll() {
      if (this.mainEntity) {
        this.viewer.entities.remove(this.mainEntity);
      }
      
      this.entities.forEach(entity => {
        this.viewer.entities.remove(entity);
      });
      
      this.entities = [];
      this.mainEntity = null;
    }
  
    // 获取所有实体
    getAllEntities() {
      return this.mainEntity ? [this.mainEntity, ...this.entities] : this.entities;
    }
  }