import { post, get } from './request'

// 用户登录
export function login(data) {
  return post('/user/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info')
}

// 用户登出
export function logout() {
  return post('/user/logout')
}
