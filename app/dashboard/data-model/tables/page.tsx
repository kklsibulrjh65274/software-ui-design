"use client"

import { useState, useEffect } from "react"
import { Table, Database, Search, Filter, MoreHorizontal, Play, Download, AlertTriangle, FileText, Plus, Trash2, RefreshCw, Save } from "lucide-react"

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 导入 API
import { databaseApi, dataModelApi } from "@/api"

export default function DataModelTablesPage() {
  const [activeTab, setActiveTab] = useState("tables")
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isEditTableOpen, setIsEditTableOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [tableStructure, setTableStructure] = useState<any[]>([])
  const [databases, setDatabases] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState({
    databases: true,
    tables: false,
    structure: false
  })
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [tableToDelete, setTableToDelete] = useState<string | null>(null)
  const [newTableData, setNewTableData] = useState({
    name: "",
    fields: [
      { name: "id", type: "integer", length: null, nullable: false, default: "自增", primaryKey: true }
    ]
  })
  const [newFieldData, setNewFieldData] = useState({
    name: "",
    type: "varchar",
    length: "",
    nullable: false,
    default: ""
  })

  // 获取数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(prev => ({ ...prev, databases: true }))
        const response = await databaseApi.getDatabases()
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
          setTables(response.data)
          if (response.data.length > 0 && !selectedTable) {
            setSelectedTable(response.data[0].name)
          }
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

  const handleAddField = () => {
    setNewTableData(prev => ({
      ...prev,
      fields: [...prev.fields, { ...newFieldData }]
    }))
    
    // 重置新字段表单
    setNewFieldData({
      name: "",
      type: "varchar",
      length: "",
      nullable: false,
      default: ""
    })
  }

  const handleRemoveField = (index: number) => {
    // 不允许删除主键字段
    if (newTableData.fields[index].primaryKey) {
      return
    }
    
    setNewTableData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const handleCreateTable = async () => {
    if (!selectedDatabase || !newTableData.name || newTableData.fields.length === 0) {
      setError('表名和至少一个字段是必需的')
      return
    }

    try {
      setLoading(prev => ({ ...prev, tables: true }))
      setError(null)
      
      const response = await dataModelApi.createTable(selectedDatabase, newTableData)
      
      if (response.success) {
        // 添加新表到列表
        setTables(prev => [...prev, response.data.table])
        setIsCreateTableOpen(false)
        // 重置表单
        setNewTableData({
          name: "",
          fields: [
            { name: "id", type: "integer", length: null, nullable: false, default: "自增", primaryKey: true }
          ]
        })
        // 选择新创建的表
        setSelectedTable(response.data.tableName)
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

  const handleDeleteTable = async () => {
    if (!selectedDatabase || !tableToDelete) return

    try {
      setLoading(prev => ({ ...prev, tables: true }))
      setError(null)
      
      const response = await dataModelApi.dropTable(selectedDatabase, tableToDelete)
      
      if (response.success) {
        // 从列表中移除表
        setTables(prev => prev.filter(table => table.name !== tableToDelete))
        if (selectedTable === tableToDelete) {
          setSelectedTable(tables.length > 1 ? tables.find(t => t.name !== tableToDelete)?.name || null : null)
        }
        setIsConfirmDeleteOpen(false)
        setTableToDelete(null)
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

  // 过滤表
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">表结构管理</h1>
          <p className="text-muted-foreground">管理数据库表结构和索引</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedDatabase}>
                <Table className="mr-2 h-4 w-4" />
                创建表
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>创建新表</DialogTitle>
                <DialogDescription>
                  在数据库 {databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中创建新表
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
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>字段</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setNewTableData({
                        ...newTableData,
                        fields: [
                          { name: "id", type: "integer", length: null, nullable: false, default: "自增", primaryKey: true }
                        ]
                      })}
                    >
                      重置字段
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <TableComponent>
                      <TableHeader>
                        <TableRow>
                          <TableHead>字段名</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>长度/精度</TableHead>
                          <TableHead>可空</TableHead>
                          <TableHead>默认值</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newTableData.fields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input 
                                value={field.name} 
                                onChange={(e) => {
                                  const updatedFields = [...newTableData.fields];
                                  updatedFields[index].name = e.target.value;
                                  setNewTableData({...newTableData, fields: updatedFields});
                                }}
                                disabled={field.primaryKey}
                              />
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={field.type}
                                onValueChange={(value) => {
                                  const updatedFields = [...newTableData.fields];
                                  updatedFields[index].type = value;
                                  setNewTableData({...newTableData, fields: updatedFields});
                                }}
                                disabled={field.primaryKey}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="integer">整数 (integer)</SelectItem>
                                  <SelectItem value="bigint">长整数 (bigint)</SelectItem>
                                  <SelectItem value="varchar">可变字符 (varchar)</SelectItem>
                                  <SelectItem value="text">文本 (text)</SelectItem>
                                  <SelectItem value="decimal">小数 (decimal)</SelectItem>
                                  <SelectItem value="boolean">布尔值 (boolean)</SelectItem>
                                  <SelectItem value="date">日期 (date)</SelectItem>
                                  <SelectItem value="timestamp">时间戳 (timestamp)</SelectItem>
                                  <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={field.length || ""} 
                                onChange={(e) => {
                                  const updatedFields = [...newTableData.fields];
                                  updatedFields[index].length = e.target.value;
                                  setNewTableData({...newTableData, fields: updatedFields});
                                }}
                                placeholder={field.type === 'varchar' ? "如: 255" : field.type === 'decimal' ? "如: 10,2" : ""}
                                disabled={field.primaryKey || !['varchar', 'decimal'].includes(field.type)}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox 
                                checked={field.nullable} 
                                onCheckedChange={(checked) => {
                                  const updatedFields = [...newTableData.fields];
                                  updatedFields[index].nullable = checked === true;
                                  setNewTableData({...newTableData, fields: updatedFields});
                                }}
                                disabled={field.primaryKey}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={field.default || ""} 
                                onChange={(e) => {
                                  const updatedFields = [...newTableData.fields];
                                  updatedFields[index].default = e.target.value;
                                  setNewTableData({...newTableData, fields: updatedFields});
                                }}
                                placeholder="默认值"
                                disabled={field.primaryKey}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveField(index)}
                                disabled={field.primaryKey}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>添加新字段</Label>
                  <div className="grid grid-cols-5 gap-2">
                    <Input 
                      placeholder="字段名" 
                      value={newFieldData.name}
                      onChange={(e) => setNewFieldData({...newFieldData, name: e.target.value})}
                    />
                    <Select 
                      value={newFieldData.type}
                      onValueChange={(value) => setNewFieldData({...newFieldData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integer">整数 (integer)</SelectItem>
                        <SelectItem value="bigint">长整数 (bigint)</SelectItem>
                        <SelectItem value="varchar">可变字符 (varchar)</SelectItem>
                        <SelectItem value="text">文本 (text)</SelectItem>
                        <SelectItem value="decimal">小数 (decimal)</SelectItem>
                        <SelectItem value="boolean">布尔值 (boolean)</SelectItem>
                        <SelectItem value="date">日期 (date)</SelectItem>
                        <SelectItem value="timestamp">时间戳 (timestamp)</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder={newFieldData.type === 'varchar' ? "长度 (如: 255)" : newFieldData.type === 'decimal' ? "精度 (如: 10,2)" : ""}
                      value={newFieldData.length}
                      onChange={(e) => setNewFieldData({...newFieldData, length: e.target.value})}
                      disabled={!['varchar', 'decimal'].includes(newFieldData.type)}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="field-nullable" 
                        checked={newFieldData.nullable}
                        onCheckedChange={(checked) => setNewFieldData({...newFieldData, nullable: checked === true})}
                      />
                      <Label htmlFor="field-nullable">可空</Label>
                    </div>
                    <Button type="button" onClick={handleAddField} disabled={!newFieldData.name}>
                      添加字段
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTableOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateTable}>创建表</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={async () => {
            try {
              setLoading(prev => ({ ...prev, tables: true }))
              setError(null)
              const response = await databaseApi.getTables({ database: selectedDatabase })
              if (response.success) {
                setTables(response.data)
              } else {
                setError(response.message)
              }
            } catch (err) {
              setError('刷新表列表失败')
              console.error(err)
            } finally {
              setLoading(prev => ({ ...prev, tables: false }))
            }
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">表列表</TabsTrigger>
          <TabsTrigger value="structure">表结构</TabsTrigger>
          <TabsTrigger value="indexes">索引管理</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="搜索表..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setSearchQuery("")}
              >
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
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
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} ({db.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>表列表</CardTitle>
              <CardDescription>
                {selectedDatabase ? 
                  `${databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中的表` : 
                  "请先选择一个数据库"}
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
                    <h3 className="mt-2 text-lg font-medium">
                      {tables.length === 0 ? "暂无表" : "没有匹配的表"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tables.length === 0 ? "该数据库中没有表，请创建新表" : "尝试使用其他搜索条件"}
                    </p>
                    {tables.length === 0 && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsCreateTableOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        创建第一个表
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>表名</div>
                    <div>类型</div>
                    <div>字段数</div>
                    <div>记录数</div>
                    <div>大小</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {filteredTables.map((table) => (
                      <div key={table.name} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{table.name}</div>
                        <div>
                          <Badge variant="outline">{table.type}</Badge>
                        </div>
                        <div>{table.fields}</div>
                        <div>{table.rows}</div>
                        <div>{table.size}</div>
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
                                <Table className="mr-2 h-4 w-4" />
                                查看结构
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTable(table.name)
                                setActiveTab("indexes")
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                管理索引
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                查询数据
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setTableToDelete(table.name)
                                  setIsConfirmDeleteOpen(true)
                                }}
                              >
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
                      `${selectedTable} 表的结构` : 
                      "请先选择一个表"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedDatabase || ""} 
                    onValueChange={setSelectedDatabase}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择数据库" />
                    </SelectTrigger>
                    <SelectContent>
                      {databases.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedTable || ""} 
                    onValueChange={setSelectedTable}
                    disabled={!selectedDatabase || tables.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={
                        !selectedDatabase 
                          ? "请先选择数据库" 
                          : tables.length === 0 
                            ? "无可用表" 
                            : "选择表"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={async () => {
                      if (!selectedDatabase || !selectedTable) return
                      
                      try {
                        setLoading(prev => ({ ...prev, structure: true }))
                        setError(null)
                        const response = await dataModelApi.getTableStructure(selectedDatabase, selectedTable)
                        if (response.success) {
                          setTableStructure(response.data)
                        } else {
                          setError(response.message)
                        }
                      } catch (err) {
                        setError('刷新表结构失败')
                        console.error(err)
                      } finally {
                        setLoading(prev => ({ ...prev, structure: false }))
                      }
                    }}
                    disabled={!selectedDatabase || !selectedTable}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">刷新</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个表</p>
                  </div>
                </div>
              ) : loading.structure ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tableStructure.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">无表结构数据</h3>
                    <p className="mt-1 text-sm text-muted-foreground">无法获取表结构信息</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>字段名</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>长度/精度</TableHead>
                        <TableHead>可空</TableHead>
                        <TableHead>默认值</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableStructure.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{field.name}</TableCell>
                          <TableCell>{field.type}</TableCell>
                          <TableCell>{field.length || "-"}</TableCell>
                          <TableCell>{field.nullable ? "是" : "否"}</TableCell>
                          <TableCell>{field.default || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableComponent>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {tableStructure.length > 0 && `共 ${tableStructure.length} 个字段`}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditTableOpen(true)}
                  disabled={!selectedTable || tableStructure.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加字段
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // 导出表结构为 SQL
                    if (!tableStructure.length) return
                    
                    let sql = `CREATE TABLE ${selectedTable} (\n`
                    tableStructure.forEach((field, index) => {
                      sql += `  ${field.name} ${field.type}`
                      if (field.length) sql += `(${field.length})`
                      if (!field.nullable) sql += " NOT NULL"
                      if (field.default) sql += ` DEFAULT ${field.default}`
                      if (index < tableStructure.length - 1) sql += ",\n"
                      else sql += "\n"
                    })
                    sql += ");"
                    
                    // 创建下载链接
                    const blob = new Blob([sql], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${selectedTable}_structure.sql`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  disabled={!selectedTable || tableStructure.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  导出 SQL
                </Button>
              </div>
            </CardFooter>
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
                      `${selectedTable} 表的索引` : 
                      "请先选择一个表"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedDatabase || ""} 
                    onValueChange={setSelectedDatabase}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择数据库" />
                    </SelectTrigger>
                    <SelectContent>
                      {databases.map((db) => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedTable || ""} 
                    onValueChange={setSelectedTable}
                    disabled={!selectedDatabase || tables.length === 0}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={
                        !selectedDatabase 
                          ? "请先选择数据库" 
                          : tables.length === 0 
                            ? "无可用表" 
                            : "选择表"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    disabled={!selectedDatabase || !selectedTable}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    添加索引
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个表</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>索引名</TableHead>
                        <TableHead>字段</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>方法</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">加载索引数据...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </TableComponent>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 确认删除对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除表</DialogTitle>
            <DialogDescription>
              您确定要删除表 "{tableToDelete}" 吗？此操作不可撤销，将永久删除该表及其所有数据。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>危险操作</AlertTitle>
              <AlertDescription>
                删除表将永久移除所有存储的数据、索引和约束。此操作无法恢复。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteTable}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑表结构对话框 */}
      <Dialog open={isEditTableOpen} onOpenChange={setIsEditTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑表结构</DialogTitle>
            <DialogDescription>
              修改表 "{selectedTable}" 的结构
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>注意</AlertTitle>
              <AlertDescription>
                修改表结构可能会影响现有数据。请确保您了解所做更改的影响。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTableOpen(false)}>
              取消
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}