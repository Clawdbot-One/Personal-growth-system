import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  // 将 304 也视为成功状态，避免浏览器缓存导致的误报错误
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('youban_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    // 304 Not Modified：浏览器使用缓存，无需处理
    if (response.status === 304) {
      return response.data || {}
    }
    const { data } = response
    if (data && data.code !== 0) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response) {
      const { status, config } = error.response
      const url = config?.url || 'unknown'
      const msg = error.response.data?.message || error.message
      ElMessage.error(`[${status}] ${url}: ${msg}`)
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request