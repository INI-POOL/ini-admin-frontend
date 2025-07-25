// Token 相关的 key 常量
const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10分钟，单位毫秒

// 设置token和过期时间
export const setToken = (token: string): void => {
  const expiry = new Date().getTime() + TOKEN_EXPIRY_TIME;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

// 获取token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 移除token
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// 检查token是否有效
export const isTokenValid = (): boolean => {
  const token = getToken();
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return false;
  }

  return new Date().getTime() < parseInt(expiry);
};
