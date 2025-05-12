import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'
import { Node, Shard } from '@/mock/dashboard/types'

// 获取所有节点
export const getNodes = async (params?: QueryParams): Promise<ApiResponse<Node[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('nodes'))
  }
  
  return api.get('/cluster/nodes', { params })
}

// 获取节点详情
export const getNodeById = async (id: string): Promise<ApiResponse<Node>> => {
  if (useMock()) {
    const nodes = getMockData('nodes') as Node[]
    const node = nodes.find(n => n.id === id)
    
    if (!node) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(node)
  }
  
  return api.get(`/cluster/nodes/${id}`)
}

// 创建节点
export const createNode = async (data: Omit<Node, 'id'>): Promise<ApiResponse<Node>> => {
  if (useMock()) {
    // 模拟创建节点
    const newNode: Node = {
      id: `node-${Date.now()}`,
      ...data
    }
    return mockResponse(newNode)
  }
  
  return api.post('/cluster/nodes', data)
}

// 更新节点
export const updateNode = async (id: string, data: Partial<Node>): Promise<ApiResponse<Node>> => {
  if (useMock()) {
    const nodes = getMockData('nodes') as Node[]
    const nodeIndex = nodes.findIndex(n => n.id === id)
    
    if (nodeIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedNode = { ...nodes[nodeIndex], ...data }
    return mockResponse(updatedNode)
  }
  
  return api.put(`/cluster/nodes/${id}`, data)
}

// 删除节点
export const deleteNode = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/cluster/nodes/${id}`)
}

// 获取所有分片
export const getShards = async (params?: QueryParams): Promise<ApiResponse<Shard[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('shards'))
  }
  
  return api.get('/cluster/shards', { params })
}

// 获取分片详情
export const getShardById = async (id: string): Promise<ApiResponse<Shard>> => {
  if (useMock()) {
    const shards = getMockData('shards') as Shard[]
    const shard = shards.find(s => s.id === id)
    
    if (!shard) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(shard)
  }
  
  return api.get(`/cluster/shards/${id}`)
}

// 创建分片
export const createShard = async (data: Omit<Shard, 'id'>): Promise<ApiResponse<Shard>> => {
  if (useMock()) {
    // 模拟创建分片
    const newShard: Shard = {
      id: `shard-${Date.now()}`,
      ...data
    }
    return mockResponse(newShard)
  }
  
  return api.post('/cluster/shards', data)
}

// 更新分片
export const updateShard = async (id: string, data: Partial<Shard>): Promise<ApiResponse<Shard>> => {
  if (useMock()) {
    const shards = getMockData('shards') as Shard[]
    const shardIndex = shards.findIndex(s => s.id === id)
    
    if (shardIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedShard = { ...shards[shardIndex], ...data }
    return mockResponse(updatedShard)
  }
  
  return api.put(`/cluster/shards/${id}`, data)
}

// 删除分片
export const deleteShard = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/cluster/shards/${id}`)
}