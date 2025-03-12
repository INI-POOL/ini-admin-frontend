import { post } from "./request";


// 查询机器列表
export function machinList(data) {
  return post("/api/v1/back_stage/machine/list", data);
}

// 更新机器信息
export function updateMachine(id,data) { 
  return post(`/api/v1/back_stage/machine/modify?id=${id}`,data);  
}
