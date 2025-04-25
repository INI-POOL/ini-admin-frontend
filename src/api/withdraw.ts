import { get, post } from "./request";

// 获取提现列表
export function getWithdrawList(params: {
  page: number;
  pagesize: number;
  currency?: string;
  user_id?: number;
  mobile?: string;
  email?: string;
}) {
  return post("/api/v1/back_stage/withdraw/list", params);
}

// 获取提现详情
export function getWithdrawDetail(id: string) {
  return get(`/withdraw/detail/${id}`);
}

// 提现审核
// /api/v1/back_stage/withdraw/audit
export function auditWithdraw(data: { id: string; audit_status: number }) {
  return post("/api/v1/back_stage/withdraw/audit", data);
}

export function successWithdraw(data: { id: string }) {
  return post("/api/v1/back_stage/withdraw/pass", data);
}

// 获取热钱包余额
export function getHotAddressBalance() { 
  return get("/api/v1/back_stage/hot_address/balance");  
}
