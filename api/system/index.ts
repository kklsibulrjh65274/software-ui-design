import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'

// 获取系统设置
export const getSystemSettings = async (): Promise<ApiResponse<any>> => {
  if (useMock()) {
    return mockResponse({
      general: {
        systemName: "分布式融合数据库与存储管理系统",
        version: "1.0.0",
        maxConnections: 100,
        queryTimeout: 30,
        bufferSize: 1024,
        workerThreads: 8
      },
      security: {
        sslEnabled: true,
        autoLogout: true,
        auditLogging: true
      },
      backup: {
        backupPath: "/data/backups",
        retention: "30",
        schedule: "daily",
        compression: true,
        encryption: true
      }
    })
  }
  
  return api.get('/system/settings')
}

// 更新系统设置
export const updateSystemSettings = async (data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    return mockResponse(data)
  }
  
  return api.put('/system/settings', data)
}

// 获取系统日志
export const getSystemLogs = async (params?: QueryParams): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 返回模拟的系统日志数据
    const logs = [
      {
        id: "log-001",
        timestamp: "2023-05-10 08:45:12",
        level: "错误",
        source: "数据库服务",
        message: "无法连接到数据库节点 node-05",
        details: "连接超时，节点可能已下线或网络问题。已尝试重连3次。",
        traceId: "trace-db-45678",
      },
      {
        id: "log-002",
        timestamp: "2023-05-10 08:30:45",
        level: "警告",
        source: "存储服务",
        message: "存储节点 node-03 磁盘使用率超过 80%",
        details: "当前使用率82.5%，触发预警阈值。建议清理不必要数据或扩展存储容量。",
        traceId: "trace-storage-12345",
      },
      {
        id: "log-003",
        timestamp: "2023-05-10 08:15:30",
        level: "信息",
        source: "系统服务",
        message: "系统备份任务已完成",
        details: "备份大小: 2.3GB，耗时: 15分钟，备份位置: /backups/2023-05-10/",
        traceId: "trace-backup-78901",
      }
    ]
    
    // 处理搜索和过滤
    let filteredLogs = [...logs]
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) || 
        log.source.toLowerCase().includes(searchLower)
      )
    }
    
    if (params?.filter) {
      if (params.filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === params.filter.level)
      }
      if (params.filter.source) {
        filteredLogs = filteredLogs.filter(log => log.source === params.filter.source)
      }
    }
    
    return mockResponse(filteredLogs)
  }
  
  return api.get('/system/logs', { params })
}

// 获取系统告警
export const getSystemAlerts = async (params?: QueryParams): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 返回模拟的系统告警数据
    const alerts = [
      {
        id: "alert-001",
        title: "高CPU使用率",
        message: "节点 db-node-3 CPU使用率超过90%已持续5分钟",
        severity: "critical",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: "系统监控",
        acknowledged: false,
      },
      {
        id: "alert-002",
        title: "磁盘空间不足",
        message: "存储节点 storage-2 可用空间低于10%",
        severity: "high",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        source: "存储监控",
        acknowledged: true,
      },
      {
        id: "alert-003",
        title: "数据库连接数过高",
        message: "关系型数据库实例连接数接近配置上限",
        severity: "medium",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        source: "数据库监控",
        acknowledged: false,
      }
    ]
    
    // 处理搜索和过滤
    let filteredAlerts = [...alerts]
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) || 
        alert.message.toLowerCase().includes(searchLower)
      )
    }
    
    if (params?.filter) {
      if (params.filter.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === params.filter.severity)
      }
      if (params.filter.acknowledged !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === params.filter.acknowledged)
      }
    }
    
    return mockResponse(filteredAlerts)
  }
  
  return api.get('/system/alerts', { params })
}

// 确认告警
export const acknowledgeAlert = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.put(`/system/alerts/${id}/acknowledge`)
}

// 解决告警
export const resolveAlert = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.put(`/system/alerts/${id}/resolve`)
}

// 获取系统性能数据
export const getSystemPerformance = async (timeRange?: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 返回模拟的系统性能数据
    return mockResponse({
      cpu: {
        current: 78,
        history: [45, 40, 35, 30, 32, 35, 42, 55, 70, 85, 82, 80, 78]
      },
      memory: {
        current: 72,
        history: [60, 58, 55, 52, 50, 53, 58, 65, 72, 80, 78, 75, 72]
      },
      disk: {
        current: 53,
        history: [35, 37, 38, 36, 35, 34, 36, 40, 45, 50, 52, 55, 53]
      },
      network: {
        current: 55,
        history: [20, 25, 22, 18, 15, 20, 25, 35, 50, 65, 60, 58, 55]
      },
      timeLabels: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"]
    })
  }
  
  return api.get('/system/performance', { params: { timeRange } })
}