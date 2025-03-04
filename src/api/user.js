import { post, get } from "./request";

// 用户登录
// POST: /api/v1/back_stage/google/secret/auth
// {
//     "google_code":"045938",
//     "user_name":"123"
// }
export function login(data) {
  return post("/api/v1/back_stage/google/secret/auth", data);
}




// 检查谷歌认证
// {
//     "google_code":"045938",
//     "user_name":"123"
// }
export function checkGoogleCode(data) {
  return post("/api/v1/back_stage/google/secret/auth",data);
}

export function bindGoogleCode(data) {
  return post("/api/v1/back_stage/google/secret/bind",data);
}

// 1、获取指定用户的密钥
// GET: /api/v1/back_stage/google/secret/get?user_name=123
export function getGoogle(user_name) {
  return get("/api/v1/back_stage/google/secret/get?user_name="+user_name);
}

export function isNeedGoogle(user_name) {
  return get("/api/v1/back_stage/google_auth/judge?user_name="+user_name);
}

// 获取用户信息
export function getUserInfo() {
  return get("/user/info");
}

// 用户登出
export function logout() {
  return post("/user/logout");
}
