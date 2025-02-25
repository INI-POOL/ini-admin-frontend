import axios from "axios";
import { removeToken } from "../utils/auth";

// 创建axios实例
const service = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:3000/api", // API基础URL
  timeout: 15000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token过期或未登录处理
          removeToken();
          window.location.href = "/auth/login";
          break;
        default:
          console.error("API请求错误:", error);
      }
    }
    return Promise.reject(error);
  },
);

export default service;
