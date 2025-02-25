import { post, get } from "./request";

// 根据实际的API路径修改
export function login(data: any) {
  return post("/auth/login", data); // 例如：/api/auth/login
}

export function getUserInfo() {
  return get("/user/info"); // 例如：/api/user/info
}

export function logout() {
  return post("/auth/logout"); // 例如：/api/auth/logout
}
