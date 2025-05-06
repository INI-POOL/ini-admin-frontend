import { patch,get,post } from "./request";

// 查询机器可选项
export function machineOptions(currency='') {
  return get(`/api/v1/back_stage/machine/options?currency=${currency}`);
}

export function taoProfitOptions() {
  return get('/api/v1/back_stage/tao/group/options');
}

// 查询机器列表
export function machinList(data) {
  return post("/api/v1/back_stage/machine/list", data);
}

// 更新机器信息
export function updateMachine(id, data) {
  return patch(`/api/v1/back_stage/machine/modify?id=${id}`, data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function preMachineList(data) {
  return post("/api/v1/back_stage/pre_allocate/machine", data);
}

export function preMachineModify(data) {
  return patch(`/api/v1/back_stage/pre_allocate/machine/modify`, data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

