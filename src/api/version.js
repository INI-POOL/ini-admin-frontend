import { patch,get,post,getWithConfig } from "./request";

// 查询机器可选项
export function versionList(params) {
  return get("/api/v1/back_stage/version/list",params);
}

export function addVersion(data) {
  return post("/api/v1/back_stage/version/add",data);
}

export function modifyVersion(version, system, data) {
  return patch(`/api/v1/back_stage/version/modify?version=${version}&system=${system}`, data)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function publishVersion(version,system) {
  return patch(`/api/v1/back_stage/version/publish?version=${version}&system=${system}`)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function timedPublishVersion(params) {
  return patch('/api/v1/back_stage/version/timed_publish',params)
    .then((response) => {
      if (!response) {
        throw new Error("请求失败，未返回响应数据");
      }
      return response;
    });
}

export function uploadApk(data) {
	return post('/api/v1/back_stage/version/upload', data, {
	})
}


export function downloadApk(params) {
  return getWithConfig(`/api/v1/back_stage/version/download`, {
    // ✅ 正确参数结构
    params: { 
      version: params.version,
      system: params.system
    },
    // ✅ 独立配置项
    responseType: 'blob',
	headers: {
	  'Cache-Control': 'no-cache'
	},
	timeout: 60000
  })
}