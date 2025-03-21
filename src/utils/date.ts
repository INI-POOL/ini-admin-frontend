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

export function convertDateTime(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function timestampToFormattedTime(timestamp: number): string {
    // 创建 Date 对象
    const date = new Date(timestamp*1000);
    // 获取年、月、日、时、分、秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 拼接成目标格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function convertDateTimeToDate(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

function getLowLevelUnit(unit: string): string {
	if (unit === 'EH/s') {
		return 'PH/s'
	}else if (unit === 'PH/s') {
		return 'TH/s'
	}else if (unit === 'TH/s') {
		return 'GH/s'
	}else if (unit === 'GH/s') {
		return 'MH/s'
	}else if (unit === 'MH/s') {
		return 'kH/s'
	}else if (unit === 'kH/s') {
		return 'H/s'
	}

	return 'H/s'
}

export function	formatHashRate(hashRate: number): string {
		let unit = '';
		let formattedValue = hashRate;

		// 根据算力的大小选择单位
		if (hashRate >= 1e18) {
			unit = 'EH/s';
			formattedValue = hashRate / 1e18;
		} else if (hashRate >= 1e15) {
			unit = 'PH/s';
			formattedValue = hashRate / 1e15;
		} else if (hashRate >= 1e12) {
			unit = 'TH/s';
			formattedValue = hashRate / 1e12;
		} else if (hashRate >= 1e9) {
			unit = 'GH/s';
			formattedValue = hashRate / 1e9;
		} else if (hashRate >= 1e6) {
			unit = 'MH/s';
			formattedValue = hashRate / 1e6;
		} else if (hashRate >= 1e3) {
			unit = 'kH/s';
			formattedValue = hashRate / 1e3;
		} else {
			unit = 'H/s';
		}

		// 保留两位小数，确保值大于 0.1
		formattedValue = Math.round(formattedValue * 100) / 100;
		
		if (formattedValue < 8) {
			formattedValue = formattedValue * 1e3
			unit = getLowLevelUnit(unit)
		}
			
		return formattedValue.toFixed(2) + ' ' + unit;
}

// 获取昨日日期 (返回Date对象)
export const getYesterdayDate = (): Date => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

export const getYesterday = (offsetHours: number = 0): Date => {
  const now: Date = new Date();
  
  // 调整时区偏移（将时间对齐到目标时区的0点）
  const adjusted: Date = new Date(now.getTime() - offsetHours * 60 * 60 * 1000);
  adjusted.setHours(0, 0, 0, 0); // 标准化到目标时区当日0点
  adjusted.setDate(adjusted.getDate() - 1); // 计算"昨日"
  
  return adjusted;
};

// 日期格式化 (包含完整类型定义)
export const formatDateToYYYYMMDD = (date: Date | null | undefined): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export const isDateDisabled = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 清除时间部分

  // 定义二期开始日期
  const phase2Start = new Date('2025-02-27')
  phase2Start.setHours(0, 0, 0, 0)

  // 处理比较日期
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)

  // 判断逻辑
  return compareDate < phase2Start ||    // 早于2025-02-27
         compareDate >= today           // 今天及以后
}

// 可选：处理字符串转Date (安全转换)
export const safeStringToDate = (dateString: string): Date | null => {
  const timestamp = Date.parse(dateString)
  return isNaN(timestamp) ? null : new Date(timestamp)
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

