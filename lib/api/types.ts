// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页请求参数
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 分页响应数据
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 通用查询参数
export interface QueryParams {
  search?: string
  filter?: Record<string, any>
  [key: string]: any
}

// 错误响应
export interface ApiError {
  code: string
  message: string
  details?: any
}