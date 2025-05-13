"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Database,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Download,
  AlertTriangle,
  Edit,
  Trash2,
  FileText,
  Key,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { databaseApi, dataModelApi } from "@/api"

export default function RelationalTablesPage() {
  const [searchTable, setSearchTable] = useState("")
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableStructure, setTableStructure] = useState<any[]>([])
  const [tableIndexes, setTableIndexes] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState({
    databases: true,
    tables: false,
    structure: false,
    indexes: false
  })
  const [error, setError] = useState<string | null>(null)
  const [databases, setDatabases] = useState<any[]>([])
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isCreateIndexOpen, setIsCreateIndexOpen] = useState(false)
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tables")
  const [newTableData, setNewTableData] = useState({
    name: "",
    fields: [
      {
        name: "",
        type: "varchar",
        length: "50",
        nullable: false,
        default: ""
      }
    ]
  })
  const [newIndexData, setNewIndexData] = useState({
    name: "",
    columns: [""],
    type: "INDEX",
    method: "BTREE"
  })
  const [newFieldData, setNewFieldData] = useState({
    name: "",
    type: "varchar",
    length: "50",
    nullable: false,
    default: ""
  })

  // 获取数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(prev => ({ ...prev, databases: true }))
        const response = await databaseApi.relationalApi.getRelationalDatabases()
        if (response.success) {
          setDatabases(response.data)
          if (response.data.length > 0 && !selectedDatabase) {
            setSelectedDatabase(response.data[0].id)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取数据库列表失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, databases: false }))
      }
    }

    fetchDatabases()
  }, [])

  // 获取表列表
  useEffect(() => {
    if (!selectedDatabase) return

    const fetchTables = async () => {
      try {
        setLoading(prev => ({ ...prev, tables: true }))
        const response = await databaseApi.getTables({ database: selectedDatabase })
        if (response.success) {
          setTables(response.data.filter((table: any) => table.database === selectedDatabase))
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取表列表失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, tables: false }))
      }
    }

    fetchTables()
  }, [selectedDatabase])

  // 获取表结构
  useEffect(() => {
    if (!selectedDatabase || !selectedTable) return

    const fetchTableStructure = async () => {
      try {
        setLoading(prev => ({ ...prev, structure: true }))
        const response = await dataModelApi.getTableStructure(selectedDatabase, selectedTable)
        if (response.success) {
          setTableStructure(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取表结构失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, structure: false }))
      }
    }

    fetchTableStructure()
  }, [selectedDatabase, selectedTable])

  // 获取表索引
  useEffect(() => {
    if (!selectedDatabase || !selectedTable) return

    const fetchTableIndexes = async () => {
      try {
        setLoading(prev => ({ ...prev, indexes: true }))
        const response = await dataModelApi.getTableIndexes(selectedDatabase, selectedTable)
        if (response.success) {
          setTableIndexes(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取表索引失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, indexes: false }))
      }
    }

    fetchTableIndexes()
  }, [selectedDatabase, selectedTable])

  // 创建表
  const handleCreateTable = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }

    if (!newTableData.name) {
      setError('表名不能为空')
      return
    }

    if (!newTableData.fields[0].name) {
      setError('至少需要一个字段且字段名不能为空')
      return
    }

    try {
      setLoading(prev => ({ ...prev, tables: true }))
      
      // 准备表数据，确保包含ID字段作为主键
      const tableData = {
        name: newTableData.name,
        fields: [
          {
            name: "id",
            type: "integer",
            nullable: false,
            default: "自增"
          },
          ...newTableData.fields
        ]
      }

      const response = await dataModelApi.createTable(selectedDatabase, tableData)
      if (response.success) {
        // 刷新表列表
        const tablesResponse = await databaseApi.getTables({ database: selectedDatabase })
        if (tablesResponse.success) {
          setTables(tablesResponse.data.filter((table: any) => table.database === selectedDatabase))
        }
        setIsCreateTableOpen(false)
        // 重置表单
        setNewTableData({
          name: "",
          fields: [
            {
              name: "",
              type: "varchar",
              length: "50",
              nullable: false,
              default: ""
            }
          ]
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建表失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, tables: false }))
    }
  }

  // 创建索引
  const handleCreateIndex = async () => {
    if (!selectedDatabase || !selectedTable) {
      setError('请先选择数据库和表')
      return
    }

    if (!newIndexData.name || !newIndexData.columns[0]) {
      setError('索引名称和字段不能为空')
      return
    }

    try {
      setLoading(prev => ({ ...prev, indexes: true }))
      
      const indexData = {
        name: newIndexData.name,
        columns: newIndexData.columns,
        type: newIndexData.type,
        method: newIndexData.method
      }

      const response = await dataModelApi.createIndex(selectedDatabase, selectedTable, indexData)
      if (response.success) {
        // 刷新索引列表
        const indexesResponse = await dataModelApi.getTableIndexes(selectedDatabase, selectedTable)
        if (indexesResponse.success) {
          setTableIndexes(indexesResponse.data)
        }
        setIsCreateIndexOpen(false)
        // 重置表单
        setNewIndexData({
          name: "",
          columns: [""],
          type: "INDEX",
          method: "BTREE"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建索引失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, indexes: false }))
    }
  }

  // 添加字段
  const handleAddField = async () => {
    if (!selectedDatabase || !selectedTable) {
      setError('请先选择数据库和表')
      return
    }

    if (!newFieldData.name) {
      setError('字段名不能为空')
      return
    }

    try {
      setLoading(prev => ({ ...prev, structure: true }))
      
      // 准备修改表结构的数据
      const alterData = {
        action: "ADD_COLUMN",
        column: newFieldData
      }

      const response = await dataModelApi.alterTable(selectedDatabase, selectedTable, alterData)
      if (response.success) {
        // 刷新表结构
        const structureResponse = await dataModelApi.getTableStructure(selectedDatabase, selectedTable)
        if (structureResponse.success) {
          setTableStructure(structureResponse.data)
        }
        setIsAddFieldOpen(false)
        // 重置表单
        setNewFieldData({
          name: "",
          type: "varchar",
          length: "50",
          nullable: false,
          default: ""
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('添加字段失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, structure: false }))
    }
  }

  // 删除表
  const handleDropTable = async (tableName: string) => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }

    if (!confirm(`确定要删除表 ${tableName} 吗？此操作不可恢复！`)) {
      return
    }

    try {
      setLoading(prev => ({ ...prev, tables: true }))
      
      const response = await dataModelApi.dropTable(selectedDatabase, tableName)
      if (response.success) {
        // 刷新表列表
        const tablesResponse = await databaseApi.getTables({ database: selectedDatabase })
        if (tablesResponse.success) {
          setTables(tablesResponse.data.filter((table: any) => table.database === selectedDatabase))
        }
        if (selectedTable === tableName) {
          setSelectedTable(null)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除表失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, tables: false }))
    }
  }

  // 删除索引
  const handleDropIndex = async (indexName: string) => {
    if (!selectedDatabase || !selectedTable) {
      setError('请先选择数据库和表')
      return
    }

    if (!confirm(`确定要删除索引 ${indexName} 吗？`)) {
      return
    }

    try {
      setLoading(prev => ({ ...prev, indexes: true }))
      
      const response = await dataModelApi.dropIndex(selectedDatabase, selectedTable, indexName)
      if (response.success) {
        // 刷新索引列表
        const indexesResponse = await dataModelApi.getTableIndexes(selectedDatabase, selectedTable)
        if (indexesResponse.success) {
          setTableIndexes(indexesResponse.data)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除索引失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, indexes: false }))
    }
  }

  // 添加表单字段
  const addTableField = () => {
    setNewTableData({
      ...newTableData,
      fields: [
        ...newTableData.fields,
        {
          name: "",
          type: "varchar",
          length: "50",
          nullable: false,
          default: ""
        }
      ]
    })
  }

  // 更新表单字段
  const updateTableField = (index: number, field: string, value: any) => {
    const updatedFields = [...newTableData.fields]
    updatedFields[index] = { ...updatedFields[index], [field]: value }
    setNewTableData({ ...newTableData, fields: updatedFields })
  }

  // 删除表单字段
  const removeTableField = (index: number) => {
    if (newTableData.fields.length <= 1) {
      return // 保留至少一个字段
    }
    const updatedFields = newTableData.fields.filter((_, i) => i !== index)
    setNewTableData({ ...newTableData, fields: updatedFields })
  }

  // 过滤表
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTable.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href="/dashboard/database/relational">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回数据库列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">表管理</h1>
            <p className="text-muted-foreground">管理关系型数据库表结构</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
            <DialogTrigger asChild>
              <Button>
                <Table className="mr-2 h-4 w-4" />
                创建表
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>创建新表</DialogTitle>
                <DialogDescription>
                  在数据库中创建一个新表。表将自动包含一个自增的 ID 字段作为主键。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="table-name" className="text-right">
                    表名
                  </Label>
                  <Input
                    id="table-name"
                    value={newTableData.name}
                    onChange={(e) => setNewTableData({...newTableData, name: e.target.value})}
                    placeholder="输入表名"
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">表字段</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addTableField}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加字段
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {newTableData.fields.map((field, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
                        <div className="col-span-3">
                          <Label htmlFor={`field-name-${index}`} className="mb-1 block">
                            字段名
                          </Label>
                          <Input
                            id={`field-name-${index}`}
                            value={field.name}
                            onChange={(e) => updateTableField(index, 'name', e.target.value)}
                            placeholder="字段名"
                            required
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor={`field-type-${index}`} className="mb-1 block">
                            数据类型
                          </Label>
                          <Select 
                            value={field.type} 
                            onValueChange={(value) => updateTableField(index, 'type', value)}
                          >
                            <SelectTrigger id={`field-type-${index}`}>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="varchar">VARCHAR</SelectItem>
                              <SelectItem value="integer">INTEGER</SelectItem>
                              <SelectItem value="text">TEXT</SelectItem>
                              <SelectItem value="decimal">DECIMAL</SelectItem>
                              <SelectItem value="timestamp">TIMESTAMP</SelectItem>
                              <SelectItem value="boolean">BOOLEAN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor={`field-length-${index}`} className="mb-1 block">
                            长度/精度
                          </Label>
                          <Input
                            id={`field-length-${index}`}
                            value={field.length}
                            onChange={(e) => updateTableField(index, 'length', e.target.value)}
                            placeholder="例如：50 或 10,2"
                            disabled={field.type === 'text' || field.type === 'boolean'}
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <Label htmlFor={`field-default-${index}`} className="mb-1 block">
                            默认值
                          </Label>
                          <Input
                            id={`field-default-${index}`}
                            value={field.default}
                            onChange={(e) => updateTableField(index, 'default', e.target.value)}
                            placeholder="默认值（可选）"
                          />
                        </div>
                        
                        <div className="col-span-1 flex flex-col items-center justify-end pt-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`field-nullable-${index}`} 
                              checked={field.nullable}
                              onCheckedChange={(checked) => updateTableField(index, 'nullable', checked)}
                            />
                            <Label htmlFor={`field-nullable-${index}`} className="text-xs">
                              可空
                            </Label>
                          </div>
                        </div>
                        
                        <div className="col-span-1 flex items-center justify-center pt-6">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeTableField(index)}
                            disabled={newTableData.fields.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateTableOpen(false)}>
                  取消
                </Button>
                <Button type="button" onClick={handleCreateTable} disabled={!newTableData.name || !newTableData.fields[0].name}>
                  创建表
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="搜索表..." 
              className="pl-8" 
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">筛选</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedDatabase || ""} 
            onValueChange={setSelectedDatabase}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="选择数据库" />
            </SelectTrigger>
            <SelectContent>
              {loading.databases ? (
                <SelectItem value="loading" disabled>加载中...</SelectItem>
              ) : (
                databases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.name} ({db.id})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">表列表</TabsTrigger>
          <TabsTrigger value="structure">表结构</TabsTrigger>
          <TabsTrigger value="indexes">索引管理</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据库表</CardTitle>
              <CardDescription>
                {selectedDatabase ? 
                  `${databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中的表` : 
                  "请选择一个数据库"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDatabase ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个数据库</p>
                  </div>
                </div>
              ) : loading.tables ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">暂无表数据</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTable ? "没有找到匹配的表" : "该数据库中没有表，请创建新表"}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateTableOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个表
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>表名</div>
                    <div>类型</div>
                    <div>字段数</div>
                    <div>行数</div>
                    <div>大小</div>
                    <div>索引数</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {filteredTables.map((table) => (
                      <div key={table.name} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{table.name}</div>
                        <div>
                          <Badge variant="outline">{table.type}</Badge>
                        </div>
                        <div>{table.fields}</div>
                        <div>{table.rows}</div>
                        <div>{table.size}</div>
                        <div>{table.indexes}</div>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>表操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedTable(table.name)
                                setActiveTab("structure")
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                查看结构
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTable(table.name)
                                setActiveTab("indexes")
                              }}>
                                <Key className="mr-2 h-4 w-4" />
                                管理索引
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDropTable(table.name)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除表
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>表结构</CardTitle>
                  <CardDescription>
                    {selectedTable ? 
                      `${selectedDatabase} / ${selectedTable}` : 
                      "请选择一个表查看结构"}
                  </CardDescription>
                </div>
                {selectedTable && (
                  <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        添加字段
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加新字段</DialogTitle>
                        <DialogDescription>
                          向表 {selectedTable} 添加一个新字段
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="field-name" className="text-right">
                            字段名
                          </Label>
                          <Input
                            id="field-name"
                            value={newFieldData.name}
                            onChange={(e) => setNewFieldData({...newFieldData, name: e.target.value})}
                            placeholder="输入字段名"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="field-type" className="text-right">
                            数据类型
                          </Label>
                          <Select 
                            value={newFieldData.type}
                            onValueChange={(value) => setNewFieldData({...newFieldData, type: value})}
                          >
                            <SelectTrigger id="field-type" className="col-span-3">
                              <SelectValue placeholder="选择数据类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="varchar">VARCHAR</SelectItem>
                              <SelectItem value="integer">INTEGER</SelectItem>
                              <SelectItem value="text">TEXT</SelectItem>
                              <SelectItem value="decimal">DECIMAL</SelectItem>
                              <SelectItem value="timestamp">TIMESTAMP</SelectItem>
                              <SelectItem value="boolean">BOOLEAN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="field-length" className="text-right">
                            长度/精度
                          </Label>
                          <Input
                            id="field-length"
                            value={newFieldData.length}
                            onChange={(e) => setNewFieldData({...newFieldData, length: e.target.value})}
                            placeholder="例如：50 或 10,2"
                            className="col-span-3"
                            disabled={newFieldData.type === 'text' || newFieldData.type === 'boolean'}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="field-default" className="text-right">
                            默认值
                          </Label>
                          <Input
                            id="field-default"
                            value={newFieldData.default}
                            onChange={(e) => setNewFieldData({...newFieldData, default: e.target.value})}
                            placeholder="默认值（可选）"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="text-right">
                            <Label htmlFor="field-nullable">允许空值</Label>
                          </div>
                          <div className="col-span-3 flex items-center space-x-2">
                            <Checkbox 
                              id="field-nullable" 
                              checked={newFieldData.nullable}
                              onCheckedChange={(checked) => 
                                setNewFieldData({...newFieldData, nullable: checked === true})
                              }
                            />
                            <Label htmlFor="field-nullable">允许 NULL 值</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddFieldOpen(false)}>
                          取消
                        </Button>
                        <Button type="button" onClick={handleAddField} disabled={!newFieldData.name}>
                          添加字段
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从表列表中选择一个表查看结构</p>
                  </div>
                </div>
              ) : loading.structure ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tableStructure.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">暂无表结构数据</h3>
                    <p className="mt-1 text-sm text-muted-foreground">该表可能为空或无法获取结构信息</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>字段名</div>
                    <div>数据类型</div>
                    <div>长度/精度</div>
                    <div>允许空值</div>
                    <div>默认值</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {tableStructure.map((field, index) => (
                      <div key={index} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{field.name}</div>
                        <div>{field.type}</div>
                        <div>{field.length || "-"}</div>
                        <div>{field.nullable ? "是" : "否"}</div>
                        <div>{field.default || "-"}</div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">编辑</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>索引管理</CardTitle>
                  <CardDescription>
                    {selectedTable ? 
                      `${selectedDatabase} / ${selectedTable} 的索引` : 
                      "请选择一个表管理索引"}
                  </CardDescription>
                </div>
                {selectedTable && (
                  <Dialog open={isCreateIndexOpen} onOpenChange={setIsCreateIndexOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        创建索引
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>创建新索引</DialogTitle>
                        <DialogDescription>
                          为表 {selectedTable} 创建一个新索引以提高查询性能。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="index-name" className="text-right">
                            索引名称
                          </Label>
                          <Input
                            id="index-name"
                            value={newIndexData.name}
                            onChange={(e) => setNewIndexData({...newIndexData, name: e.target.value})}
                            placeholder="输入索引名称"
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="index-column" className="text-right">
                            索引字段
                          </Label>
                          <Select 
                            value={newIndexData.columns[0]} 
                            onValueChange={(value) => setNewIndexData({...newIndexData, columns: [value]})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="选择字段" />
                            </SelectTrigger>
                            <SelectContent>
                              {tableStructure.map((field, index) => (
                                <SelectItem key={index} value={field.name}>
                                  {field.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="index-type" className="text-right">
                            索引类型
                          </Label>
                          <Select 
                            value={newIndexData.type}
                            onValueChange={(value) => setNewIndexData({...newIndexData, type: value})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="选择索引类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INDEX">普通索引</SelectItem>
                              <SelectItem value="UNIQUE">唯一索引</SelectItem>
                              <SelectItem value="PRIMARY">主键</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="index-method" className="text-right">
                            索引方法
                          </Label>
                          <Select 
                            value={newIndexData.method}
                            onValueChange={(value) => setNewIndexData({...newIndexData, method: value})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="选择索引方法" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BTREE">B-Tree</SelectItem>
                              <SelectItem value="HASH">Hash</SelectItem>
                              <SelectItem value="GIST">GiST</SelectItem>
                              <SelectItem value="GIN">GIN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateIndexOpen(false)}>
                          取消
                        </Button>
                        <Button type="button" onClick={handleCreateIndex} disabled={!newIndexData.name || !newIndexData.columns[0]}>
                          创建索引
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从表列表中选择一个表管理索引</p>
                  </div>
                </div>
              ) : loading.indexes ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tableIndexes.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">暂无索引</h3>
                    <p className="mt-1 text-sm text-muted-foreground">该表没有索引，点击"创建索引"按钮添加</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateIndexOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个索引
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>索引名称</div>
                    <div>字段</div>
                    <div>类型</div>
                    <div>方法</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {tableIndexes.map((index, i) => (
                      <div key={i} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{index.name}</div>
                        <div>{index.columns.join(", ")}</div>
                        <div>
                          <Badge variant={index.type === "UNIQUE" ? "secondary" : "outline"}>
                            {index.type}
                          </Badge>
                        </div>
                        <div>{index.method}</div>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDropIndex(index.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">删除</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}