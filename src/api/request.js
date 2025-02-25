import service from "./config";

// 封装GET请求
export function get(url, params) {
  return service({
    url,
    method: "get",
    params,
  });
}

// 封装POST请求
export function post(url, data) {
  return service({
    url,
    method: "post",
    data,
  });
}

// 封装PUT请求
export function put(url, data) {
  return service({
    url,
    method: "put",
    data,
  });
}

// 封装DELETE请求
export function del(url) {
  return service({
    url,
    method: "delete",
  });
}
