import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'
import { Database, Table } from '@/mock/dashboard/types'

// 导入子模块
import * as relationalApi from './relational'

// 获取所有数据库
export const getDatabases = async (params?: QueryParams): Promise<ApiResponse<Database[]>> => {
  if (useMock()) {
    return mockResponse(getMockData('databases'))
  }
  
  return api.get('/database', { params })
}

// 获取数据库详情
export const getDatabaseById = async (id: string): Promise<ApiResponse<Database>> => {
  if (useMock()) {
    const databases = getMockData('databases') as Database[]
    const database = databases.find(db => db.id === id)
    
    if (!database) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(database)
  }
  
  return api.get(`/database/${id}`)
}

// 创建数据库
export const createDatabase = async (data: Omit<Database, 'id'>): Promise<ApiResponse<Database>> => {
  if (useMock()) {
    // 模拟创建数据库
    const newDatabase: Database = {
      id: `db-${Date.now()}`,
      ...data,
      tables: 0,
      size: "0 GB"
    }
    
    // 将新数据库添加到模拟数据中
    const databases = getMockData('databases') as Database[];
    databases.push(newDatabase);
    
    return mockResponse(newDatabase)
  }
  
  return api.post('/database', data)
}

// 更新数据库
export const updateDatabase = async (id: string, data: Partial<Database>): Promise<ApiResponse<Database>> => {
  if (useMock()) {
    const databases = getMockData('databases') as Database[]
    const databaseIndex = databases.findIndex(db => db.id === id)
    
    if (databaseIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedDatabase = { ...databases[databaseIndex], ...data }
    databases[databaseIndex] = updatedDatabase;
    
    return mockResponse(updatedDatabase)
  }
  
  return api.put(`/database/${id}`, data)
}

// 删除数据库
export const deleteDatabase = async (id: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    const databases = getMockData('databases') as Database[]
    const databaseIndex = databases.findIndex(db => db.id === id)
    
    if (databaseIndex !== -1) {
      databases.splice(databaseIndex, 1);
    }
    
    // 同时删除该数据库下的所有表
    const tables = getMockData('tables') as Table[]
    const updatedTables = tables.filter(table => table.database !== id);
    
    // 更新模拟数据
    (getMockData('tables') as Table[]).length = 0;
    (getMockData('tables') as Table[]).push(...updatedTables);
    
    return mockResponse(true)
  }
  
  return api.delete(`/database/${id}`)
}

// 获取所有表
export const getTables = async (params?: QueryParams): Promise<ApiResponse<Table[]>> => {
  if (useMock()) {
    let tables = getMockData('tables') as Table[];
    
    // 如果指定了数据库，则过滤表
    if (params?.database) {
      tables = tables.filter(table => table.database === params.database);
    }
    
    return mockResponse(tables)
  }
  
  return api.get('/database/tables', { params })
}

// 获取表详情
export const getTableByName = async (databaseId: string, tableName: string): Promise<ApiResponse<Table>> => {
  if (useMock()) {
    const tables = getMockData('tables') as Table[]
    const table = tables.find(t => t.database === databaseId && t.name === tableName)
    
    if (!table) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(table)
  }
  
  return api.get(`/database/${databaseId}/tables/${tableName}`)
}

// 创建表
export const createTable = async (databaseId: string, data: Omit<Table, 'database'>): Promise<ApiResponse<Table>> => {
  if (useMock()) {
    // 模拟创建表
    const newTable: Table = {
      database: databaseId,
      ...data
    }
    return mockResponse(newTable)
  }
  
  return api.post(`/database/${databaseId}/tables`, data)
}

// 更新表
export const updateTable = async (databaseId: string, tableName: string, data: Partial<Table>): Promise<ApiResponse<Table>> => {
  if (useMock()) {
    const tables = getMockData('tables') as Table[]
    const tableIndex = tables.findIndex(t => t.database === databaseId && t.name === tableName)
    
    if (tableIndex === -1) {
      return mockResponse(null, true, 404)
    }
    
    const updatedTable = { ...tables[tableIndex], ...data }
    tables[tableIndex] = updatedTable;
    
    return mockResponse(updatedTable)
  }
  
  return api.put(`/database/${databaseId}/tables/${tableName}`, data)
}

// 删除表
export const deleteTable = async (databaseId: string, tableName: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    const tables = getMockData('tables') as Table[]
    const tableIndex = tables.findIndex(t => t.database === databaseId && t.name === tableName)
    
    if (tableIndex !== -1) {
      tables.splice(tableIndex, 1);
    }
    
    return mockResponse(true)
  }
  
  return api.delete(`/database/${databaseId}/tables/${tableName}`)
}

// 执行 SQL 查询
export const executeQuery = async (databaseId: string, query: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟查询结果
    if (query.toLowerCase().includes('select')) {
      return mockResponse({
        columns: ["id", "username", "email", "created_at"],
        rows: [
          { id: 1, username: "admin", email: "admin@example.com", created_at: "2023-01-01 00:00:00" },
          { id: 2, username: "user1", email: "user1@example.com", created_at: "2023-01-02 10:30:00" },
          { id: 3, username: "user2", email: "user2@example.com", created_at: "2023-01-03 14:45:00" },
          { id: 4, username: "user3", email: "user3@example.com", created_at: "2023-01-04 09:15:00" },
          { id: 5, username: "user4", email: "user4@example.com", created_at: "2023-01-05 16:20:00" },
        ],
        executionTime: "0.023 秒",
        rowCount: 5,
      })
    } else {
      return mockResponse({
        affectedRows: 1,
        executionTime: "0.015 秒",
      })
    }
  }
  
  return api.post(`/database/${databaseId}/query`, { query })
}

// 导出子模块
export { relationalApi }