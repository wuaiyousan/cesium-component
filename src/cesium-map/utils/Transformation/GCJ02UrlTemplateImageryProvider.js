/*
 * GCJ02UrlTemplateImageryProvider
 *  - 将 Cesium 的 tile 请求（WGS84/WebMercator）映射到 GCJ02 对应的 tile x/y
 *  - 简单实现，返回 Image 元素的 Promise，可直接作为 imagery provider 使用
 */
import Cesium from "../exportCesium.js";

const a = 6378245.0;
const ee = 0.00669342162296594323;

function outOfChina(lon, lat) {
  return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLon(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
}

function wgs84ToGcj02(lon, lat) {
  if (outOfChina(lon, lat)) {
    return [lon, lat];
  }
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLon = (dLon * 180.0) / ((a / sqrtMagic * Math.cos(radLat)) * Math.PI);
  const mgLat = lat + dLat;
  const mgLon = lon + dLon;
  return [mgLon, mgLat];
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export default function GCJ02UrlTemplateImageryProvider(options) {
  options = options || {};
  this._url = options.url || "";
  this.tilingScheme = options.tilingScheme || new Cesium.WebMercatorTilingScheme();
  this.tileWidth = options.tileWidth || 256;
  this.tileHeight = options.tileHeight || 256;
  this.maximumLevel = typeof options.maximumLevel === "number" ? options.maximumLevel : 18;
  this.minimumLevel = typeof options.minimumLevel === "number" ? options.minimumLevel : 0;
  this.rectangle = options.rectangle || this.tilingScheme.rectangle;
  this.credit = options.credit || undefined;
  this.hasAlphaChannel = true;
  this.readyPromise = Promise.resolve(true);
}

GCJ02UrlTemplateImageryProvider.prototype.requestImage = function (x, y, level) {
  const TILE_SIZE = this.tileWidth || 256;
  const z = level;
  const n = Math.pow(2, z);

  // 计算目标 tile 对应的地理矩形（WGS84）
  const rect = this.tilingScheme.tileXYToRectangle(x, y, level);
  const west = Cesium.Math.toDegrees(rect.west);
  const east = Cesium.Math.toDegrees(rect.east);
  const south = Cesium.Math.toDegrees(rect.south);
  const north = Cesium.Math.toDegrees(rect.north);

  // 辅助：WGS84 lon/lat -> WebMercator tile fractional coordinates (x_f, y_f)
  function lonLatToTileFrac(lon, lat, z) {
    const n = Math.pow(2, z);
    const x_f = ((lon + 180) / 360) * n;
    const latRad = (lat * Math.PI) / 180;
    const y_f = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    return [x_f, y_f];
  }

  // 把目标 tile 的四角（以及边界少量内侧点）映射到 GCJ02，计算需要的源 tiles 范围
  const samplePoints = [];
  const GRID = 4; // 用 4x4 网格估算范围
  for (let i = 0; i <= GRID; i++) {
    for (let j = 0; j <= GRID; j++) {
      const u = i / GRID;
      const v = j / GRID;
      const lon = west + u * (east - west);
      const lat = south + (1 - v) * (north - south);
      const [gcjLon, gcjLat] = wgs84ToGcj02(lon, lat);
      const [tx, ty] = lonLatToTileFrac(gcjLon, gcjLat, z);
      samplePoints.push([tx, ty]);
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  samplePoints.forEach(([tx, ty]) => {
    minX = Math.min(minX, Math.floor(tx));
    maxX = Math.max(maxX, Math.floor(tx));
    minY = Math.min(minY, Math.floor(ty));
    maxY = Math.max(maxY, Math.floor(ty));
  });

  // 限制范围
  minX = Math.max(0, Math.floor(minX));
  minY = Math.max(0, Math.floor(minY));
  maxX = Math.min(n - 1, Math.floor(maxX));
  maxY = Math.min(n - 1, Math.floor(maxY));

  // 缓存机制
  this._tileCache = this._tileCache || {};
  const needed = [];
  for (let sx = minX; sx <= maxX; sx++) {
    for (let sy = minY; sy <= maxY; sy++) {
      needed.push([sx, sy, z]);
    }
  }

  const fetchTile = (sx, sy, sz) => {
    const key = `${sz}_${sx}_${sy}`;
    if (this._tileCache[key]) return Promise.resolve(this._tileCache[key]);
    let url = this._url;
    url = url.replace(/{s}/g, "");
    url = url.replace(/{x}/g, sx);
    url = url.replace(/{y}/g, sy);
    url = url.replace(/{z}/g, sz);
    return loadImage(url).then((img) => {
      // 把图绘到 canvas 取像素数据
      try {
        const c = document.createElement('canvas');
        c.width = TILE_SIZE;
        c.height = TILE_SIZE;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
        const tileObj = { img, canvas: c, imgData };
        this._tileCache[key] = tileObj;
        return tileObj;
      } catch (e) {
        // CORS 受限时，仍保存 Image，尽量返回
        const tileObj = { img, canvas: null, imgData: null };
        this._tileCache[key] = tileObj;
        return tileObj;
      }
    });
  };

  const fetchAll = Promise.all(needed.map(([sx, sy, sz]) => fetchTile(sx, sy, sz)));

  return fetchAll.then(() => {
    // 创建目标 canvas
    const dest = document.createElement('canvas');
    dest.width = TILE_SIZE;
    dest.height = TILE_SIZE;
    const dctx = dest.getContext('2d');
    const destBuffer = dctx.createImageData(TILE_SIZE, TILE_SIZE);

    // 对 dest 每个像素，反算到 WGS84 -> GCJ02 -> 源 tile 固定点，再采样（最近邻）
    for (let py = 0; py < TILE_SIZE; py++) {
      for (let px = 0; px < TILE_SIZE; px++) {
        const u = px / TILE_SIZE;
        const v = py / TILE_SIZE;
        const lon = west + u * (east - west);
        const lat = south + (1 - v) * (north - south);
        const [gcjLon, gcjLat] = wgs84ToGcj02(lon, lat);
        const [tx, ty] = lonLatToTileFrac(gcjLon, gcjLat, z);
        let sx = Math.floor(tx);
        let sy = Math.floor(ty);
        const fracX = tx - sx;
        const fracY = ty - sy;
        sx = ((sx % n) + n) % n;
        if (sy < 0 || sy >= n) {
          // 超出范围，留空
          continue;
        }
        const key = `${z}_${sx}_${sy}`;
        const tileObj = this._tileCache[key];
        if (!tileObj) continue;
        if (tileObj.imgData) {
          const srcX = Math.floor(fracX * TILE_SIZE);
          const srcY = Math.floor(fracY * TILE_SIZE);
          const srcIdx = (srcY * TILE_SIZE + srcX) * 4;
          const sdata = tileObj.imgData.data;
          const di = (py * TILE_SIZE + px) * 4;
          destBuffer.data[di] = sdata[srcIdx];
          destBuffer.data[di + 1] = sdata[srcIdx + 1];
          destBuffer.data[di + 2] = sdata[srcIdx + 2];
          destBuffer.data[di + 3] = sdata[srcIdx + 3];
        } else if (tileObj.img) {
          // fallback: draw whole tile and sample via temporary canvas
          try {
            const tmp = document.createElement('canvas');
            tmp.width = TILE_SIZE;
            tmp.height = TILE_SIZE;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(tileObj.img, 0, 0);
            const id = tctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE).data;
            const srcX = Math.floor(fracX * TILE_SIZE);
            const srcY = Math.floor(fracY * TILE_SIZE);
            const srcIdx = (srcY * TILE_SIZE + srcX) * 4;
            const di = (py * TILE_SIZE + px) * 4;
            destBuffer.data[di] = id[srcIdx];
            destBuffer.data[di + 1] = id[srcIdx + 1];
            destBuffer.data[di + 2] = id[srcIdx + 2];
            destBuffer.data[di + 3] = id[srcIdx + 3];
          } catch (e) {
            continue;
          }
        }
      }
    }

    dctx.putImageData(destBuffer, 0, 0);
    return dest;
  }).catch((e) => {
    // 如果任意加载失败，退回到单点映射（兼容旧逻辑）
    const rect = this.tilingScheme.tileXYToRectangle(x, y, level);
    const west = Cesium.Math.toDegrees(rect.west);
    const east = Cesium.Math.toDegrees(rect.east);
    const south = Cesium.Math.toDegrees(rect.south);
    const north = Cesium.Math.toDegrees(rect.north);
    const lon = (west + east) / 2.0;
    const lat = (south + north) / 2.0;
    const [gcjLon, gcjLat] = wgs84ToGcj02(lon, lat);
    const tx = ((gcjLon + 180) / 360) * n;
    const latRad = (gcjLat * Math.PI) / 180;
    const ty = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    let xtile = Math.floor(tx);
    let ytile = Math.floor(ty);
    xtile = ((xtile % n) + n) % n;
    ytile = Math.min(Math.max(ytile, 0), n - 1);
    let url = this._url;
    url = url.replace(/{s}/g, "");
    url = url.replace(/{x}/g, xtile);
    url = url.replace(/{y}/g, ytile);
    url = url.replace(/{z}/g, z);
    return loadImage(url);
  });
};
