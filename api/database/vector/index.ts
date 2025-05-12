import { api } from '@/lib/api/client'
import { mockResponse, useMock } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'

// 获取向量集合列表
export const getVectorCollections = async (params?: QueryParams): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 模拟向量集合数据
    const collections = [
      { id: "product-embeddings", name: "产品向量", dimensions: 1536, vectors: 125000, indexType: "HNSW" },
      { id: "document-embeddings", name: "文档向量", dimensions: 768, vectors: 85000, indexType: "HNSW" },
      { id: "image-embeddings", name: "图像向量", dimensions: 512, vectors: 250000, indexType: "IVF" },
      { id: "user-embeddings", name: "用户向量", dimensions: 384, vectors: 50000, indexType: "HNSW" },
    ]
    
    return mockResponse(collections)
  }
  
  return api.get('/database/vector/collections', { params })
}

// 获取向量集合详情
export const getVectorCollectionById = async (id: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    const collections = [
      { id: "product-embeddings", name: "产品向量", dimensions: 1536, vectors: 125000, indexType: "HNSW", description: "产品描述和特征的向量表示" },
      { id: "document-embeddings", name: "文档向量", dimensions: 768, vectors: 85000, indexType: "HNSW", description: "文档内容的向量表示" },
      { id: "image-embeddings", name: "图像向量", dimensions: 512, vectors: 250000, indexType: "IVF", description: "图像特征的向量表示" },
      { id: "user-embeddings", name: "用户向量", dimensions: 384, vectors: 50000, indexType: "HNSW", description: "用户偏好的向量表示" },
    ]
    
    const collection = collections.find(c => c.id === id)
    
    if (!collection) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(collection)
  }
  
  return api.get(`/database/vector/collections/${id}`)
}

// 创建向量集合
export const createVectorCollection = async (data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟创建向量集合
    const newCollection = {
      id: `collection-${Date.now()}`,
      ...data
    }
    return mockResponse(newCollection)
  }
  
  return api.post('/database/vector/collections', data)
}

// 更新向量集合
export const updateVectorCollection = async (id: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    return mockResponse({
      id,
      ...data
    })
  }
  
  return api.put(`/database/vector/collections/${id}`, data)
}

// 删除向量集合
export const deleteVectorCollection = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/database/vector/collections/${id}`)
}

// 获取向量索引配置
export const getVectorIndexConfig = async (collectionId: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟索引配置
    return mockResponse({
      type: "HNSW",
      parameters: {
        M: 16,
        efConstruction: 128,
        efSearch: 64
      }
    })
  }
  
  return api.get(`/database/vector/collections/${collectionId}/index`)
}

// 更新向量索引配置
export const updateVectorIndexConfig = async (collectionId: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    return mockResponse({
      type: data.type,
      parameters: data.parameters
    })
  }
  
  return api.put(`/database/vector/collections/${collectionId}/index`, data)
}

// 向量搜索
export const searchVectors = async (collectionId: string, query: string, options?: any): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 模拟搜索结果
    const results = [
      {
        id: "prod-1234",
        name: "超能开发者笔记本 Pro",
        score: 0.92,
        description: "高性能开发者笔记本，搭载最新处理器和独立显卡，适合编程和游戏",
      },
      {
        id: "prod-2345",
        name: "游戏战神笔记本 X1",
        score: 0.87,
        description: "专业游戏笔记本，高刷新率屏幕，强劲散热系统，畅玩各类大型游戏",
      },
      {
        id: "prod-3456",
        name: "轻薄商务本 Air",
        score: 0.76,
        description: "轻薄商务笔记本，长续航，适合商务办公和轻度开发",
      },
      {
        id: "prod-4567",
        name: "全能创作者本 Creator",
        score: 0.72,
        description: "面向创意工作者的笔记本，色彩准确的屏幕，适合设计和开发",
      },
    ]
    
    return mockResponse(results)
  }
  
  return api.post(`/database/vector/collections/${collectionId}/search`, { query, ...options })
}