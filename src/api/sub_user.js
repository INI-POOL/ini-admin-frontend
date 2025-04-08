import { patch,get,post } from "./request";


export function getSubUsers(params) {
    return get("/api/v1/back_stage/sub_user/list", params);
}

export function updateSubUserFee(subUserName, data) {
    return patch(`/api/v1/back_stage/sub_user/modify/${subUserName}`, data);
}