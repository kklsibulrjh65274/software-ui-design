import { api } from '@/lib/api/client'
import { mockResponse, useMock, getMockData } from '@/lib/api/mock-handler'
import { ApiResponse, PaginatedData, QueryParams } from '@/lib/api/types'

// 获取表结构
export const getTableStructure = async (databaseId: string, tableName: string): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 根据表名返回不同的结构
    let structure: any[] = []
    
    if (tableName === 'users') {
      structure = [
        { name: "id", type: "integer", length: null, nullable: false, default: "自增" },
        { name: "username", type: "varchar", length: 50, nullable: false, default: null },
        { name: "email", type: "varchar", length: 100, nullable: false, default: null },
        { name: "password_hash", type: "varchar", length: 255, nullable: false, default: null },
        { name: "created_at", type: "timestamp", length: null, nullable: false, default: "CURRENT_TIMESTAMP" }
      ]
    } else if (tableName === 'products') {
      structure = [
        { name: "id", type: "integer", length: null, nullable: false, default: "自增" },
        { name: "name", type: "varchar", length: 100, nullable: false, default: null },
        { name: "description", type: "text", length: null, nullable: true, default: null },
        { name: "price", type: "decimal", length: "10,2", nullable: false, default: "0.00" },
        { name: "category_id", type: "integer", length: null, nullable: false, default: null }
      ]
    } else if (tableName === 'orders') {
      structure = [
        { name: "id", type: "integer", length: null, nullable: false, default: "自增" },
        { name: "user_id", type: "integer", length: null, nullable: false, default: null },
        { name: "status", type: "varchar", length: 20, nullable: false, default: "'pending'" },
        { name: "total_amount", type: "decimal", length: "10,2", nullable: false, default: "0.00" },
        { name: "created_at", type: "timestamp", length: null, nullable: false, default: "CURRENT_TIMESTAMP" }
      ]
    }
    
    return mockResponse(structure)
  }
  
  return api.get(`/data-model/tables/${databaseId}/${tableName}/structure`)
}

// 创建表
export const createTable = async (databaseId: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟创建表的响应
    const newTable = {
      name: data.name,
      database: databaseId,
      type: "关系型",
      fields: data.fields.length,
      rows: "0",
      size: "0 KB",
      indexes: 1, // 默认会有主键索引
      success: true
    }
    
    // 模拟添加到表列表
    const tables = getMockData('tables') as any[];
    tables.push(newTable);
    
    return mockResponse({ success: true, tableName: data.name, table: newTable })
  }
  
  return api.post(`/data-model/tables/${databaseId}`, data)
}

// 修改表结构
export const alterTable = async (databaseId: string, tableName: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟修改表结构
    if (data.action === "ADD_COLUMN") {
      // 获取当前表结构
      const structure = await getTableStructure(databaseId, tableName);
      if (structure.success && Array.isArray(structure.data)) {
        // 添加新字段到结构中
        structure.data.push(data.column);
      }
    }
    
    return mockResponse({ success: true })
  }
  
  return api.put(`/data-model/tables/${databaseId}/${tableName}`, data)
}

// 删除表
export const dropTable = async (databaseId: string, tableName: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    // 模拟从表列表中删除表
    const tables = getMockData('tables') as any[];
    const tableIndex = tables.findIndex(t => t.database === databaseId && t.name === tableName);
    
    if (tableIndex !== -1) {
      tables.splice(tableIndex, 1);
    }
    
    return mockResponse(true)
  }
  
  return api.delete(`/data-model/tables/${databaseId}/${tableName}`)
}

