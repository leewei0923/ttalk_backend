/**
 * 利用正则表达式验证
 * @param reg 正则表达式
 * @param str  需要验证的字符串
 * @returns boolean
 */
export const RegEXPValid = (reg: RegExp, str: string) => {
  reg.lastIndex = 0;
  return reg.test(str);
};

/**
 * 需要验证字符串的长度
 * @param str 需要验证的字符串
 * @param minLength 最小长度 默认0
 * @param maxLength 最大长度 默认 100
 * @returns true | false
 */
export const LengthValid = (str: string, minLength = 0, maxLength = 100) => {
  const len = str.length;

  if (len >= minLength && len <= maxLength) {
    return true;
  } else if (len < minLength) {
    return false;
  } else if (len > maxLength) {
    return false;
  }

  return false;
};
