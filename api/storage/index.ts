import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'
import { Volume, Snapshot } from '@/mock/dashboard/types'

// 获取所有卷
export const getVolumes = async (params?: QueryParams): Promise<ApiResponse<Volume[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('volumes'))
  }
  
  return api.get('/storage/volumes', { params })
}

// 获取卷详情
export const getVolumeById = async (id: string): Promise<ApiResponse<Volume>> => {
  if (useMock()) {
    const volumes = getMockData('volumes') as Volume[]
    const volume = volumes.find(v => v.id === id)
    
    if (!volume) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(volume)
  }
  
  return api.get(`/storage/volumes/${id}`)
}

// 创建卷
export const createVolume = async (data: Omit<Volume, 'id' | 'createdAt'>): Promise<ApiResponse<Volume>> => {
  if (useMock()) {
    // 模拟创建卷
    const newVolume: Volume = {
      id: `vol-${Date.now()}`,
      createdAt: new Date(),
      ...data
    }
    return mockResponse(newVolume)
  }
  
  return api.post('/storage/volumes', data)
}

// 更新卷
export const updateVolume = async (id: string, data: Partial<Volume>): Promise<ApiResponse<Volume>> => {
  if (useMock()) {
    const volumes = getMockData('volumes') as Volume[]
    const volumeIndex = volumes.findIndex(v => v.id === id)
    
    if (volumeIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedVolume = { ...volumes[volumeIndex], ...data }
    return mockResponse(updatedVolume)
  }
  
  return api.put(`/storage/volumes/${id}`, data)
}

// 删除卷
export const deleteVolume = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/storage/volumes/${id}`)
}

// 获取所有快照
export const getSnapshots = async (params?: QueryParams): Promise<ApiResponse<Snapshot[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('snapshots'))
  }
  
  return api.get('/storage/snapshots', { params })
}

// 获取快照详情
export const getSnapshotById = async (id: string): Promise<ApiResponse<Snapshot>> => {
  if (useMock()) {
    const snapshots = getMockData('snapshots') as Snapshot[]
    const snapshot = snapshots.find(s => s.id === id)
    
    if (!snapshot) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(snapshot)
  }
  
  return api.get(`/storage/snapshots/${id}`)
}

// 创建快照
export const createSnapshot = async (data: Omit<Snapshot, 'id' | 'createdAt'>): Promise<ApiResponse<Snapshot>> => {
  if (useMock()) {
    // 模拟创建快照
    const newSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      createdAt: new Date(),
      ...data
    }
    return mockResponse(newSnapshot)
  }
  
  return api.post('/storage/snapshots', data)
}

// 删除快照
export const deleteSnapshot = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/storage/snapshots/${id}`)
}

// 获取文件列表
export const getFiles = async (path: string = '/'): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('files'))
  }
  
  return api.get('/storage/files', { params: { path } })
}

// 上传文件
export const uploadFile = async (path: string, file: File): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟上传文件
    return mockResponse({ success: true, path, fileName: file.name })
  }
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path)
  
  return api.post('/storage/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export const deleteFile = async (path: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete('/storage/files', { params: { path } })
}