// 获取表索引
export const getTableIndexes = async (databaseId: string, tableName: string): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 模拟索引数据
    let indexes: any[] = [];
    
    if (tableName === 'users') {
      indexes = [
        { name: "idx_users_email", columns: ["email"], type: "UNIQUE", method: "BTREE" },
        { name: "idx_users_username", columns: ["username"], type: "UNIQUE", method: "BTREE" },
        { name: "idx_users_created_at", columns: ["created_at"], type: "INDEX", method: "BTREE" }
      ]
    } else if (tableName === 'products') {
      indexes = [
        { name: "idx_products_name", columns: ["name"], type: "INDEX", method: "BTREE" },
        { name: "idx_products_category_id", columns: ["category_id"], type: "INDEX", method: "BTREE" }
      ]
    } else if (tableName === 'orders') {
      indexes = [
        { name: "idx_orders_user_id", columns: ["user_id"], type: "INDEX", method: "BTREE" },
        { name: "idx_orders_status", columns: ["status"], type: "INDEX", method: "BTREE" },
        { name: "idx_orders_created_at", columns: ["created_at"], type: "INDEX", method: "BTREE" }
      ]
    }
    
    // 为所有表添加主键索引
    indexes.unshift({ name: `pk_${tableName}_id`, columns: ["id"], type: "PRIMARY", method: "BTREE" });
    
    return mockResponse(indexes)
  }
  
  return api.get(`/data-model/tables/${databaseId}/${tableName}/indexes`)
}

// 创建索引
export const createIndex = async (databaseId: string, tableName: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟创建索引
    const newIndex = {
      name: data.name,
      columns: data.columns,
      type: data.type,
      method: data.method
    };
    
    return mockResponse({ success: true, indexName: data.name, index: newIndex })
  }
  
  return api.post(`/data-model/tables/${databaseId}/${tableName}/indexes`, data)
}

// 删除索引
export const dropIndex = async (databaseId: string, tableName: string, indexName: string): Promise<ApiResponse<boolean>> => {
  if (useMock()) {
    return mockResponse(true)
  }
  
  return api.delete(`/data-model/tables/${databaseId}/${tableName}/indexes/${indexName}`)
}

// 导入数据
export const importData = async (databaseId: string, tableName: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟导入任务
    return mockResponse({
      id: `import-${Date.now()}`,
      name: data.name || "数据导入",
      source: data.file?.name || "导入文件",
      target: tableName,
      database: databaseId,
      status: "进行中",
      progress: 0,
      rows: 0,
      created: new Date().toISOString().replace('T', ' ').substring(0, 19)
    })
  }
  
  return api.post(`/data-model/import/${databaseId}/${tableName}`, data)
}

// 导出数据
export const exportData = async (databaseId: string, data: any): Promise<ApiResponse<any>> => {
  if (useMock()) {
    // 模拟导出任务
    return mockResponse({
      id: `export-${Date.now()}`,
      name: data.name || "数据导出",
      source: data.source || "users",
      target: data.filename || "export.csv",
      database: databaseId,
      status: "进行中",
      progress: 0,
      rows: 0,
      created: new Date().toISOString().replace('T', ' ').substring(0, 19)
    })
  }
  
  return api.post(`/data-model/export/${databaseId}`, data)
}

// 获取导入/导出任务状态
export const getImportExportTasks = async (): Promise<ApiResponse<any[]>> => {
  if (useMock()) {
    // 模拟导入导出任务列表
    const importTasks = [
      {
        id: "import-001",
        name: "用户数据导入",
        source: "users.csv",
        target: "users",
        database: "postgres-main",
        status: "完成",
        progress: 100,
        rows: 15420,
        created: "2023-05-09 14:30:22",
      },
      {
        id: "import-002",
        name: "产品数据导入",
        source: "products.csv",
        target: "products",
        database: "postgres-main",
        status: "进行中",
        progress: 65,
        rows: 8500,
        created: "2023-05-10 09:15:45",
      },
      {
        id: "import-003",
        name: "订单历史导入",
        source: "orders_history.csv",
        target: "orders",
        database: "postgres-main",
        status: "失败",
        progress: 32,
        rows: 25000,
        created: "2023-05-08 16:42:10",
      },
    ]

    const exportTasks = [
      {
        id: "export-001",
        name: "用户数据导出",
        source: "users",
        target: "users_backup.csv",
        database: "postgres-main",
        status: "完成",
        progress: 100,
        rows: 15420,
        created: "2023-05-07 11:20:15",
      },
      {
        id: "export-002",
        name: "月度报表导出",
        source: "monthly_report",
        target: "report_2023_04.xlsx",
        database: "postgres-analytics",
        status: "完成",
        progress: 100,
        rows: 1250,
        created: "2023-05-01 08:30:00",
      },
    ]
    
    return mockResponse([...importTasks, ...exportTasks])
  }
  
  return api.get('/data-model/tasks')
}