import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { config } from '@/config'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证信息等
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // 处理 401 错误（未授权）
    if (error.response?.status === 401) {
      // 可以在这里处理 token 刷新逻辑
      // 如果已经尝试过刷新 token，则不再尝试
      if (!originalRequest._retry) {
        originalRequest._retry = true
        try {
          // 刷新 token 的逻辑
          // const refreshToken = localStorage.getItem('refreshToken')
          // const response = await apiClient.post('/auth/refresh', { refreshToken })
          // localStorage.setItem('token', response.data.token)
          
          // 使用新 token 重试原请求
          // if (originalRequest.headers) {
          //   originalRequest.headers.Authorization = `Bearer ${response.data.token}`
          // }
          // return apiClient(originalRequest)
        } catch (refreshError) {
          // 刷新 token 失败，可能需要重新登录
          // window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }
    
    // 处理其他错误
    return Promise.reject(error)
  }
)

// 通用请求方法
export const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    // 确保 URL 是有效的
    if (config.url) {
      try {
        // 如果是相对路径，使用 baseURL 构建完整 URL
        new URL(config.url.startsWith('http') ? config.url : `${config.api.baseUrl}${config.url}`)
      } catch (e) {
        throw new Error(`Invalid URL: ${config.url}`)
      }
    }
    
    const response: AxiosResponse<T> = await apiClient(config)
    return response.data
  } catch (error) {
    return Promise.reject(error)
  }
}

// 导出常用方法
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'GET', url }),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'POST', url, data }),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'PUT', url, data }),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'PATCH', url, data }),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'DELETE', url }),
}

export default apiClient