import { get } from "./request";


export function getAllocTasks(params) {
    return get("/api/v1/back_stage/pre_allocate/tasks", params);
}

export function preAlloc(params) {
    return get("/api/v1/back_stage/pre_allocate/exec", params);
}

export function alloc(params) {
	return get("/api/v1/back_stage/allocate/yesterday", params);
}

export function allocated(params) {
	return get("/api/v1/back_stage/allocate/allocated", params);
}