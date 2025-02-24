import axios from 'axios'
import { getToken, removeToken } from '../utils/auth'
import router from '../router'

const service = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
})

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          removeToken()
          router.push({
            path: '/auth/login',
            query: { redirect: router.currentRoute.value.fullPath },
          })
          break
        default:
          console.error('API请求错误:', error)
      }
    }
    return Promise.reject(error)
  },
)

export default service
