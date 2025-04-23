import { patch,get,post,put,getWithConfig,deleteFunc } from "./request";

// 查询机器可选项
export function noticeList(params) {
  return get("/api/v1/back_stage/notice/list",params);
}

export function addNotice(data) {
  return put("/api/v1/back_stage/notice/add",data)
  .then((response) => {
    if (!response) {
      throw new Error("请求失败，未返回响应数据");
    }
    return response;
  });
}

export function modifyNotice(id, data) {
  return patch(`/api/v1/back_stage/notice/modify?id=${id}`, data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function deleteNotice(id) {
  return patch(`/api/v1/back_stage/notice/delete?id=${id}`)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function pushNotice(data) {
  return put('/api/v1/back_stage/notice/push',data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function noticeTypes() {
	return get("/api/v1/back_stage/notice/type");
}