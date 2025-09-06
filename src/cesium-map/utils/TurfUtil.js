/*
 * @Author: xionghaiying
 * @Date: 2025-09-01 17:08:01
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-04 09:58:22
 * @Description:
 */
import * as turf from "@turf/turf";
export default function TurfUtil() {
  // 计算圆
  function getCircleByTurf({ center, radius }) {
    const circle = turf.circle(center, radius);

    return circle;
  }

  // 计算扇面
  function getSectorByTurf({ center, radius, bearingOne, bearingTwo }) {
    // let trufCenter = turf.point(center);
    const sector = turf.sector( center, radius, bearingOne, bearingTwo );

    return sector;
  }

  // 计算多个面的合集
  function getUnionByTurf({ polygons }) {
    const union = turf.union(turf.featureCollection(polygons));

    return union;
  }

  //
  function getDifferenceByTurf({ polygons }) {
    const difference = turf.difference(turf.featureCollection(polygons));

    return difference;
  }

  return {
    getCircleByTurf,
    getSectorByTurf,
    getUnionByTurf,
    getDifferenceByTurf,
  };
}
