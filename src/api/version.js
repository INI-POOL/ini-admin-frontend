import { patch,get,post } from "./request";

// 查询机器可选项
export function versionList(params) {
  return get("/api/v1/back_stage/version/list",params);
}

export function addVersion(data) {
  return post("/api/v1/back_stage/version/add",data);
}

export function modifyVersion(version, data) {
  return patch(`/api/v1/back_stage/version/modify?version=${version}`, data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function publishVersion(version) {
  return patch(`/api/v1/back_stage/version/publish?version=${version}`)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}