import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'
import { BackupHistory, BackupSchedule } from '@/mock/dashboard/types'

// 获取备份历史
export const getBackupHistory = async (params?: QueryParams): Promise<ApiResponse<BackupHistory[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('backupHistory'))
  }
  
  return api.get('/monitoring/backup/history', { params })
}

// 获取备份历史详情
export const getBackupHistoryById = async (id: string): Promise<ApiResponse<BackupHistory>> => {
  if (useMock()) {
    const history = getMockData('backupHistory') as BackupHistory[]
    const backup = history.find(b => b.id === id)
    
    if (!backup) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(backup)
  }
  
  return api.get(`/monitoring/backup/history/${id}`)
}

// 获取备份计划
export const getBackupSchedules = async (params?: QueryParams): Promise<ApiResponse<BackupSchedule[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('backupSchedules'))
  }
  
  return api.get('/monitoring/backup/schedules', { params })
}

// 获取备份计划详情
export const getBackupScheduleById = async (id: string): Promise<ApiResponse<BackupSchedule>> => {
  if (useMock()) {
    const schedules = getMockData('backupSchedules') as BackupSchedule[]
    const schedule = schedules.find(s => s.id === id)
    
    if (!schedule) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(schedule)
  }
  
  return api.get(`/monitoring/backup/schedules/${id}`)
}

// 创建备份计划
export const createBackupSchedule = async (data: Omit<BackupSchedule, 'id'>): Promise<ApiResponse<BackupSchedule>> => {
  if (useMock()) {
    // 模拟创建备份计划
    const newSchedule: BackupSchedule = {
      id: `schedule-${Date.now()}`,
      ...data
    }
    return mockResponse(newSchedule)
  }
  
  return api.post('/monitoring/backup/schedules', data)
}

// 更新备份计划
export const updateBackupSchedule = async (id: string, data: Partial<BackupSchedule>): Promise<ApiResponse<BackupSchedule>> => {
  if (useMock()) {
    const schedules = getMockData('backupSchedules') as BackupSchedule[]
    const scheduleIndex = schedules.findIndex(s => s.id === id)
    
    if (scheduleIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedSchedule = { ...schedules[scheduleIndex], ...data }
    return mockResponse(updatedSchedule)
  }
  
  return api.put(`/monitoring/backup/schedules/${id}`, data)
}

// 删除备份计划
export const deleteBackupSchedule = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/monitoring/backup/schedules/${id}`)
}

// 执行手动备份
export const createManualBackup = async (data: { name: string, type: string }): Promise<ApiResponse<BackupHistory>> => {
  if (useMock()) {
    // 模拟创建手动备份
    const newBackup: BackupHistory = {
      id: `backup-${Date.now()}`,
      name: data.name,
      type: '手动',
      status: '成功',
      size: '3.2 GB',
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      endTime: new Date(Date.now() + 1000 * 60 * 30).toISOString().replace('T', ' ').substring(0, 19),
      duration: '30分钟'
    }
    return mockResponse(newBackup)
  }
  
  return api.post('/monitoring/backup/manual', data)
}

// 获取性能数据
export const getPerformanceData = async (params?: { timeRange?: string }): Promise<ApiResponse<any>> => {
  if (useMock()) {
    return mockResponse(getMockData('performanceData'))
  }
  
  return api.get('/monitoring/performance', { params })
}