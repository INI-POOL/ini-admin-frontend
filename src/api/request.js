import service from "./config";

// 封装GET请求
export function get(url, params) {
  return service({
    url,
    method: "get",
    params,
  });
}

export function getWithConfig(url, config = {}) {
  return service({
    url,
    method: 'get',
    ...config // 包含 params, headers 等所有配置
  })
}

export function deleteFunc(url, data) {
  return service({
    url,
    method: "delete",
    data,
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

export function patch(url, data) {
  return service({
    url,
    method: "patch",
    data,
  })    .then((response) => {
      console.log("请求成功，完整响应:", response); 
      return response;
    })
    .catch((error) => {
      console.error("请求失败:", error); 
      if (error.response) {
        console.error("响应数据:", error.response.data); 
        console.error("状态码:", error.response.status); 
      }
      throw error;
    });
}
