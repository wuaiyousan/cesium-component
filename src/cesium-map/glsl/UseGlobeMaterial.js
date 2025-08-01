/*
 * @Author: xionghaiying
 * @Date: 2022-09-20 11:00:00
 * @LastEditors: xionghaiying
 * @LastEditTime: 2022-09-30 14:16:40
 * @Description: 全局材质 - 如地形、坡度、坡向、等高线
 */

export default function UseGlobeMaterial() {
  let viewer = null

  let minHeight = -414.0 // approximate dead sea elevation
  let maxHeight = 8777.0 // approximate everest elevation
  let contourColor = Cesium.Color.RED.clone()
  let contourUniforms = {}
  let shadingUniforms = {}

  // The viewModel tracks the state of our mini application.
  let viewModel = {
    enableContour: false,
    contourSpacing: 150.0,
    contourWidth: 2.0,
    selectedShading: 'elevation',
  }

  function notEmpty(val) {
    return val !== undefined && val !== null && val !== '' ? true : false
  }

  function updateMaterial() {
    if (!viewer) {
      return
    }
    const hasContour = viewModel.enableContour
    const selectedShading = viewModel.selectedShading
    let material = undefined
    if (hasContour) {
      if (selectedShading === 'elevation') {
        material = getElevationContourMaterial()
        shadingUniforms = material.materials.elevationRampMaterial.uniforms
        shadingUniforms.minimumHeight = minHeight
        shadingUniforms.maximumHeight = maxHeight
        contourUniforms = material.materials.contourMaterial.uniforms
      } else if (selectedShading === 'slope') {
        material = getSlopeContourMaterial()
        shadingUniforms = material.materials.slopeRampMaterial.uniforms
        contourUniforms = material.materials.contourMaterial.uniforms
      } else if (selectedShading === 'aspect') {
        material = getAspectContourMaterial()
        shadingUniforms = material.materials.aspectRampMaterial.uniforms
        contourUniforms = material.materials.contourMaterial.uniforms
      } else {
        material = Cesium.Material.fromType('ElevationContour')
        contourUniforms = material.uniforms
      }
      contourUniforms.width = viewModel.contourWidth
      contourUniforms.spacing = viewModel.contourSpacing
      contourUniforms.color = contourColor
    } else if (selectedShading === 'elevation') {
      material = Cesium.Material.fromType('ElevationRamp')
      shadingUniforms = material.uniforms
      shadingUniforms.minimumHeight = minHeight
      shadingUniforms.maximumHeight = maxHeight
    } else if (selectedShading === 'slope') {
      material = Cesium.Material.fromType('SlopeRamp')
      shadingUniforms = material.uniforms
    } else if (selectedShading === 'aspect') {
      material = Cesium.Material.fromType('AspectRamp')
      shadingUniforms = material.uniforms
    }
    if (selectedShading !== 'none') {
      shadingUniforms.image = getColorRamp(selectedShading)
    }

    // 修改
    const globe = viewer.scene.globe
    if (globe && material) {
      globe.material = material
    }
  }

  // -----------------------------------------有等高线材质-----------------------------------------  //

  // Creates a composite material with both elevation shading and contour lines
  function getElevationContourMaterial() {
    return new Cesium.Material({
      fabric: {
        type: 'ElevationColorContour',
        materials: {
          contourMaterial: {
            type: 'ElevationContour',
          },
          elevationRampMaterial: {
            type: 'ElevationRamp',
          },
        },
        components: {
          diffuse:
            'contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse',
          alpha: 'max(contourMaterial.alpha, elevationRampMaterial.alpha)',
        },
      },
      translucent: false,
    })
  }

  // Creates a composite material with both slope shading and contour lines
  function getSlopeContourMaterial() {
    return new Cesium.Material({
      fabric: {
        type: 'SlopeColorContour',
        materials: {
          contourMaterial: {
            type: 'ElevationContour',
          },
          slopeRampMaterial: {
            type: 'SlopeRamp',
          },
        },
        components: {
          diffuse:
            'contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse',
          alpha: 'max(contourMaterial.alpha, slopeRampMaterial.alpha)',
        },
      },
      translucent: false,
    })
  }

  // Creates a composite material with both aspect shading and contour lines
  function getAspectContourMaterial() {
    return new Cesium.Material({
      fabric: {
        type: 'AspectColorContour',
        materials: {
          contourMaterial: {
            type: 'ElevationContour',
          },
          aspectRampMaterial: {
            type: 'AspectRamp',
          },
        },
        components: {
          diffuse:
            'contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse',
          alpha: 'max(contourMaterial.alpha, aspectRampMaterial.alpha)',
        },
      },
      translucent: false,
    })
  }

  // -----------------------------------------色带设置-----------------------------------------  //

  const elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0]
  const slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0]
  const aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0]
  function getColorRamp(selectedShading) {
    const ramp = document.createElement('canvas')
    ramp.width = 100
    ramp.height = 1
    const ctx = ramp.getContext('2d')

    let values
    if (selectedShading === 'elevation') {
      values = elevationRamp
    } else if (selectedShading === 'slope') {
      values = slopeRamp
    } else if (selectedShading === 'aspect') {
      values = aspectRamp
    }

    const grd = ctx.createLinearGradient(0, 0, 100, 0)
    grd.addColorStop(values[0], 'rgba(0,0,0,0.1)') //black
    grd.addColorStop(values[1], '#2747E0') //blue
    grd.addColorStop(values[2], '#00A04F') //green
    grd.addColorStop(values[3], '#D33038') //red
    grd.addColorStop(values[4], '#FF9742') //orange
    grd.addColorStop(values[5], '#ffd700') //yellow
    grd.addColorStop(values[6], '#ffffff') //white

    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 100, 1)

    return ramp
  }

  // -----------------------------------------对外交互-----------------------------------------  //
  // 设置地形高程极值区间
  function changeElevationExtremum(min, max) {
    if (notEmpty(min) && notEmpty(max)) {
      minHeight = min
      maxHeight = max
      // 更新
      updateMaterial()
    }
  }

  // 修改材质类型
  function changeMaterialType(toType) {
    let validTypes = ['elevation', 'slope', 'aspect']
    if (validTypes.includes(toType) && viewModel.selectedShading !== toType) {
      viewModel.selectedShading = toType
      updateMaterial()
    }
  }

  // 切换显/隐等高线
  function toggleContour(visible) {
    if (notEmpty(visible) && viewModel.enableContour !== visible) {
      viewModel.enableContour = visible
      updateMaterial()
    }
  }

  // 修改等高线宽
  function changeContourWidth(val) {
    if (notEmpty(val)) {
      let toVal = Number.parseFloat(val)
      if (viewModel.contourWidth !== toVal) {
        viewModel.contourWidth = toVal
        contourUniforms.width = toVal
      }
    }
  }

  // 修改等高线间距
  function changeContourSpacing(val) {
    if (notEmpty(val)) {
      let toVal = Number.parseFloat(val)
      if (viewModel.contourSpacing !== toVal) {
        viewModel.contourSpacing = toVal
        contourUniforms.spacing = toVal
      }
    }
  }

  // 修改等高线颜色
  function changeContourColor(toColor) {
    if (notEmpty(toColor)) {
      contourUniforms.color = toColor
    } else {
      contourUniforms.color = Cesium.Color.fromRandom(
        { alpha: 1.0 },
        contourColor
      )
    }
  }

  // 移除全局材质
  function removeGlobeMaterial() {
    if (!viewer) {
      return
    }
    const globe = viewer.scene.globe
    if (globe) {
      globe.material = undefined
      resetAll()
    }
  }

  function resetAll() {
    viewer = null
    minHeight = -414.0 // approximate dead sea elevation
    maxHeight = 8777.0 // approximate everest elevation
    contourColor = Cesium.Color.RED.clone()
    contourUniforms = {}
    shadingUniforms = {}

    // The viewModel tracks the state of our mini application.
    viewModel = {
      enableContour: false,
      contourSpacing: 150.0,
      contourWidth: 2.0,
      selectedShading: 'elevation',
    }
  }

  // 设置关联的场景对象
  function setViewer(obj) {
    viewer = obj
  }

  // 返回
  return {
    setViewer,
    changeElevationExtremum,
    changeMaterialType,
    toggleContour,
    changeContourWidth,
    changeContourSpacing,
    changeContourColor,
    removeGlobeMaterial,
  }
}
