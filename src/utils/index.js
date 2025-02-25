// 清除小数后面的0
export function  removeTrailingZeros(num) {
    // 转为字符串
    let str = num.toString();
    
    // 如果是整数或没有小数点，直接返回
    if (!str.includes('.')) return str;
    
    // 去掉小数点后多余的零
    str = str.replace(/\.?0+$/, '');
    
    return str;
  }