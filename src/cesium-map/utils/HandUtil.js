/*
 * @Author: xionghaiying
 * @Date: 2025-08-12 19:46:11
 * @LastEditors: xionghaiying
 * @LastEditTime: 2025-09-06 12:04:45
 * @Description: 常用处理方法
 */
class HandUtil {
  static clickedQ = [];

  static isClickable({ name, delay }) {
    if (this.clickedQ.includes(name)) {
      return false;
    } else {
      this.clickedQ.push(name);
      window.setTimeout(() => {
        this.clickedQ = this.clickedQ.filter((item) => item !== name);
      }, delay || 300);
      return true;
    }
  }

  static filterByExcluding(props, excludeList = ["geometry"]) {
    let out = {};
    if (props) {
      for (let key in props) {
        if (!excludeList.includes(key)) {
          out[key] = props[key];
        }
      }
    }
    return out;
  }

  // hex -> rgb
  static hexToRgb(hex) {
    // 十六进制颜色值的正则表达式
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 16进制颜色转为RGB格式
    let sColor = hex.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //  处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return sColorChange;
    } else {
      return null;
    }
  }

  // hex -> rgba
  static hexToRgba(hex, alpha = 0.6) {
    let rgb = this.hexToRgb(hex);
    if (rgb) {
      return "rgba(" + rgb.join(",") + "," + alpha + ")";
    }
    return hex;
  }

  // 获取颜色序列
  static getColors({ min = 0, max = 0, interval = 10, color = "#2E9BD3", factor = 1.0, precision = 2 }) {
    let rgb = this.hexToRgb(color);
    if (!rgb) {
      return [];
    }
    // 依据等值距分段
    let out = [];
    let toMin = Math.floor(min);
    let toMax = Math.ceil(max);
    let parts = Math.ceil((toMax - toMin) / interval);
    for (let i = 1; i <= parts; i++) {
      out.push({
        from: toMin + interval * (i - 1),
        to: Math.min(toMin + interval * i, toMax),
        color: "rgba(" + rgb.join(",") + "," + Number((factor * i) / parts).toFixed(precision) + ")",
      });
    }
    return out;
  }

  static ConvertRgbToJsColor(rgb) {
    let a = 0xff;
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = rgb & 0xff;
    let ha = a.toString(16).padStart(2, "0");
    let hr = r.toString(16).padStart(2, "0");
    let hg = g.toString(16).padStart(2, "0");
    let hb = b.toString(16).padStart(2, "0");
    return `#${hr}${hg}${hb}${ha}`;
  }

  static ConvertArgbToJsColor(argb) {
    let a = (argb >> 24) & 0xff;
    let r = (argb >> 16) & 0xff;
    let g = (argb >> 8) & 0xff;
    let b = argb & 0xff;
    let ha = a.toString(16).padStart(2, "0");
    let hr = r.toString(16).padStart(2, "0");
    let hg = g.toString(16).padStart(2, "0");
    let hb = b.toString(16).padStart(2, "0");
    return `#${hr}${hg}${hb}${ha}`;
  }

  static ConvertArgbToJsColorArgb(argb, swapRedBlue) {
    let a = (argb >> 24) & 0xff;
    let r = (argb >> 16) & 0xff;
    let g = (argb >> 8) & 0xff;
    let b = argb & 0xff;
    let ha = a.toString(16).padStart(2, "0");
    let hr = r.toString(16).padStart(2, "0");
    let hg = g.toString(16).padStart(2, "0");
    let hb = b.toString(16).padStart(2, "0");
    if (swapRedBlue === true) {
      return `#${ha}${hb}${hg}${hr}`;
    } else {
      return `#${ha}${hr}${hg}${hb}`;
    }
  }

  static ConvertArgbToRGBColor(argb) {
    return 0x00ffffff & argb;
  }

  static isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  /**
   * @description: 速度转换
   * @param {*} speed 单位 m/s
   * @param {*} outtype 转换类型 outtype:0-km/h,1-节
   * @return {*}
   */
  static formatSpeed = (speed, outtype) => {
    if (speed === undefined) return "无";
    if (outtype === 0) {
      //转化为km/h
      return `${(speed * 3.6).toFixed(1)}公里/时`;
    } else if (outtype === 1) {
      //节
      return `${(speed * 1.94).toFixed(1)}节`;
    }
    return speed;
  };

  //公里
  static formatDistanceKM = (dis) => {
    return formatDistance(dis, 0);
  };
  //海里
  static formatDistanceNM = (dis) => {
    return formatDistance(dis, 1);
  };
  //链
  static formatDistanceLian = (dis) => {
    return formatDistance(dis, 2);
  };

  /**
   * @description: 速度转换
   * @param {*} dis 单位米/秒
   * @param {*} outtype 0-公里/h,1-海里,2-链
   * @return {*}
   */
  static formatDistance = (dis, outtype) => {
    if (dis === undefined) return "无";
    let MeterToNM = dis / 1852;
    let MeterToLian = MeterToNM * 10;
    if (outtype === 0) {
      //转化为km/h
      let d = (dis / 1000.0).toFixed(1);
      if (d < 1) {
        return `${dis.toFixed(0)}米`;
      } else {
        return `${(dis / 1000.0).toFixed(1)}公里`;
      }
    } else if (outtype === 1) {
      //节
      return `${MeterToNM.toFixed(1)}海里`;
    } else if (outtype === 2) {
      //链
      return `${MeterToLian.toFixed(1)}链`;
    }
    return dis;
  };
}

export default HandUtil;
