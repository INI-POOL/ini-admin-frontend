/**
 * 将时间戳转换为日期时间字符串
 * @param timestamp 时间戳（秒或毫秒）
 * @param format 日期格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  timestamp: number | string,
  format: string = "YYYY-MM-DD HH:mm:ss",
): string {
  if (!timestamp) {
    return "-";
  }

  // 转换为数字
  const ts = Number(timestamp);

  // 处理秒级时间戳
  const date = new Date(ts < 10000000000 ? ts * 1000 : ts);

  if (isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 数字补零
 * @param num 需要补零的数字
 * @returns 补零后的字符串
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : num.toString();
}

/**
 * 获取相对时间描述
 * @param timestamp 时间戳
 * @returns 相对时间描述
 */
export function getRelativeTime(timestamp: number | string): string {
  if (!timestamp) {
    return "-";
  }

  const ts = Number(timestamp);
  const date = new Date(ts < 10000000000 ? ts * 1000 : ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "刚刚";
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return formatDateTime(timestamp, "YYYY-MM-DD");
  }
}
