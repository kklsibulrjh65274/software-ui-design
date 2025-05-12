import { config } from '@/config'
import * as mockData from '@/mock/dashboard'

// 模拟 API 延迟
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟 API 响应
export const mockResponse = async <T>(data: T, error = false, errorStatus = 500) => {
  // 模拟网络延迟
  await simulateDelay()
  
  // 如果需要模拟错误
  if (error) {
    throw {
      response: {
        status: errorStatus,
        data: {
          code: errorStatus,
          message: '模拟的 API 错误',
          success: false
        }
      }
    }
  }
  
  // 返回成功响应
  return {
    code: 200,
    message: 'success',
    data,
    success: true
  }
}

// 检查是否使用 mock 数据
export const useMock = () => {
  return config.api.useMock
}

// 获取 mock 数据
export const getMockData = (key: keyof typeof mockData) => {
  return mockData[key]
}