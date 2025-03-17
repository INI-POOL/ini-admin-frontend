import { patch,get,post } from "./request";


export function getPoolProfits(params) {
    return get("/api/v1/back_stage/pre_allocate/pool_profits/daily", params);
}

export function updatePoolProfit(id, data) {
    return patch(`/api/v1/back_stage/pre_allocate/pool_profits/modify?id=${id}`, data);
}