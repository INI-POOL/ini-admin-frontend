import axios from "axios";
import { getToken, removeToken } from "../utils/auth";
import router from "../router";

const service = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // 根据后端要求修改认证头格式
      config.headers["Authorization"] = `Bearer ${token}`; // Bearer 认证
      // 或者
      // config.headers['X-Token'] = token  // 自定义头
      // 或者
      // config.headers['token'] = token    // 简单token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 根据后端的响应格式进行相应调整
    const res = response.data;
    if (res.code === 200) {
      // 假设后端用 code=200 表示成功
      return res.data;
    } else {
      // 处理业务错误
      console.error("API错误:", res.msg);
      return Promise.reject(new Error(res.msg || "未知错误"));
    }
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          removeToken();
          router.push({
            path: "/auth/login",
            query: { redirect: router.currentRoute.value.fullPath },
          });
          break;
        case 403:
          console.error("没有权限");
          break;
        case 500:
          console.error("服务器错误");
          break;
        default:
          console.error("API请求错误:", error);
      }
    }
    return Promise.reject(error);
  },
);

export default service;
