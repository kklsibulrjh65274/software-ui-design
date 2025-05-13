import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'
import { Database } from '@/mock/dashboard/types'

// 获取关系型数据库列表
export const getRelationalDatabases = async (params?: QueryParams): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 从数据库列表中筛选出关系型数据库
    const allDatabases = getMockData('databases') as Database[];
    const relationalDatabases = allDatabases.filter(db => 
      db.id.startsWith('postgres-') || !db.id.includes('-') // 简单判断，假设以postgres-开头的都是关系型数据库
    );
    
    return mockResponse(relationalDatabases)
  }
  
  return api.get('/database/relational', { params })
}

// 获取关系型数据库详情
export const getRelationalDatabaseById = async (id: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    const allDatabases = getMockData('databases') as Database[];
    const database = allDatabases.find(db => db.id === id);
    
    if (!database) {
      return mockResponse(null, true, 404)
    }
    
    return mockResponse(database)
  }
  
  return api.get(`/database/relational/${id}`)
}

// 创建关系型数据库
export const createRelationalDatabase = async (data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 生成唯一ID
    const id = `postgres-${Date.now().toString(36)}`;
    
    // 创建新数据库
    const newDatabase: Database = {
      id,
      name: data.name,
      charset: data.charset || "UTF-8",
      collation: data.collation || "en_US.UTF-8",
      size: "0 GB",
      tables: 0
    };
    
    // 添加到数据库列表
    const databases = getMockData('databases') as Database[];
    databases.push(newDatabase);
    
    return mockResponse(newDatabase)
  }
  
  return api.post('/database/relational', data)
}

// 执行 SQL 查询
export const executeSQLQuery = async (databaseId: string, query: string): Promise<ApiResponse<any>> => {
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
  
  return api.post(`/database/relational/${databaseId}/query`, { query })
}

// 获取关系型数据库表列表
export const getRelationalTables = async (databaseId: string, params?: QueryParams): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    const allTables = getMockData('tables') as any[];
    const databaseTables = allTables.filter(table => table.database === databaseId);
    
    return mockResponse(databaseTables)
  }
  
  return api.get(`/database/relational/${databaseId}/tables`, { params })
}

// 创建关系型数据库表
export const createRelationalTable = async (databaseId: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 创建新表
    const newTable = {
      name: data.name,
      database: databaseId,
      type: "关系型",
      fields: data.fields.length,
      rows: "0",
      size: "0 KB",
      indexes: 1 // 默认会有主键索引
    };
    
    // 添加到表列表
    const tables = getMockData('tables') as any[];
    tables.push(newTable);
    
    // 更新数据库表计数
    const databases = getMockData('databases') as Database[];
    const dbIndex = databases.findIndex(db => db.id === databaseId);
    if (dbIndex !== -1) {
      databases[dbIndex].tables += 1;
    }
    
    return mockResponse(newTable)
  }
  
  return api.post(`/database/relational/${databaseId}/tables`, data)
}