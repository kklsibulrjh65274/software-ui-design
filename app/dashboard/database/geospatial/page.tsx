"use client"

import { useState, useEffect } from "react"
import { Map, Search, Filter, MoreHorizontal, Play, Layers, AlertTriangle, Plus, Download, Trash2, Database, Globe } from "lucide-react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

// 导入 API
import { geospatialApi } from "@/api"

export default function GeospatialDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [geoQuery, setGeoQuery] = useState(
    "SELECT name, ST_AsText(geom) FROM cities WHERE ST_DWithin(geom, ST_MakePoint(116.4, 39.9), 50000);"
  )
  const [queryResult, setQueryResult] = useState<any>(null)
  const [databases, setDatabases] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState({
    databases: true,
    tables: false,
    query: false,
    visualization: false
  })
  const [error, setError] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDatabaseOpen, setIsCreateDatabaseOpen] = useState(false)
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [databaseToDelete, setDatabaseToDelete] = useState<string | null>(null)
  const [tableToDelete, setTableToDelete] = useState<string | null>(null)
  const [mapData, setMapData] = useState<any>(null)
  const [isLoadingMap, setIsLoadingMap] = useState(false)
  
  // 新数据库表单数据
  const [newDatabaseData, setNewDatabaseData] = useState({
    name: "",
    description: "",
    srid: "EPSG:4326"
  })
  
  // 新表单数据
  const [newTableData, setNewTableData] = useState({
    name: "",
    geometryType: "POINT",
    srid: "EPSG:4326",
    columns: [
      { name: "id", type: "serial", isPrimary: true },
      { name: "name", type: "varchar", length: 100, nullable: false },
      { name: "description", type: "text", nullable: true }
    ]
  })

  // 获取地理空间数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(prev => ({ ...prev, databases: true }))
        const response = await geospatialApi.getGeospatialDatabases()
        if (response.success) {
          setDatabases(response.data)
          if (response.data.length > 0 && !selectedDatabase) {
            setSelectedDatabase(response.data[0].id)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取地理空间数据库失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, databases: false }))
      }
    }

    fetchDatabases()
  }, [])

  // 获取空间表列表
  useEffect(() => {
    if (!selectedDatabase) return
    
    const fetchTables = async () => {
      try {
        setLoading(prev => ({ ...prev, tables: true }))
        const response = await geospatialApi.getGeospatialTables(selectedDatabase)
        if (response.success) {
          setTables(response.data)
          if (response.data.length > 0 && !selectedTable) {
            setSelectedTable(response.data[0].name)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取空间表失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, tables: false }))
      }
    }

    fetchTables()
  }, [selectedDatabase])

  const handleExecuteQuery = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }
    
    try {
      setQueryLoading(true)
      setError(null)
      
      // 使用 API 执行空间查询
      const response = await geospatialApi.executeGeospatialQuery(selectedDatabase, geoQuery)
      
      if (response.success) {
        setQueryResult(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('执行空间查询失败')
      console.error(err)
    } finally {
      setQueryLoading(false)
    }
  }
  
  const handleCreateDatabase = async () => {
    if (!newDatabaseData.name) {
      setError('数据库名称不能为空')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, databases: true }))
      setError(null)
      
      const response = await geospatialApi.createGeospatialDatabase(newDatabaseData)
      
      if (response.success) {
        setDatabases([...databases, response.data])
        setIsCreateDatabaseOpen(false)
        setNewDatabaseData({
          name: "",
          description: "",
          srid: "EPSG:4326"
        })
      } else {
        setError(response.message || '创建数据库失败')
      }
    } catch (err) {
      setError('创建数据库失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, databases: false }))
    }
  }
  
  const handleCreateTable = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }
    
    if (!newTableData.name) {
      setError('表名不能为空')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, tables: true }))
      setError(null)
      
      const response = await geospatialApi.createGeospatialTable(selectedDatabase, newTableData)
      
      if (response.success) {
        setTables([...tables, response.data])
        setIsCreateTableOpen(false)
        setNewTableData({
          name: "",
          geometryType: "POINT",
          srid: "EPSG:4326",
          columns: [
            { name: "id", type: "serial", isPrimary: true },
            { name: "name", type: "varchar", length: 100, nullable: false },
            { name: "description", type: "text", nullable: true }
          ]
        })
      } else {
        setError(response.message || '创建表失败')
      }
    } catch (err) {
      setError('创建表失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, tables: false }))
    }
  }
  
  const handleDeleteDatabase = async () => {
    if (!databaseToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, databases: true }))
      setError(null)
      
      // 模拟删除数据库
      setTimeout(() => {
        setDatabases(databases.filter(db => db.id !== databaseToDelete))
        if (selectedDatabase === databaseToDelete) {
          setSelectedDatabase(databases.length > 1 ? databases.find(db => db.id !== databaseToDelete)?.id || null : null)
        }
        setIsConfirmDeleteOpen(false)
        setDatabaseToDelete(null)
        setLoading(prev => ({ ...prev, databases: false }))
      }, 1000)
    } catch (err) {
      setError('删除数据库失败')
      console.error(err)
      setLoading(prev => ({ ...prev, databases: false }))
    }
  }
  
  const handleDeleteTable = async () => {
    if (!selectedDatabase || !tableToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, tables: true }))
      setError(null)
      
      // 模拟删除表
      setTimeout(() => {
        setTables(tables.filter(table => table.name !== tableToDelete))
        if (selectedTable === tableToDelete) {
          setSelectedTable(tables.length > 1 ? tables.find(table => table.name !== tableToDelete)?.name || null : null)
        }
        setIsConfirmDeleteOpen(false)
        setTableToDelete(null)
        setLoading(prev => ({ ...prev, tables: false }))
      }, 1000)
    } catch (err) {
      setError('删除表失败')
      console.error(err)
      setLoading(prev => ({ ...prev, tables: false }))
    }
  }
  
  const handleLoadMapData = async () => {
    if (!selectedDatabase || !selectedTable) {
      setError('请先选择数据库和表')
      return
    }
    
    try {
      setIsLoadingMap(true)
      setError(null)
      
      const response = await geospatialApi.getMapVisualizationData(selectedDatabase, selectedTable)
      
      if (response.success) {
        setMapData(response.data)
      } else {
        setError(response.message || '加载地图数据失败')
      }
    } catch (err) {
      setError('加载地图数据失败')
      console.error(err)
    } finally {
      setIsLoadingMap(false)
    }
  }
  
  // 添加列
  const addColumn = () => {
    setNewTableData({
      ...newTableData,
      columns: [
        ...newTableData.columns,
        { name: "", type: "varchar", length: 100, nullable: true }
      ]
    })
  }
  
  // 更新列
  const updateColumn = (index: number, field: string, value: any) => {
    const updatedColumns = [...newTableData.columns]
    updatedColumns[index] = { ...updatedColumns[index], [field]: value }
    setNewTableData({ ...newTableData, columns: updatedColumns })
  }
  
  // 删除列
  const removeColumn = (index: number) => {
    // 不允许删除主键列
    if (newTableData.columns[index].isPrimary) return
    
    const updatedColumns = newTableData.columns.filter((_, i) => i !== index)
    setNewTableData({ ...newTableData, columns: updatedColumns })
  }
  
  // 过滤数据库
  const filteredDatabases = databases.filter(db => 
    db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    db.id.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // 过滤表
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">地理空间数据库管理</h1>
          <p className="text-muted-foreground">管理和查询地理空间数据</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDatabaseOpen} onOpenChange={setIsCreateDatabaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Map className="mr-2 h-4 w-4" />
                创建地理空间数据库
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新地理空间数据库</DialogTitle>
                <DialogDescription>创建一个新的地理空间数据库实例</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-name" className="text-right">
                    数据库名称
                  </Label>
                  <Input
                    id="db-name"
                    value={newDatabaseData.name}
                    onChange={(e) => setNewDatabaseData({ ...newDatabaseData, name: e.target.value })}
                    placeholder="输入数据库名称"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-description" className="text-right">
                    描述
                  </Label>
                  <Input
                    id="db-description"
                    value={newDatabaseData.description}
                    onChange={(e) => setNewDatabaseData({ ...newDatabaseData, description: e.target.value })}
                    placeholder="输入数据库描述"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-srid" className="text-right">
                    空间参考系统
                  </Label>
                  <Select
                    value={newDatabaseData.srid}
                    onValueChange={(value) => setNewDatabaseData({ ...newDatabaseData, srid: value })}
                  >
                    <SelectTrigger id="db-srid" className="col-span-3">
                      <SelectValue placeholder="选择空间参考系统" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EPSG:4326">WGS 84 (EPSG:4326)</SelectItem>
                      <SelectItem value="EPSG:3857">Web Mercator (EPSG:3857)</SelectItem>
                      <SelectItem value="EPSG:2436">北京1954 (EPSG:2436)</SelectItem>
                      <SelectItem value="EPSG:4490">CGCS2000 (EPSG:4490)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDatabaseOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateDatabase}>创建数据库</Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="databases">数据库列表</TabsTrigger>
          <TabsTrigger value="tables">空间表</TabsTrigger>
          <TabsTrigger value="query">空间查询</TabsTrigger>
          <TabsTrigger value="visualization">地图可视化</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索地理空间数据库..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
              <Filter className="h-4 w-4" />
              <span className="sr-only">重置筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>表数量</div>
              <div>大小</div>
              <div>状态</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading.databases ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : filteredDatabases.length === 0 ? (
                <div className="py-8 text-center">
                  <Map className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {databases.length === 0 ? "暂无地理空间数据库" : "没有匹配的数据库"}
                  </p>
                  {databases.length === 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateDatabaseOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个地理空间数据库
                    </Button>
                  )}
                </div>
              ) : (
                filteredDatabases.map((db) => (
                  <div key={db.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{db.id}</div>
                    <div>{db.name}</div>
                    <div>{db.tables}</div>
                    <div>{db.size}</div>
                    <div>
                      <Badge variant={db.status === "正常" ? "success" : "warning"}>
                        {db.status}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>数据库操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("tables")
                          }}>
                            查看表
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("query")
                          }}>
                            执行查询
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("visualization")
                          }}>
                            地图可视化
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setDatabaseToDelete(db.id)
                              setIsConfirmDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除数据库
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="搜索空间表..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={selectedDatabase || ""} 
                onValueChange={setSelectedDatabase}
                disabled={loading.databases}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={loading.databases ? "加载中..." : "选择数据库"} />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} ({db.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedDatabase}>
                    <Layers className="mr-2 h-4 w-4" />
                    创建空间表
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>创建新空间表</DialogTitle>
                    <DialogDescription>在地理空间数据库中创建一个新的空间表</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="table-name" className="text-right">
                        表名
                      </Label>
                      <Input
                        id="table-name"
                        value={newTableData.name}
                        onChange={(e) => setNewTableData({ ...newTableData, name: e.target.value })}
                        placeholder="输入表名"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="geometry-type" className="text-right">
                        几何类型
                      </Label>
                      <Select
                        value={newTableData.geometryType}
                        onValueChange={(value) => setNewTableData({ ...newTableData, geometryType: value })}
                      >
                        <SelectTrigger id="geometry-type" className="col-span-3">
                          <SelectValue placeholder="选择几何类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POINT">点 (POINT)</SelectItem>
                          <SelectItem value="LINESTRING">线 (LINESTRING)</SelectItem>
                          <SelectItem value="POLYGON">面 (POLYGON)</SelectItem>
                          <SelectItem value="MULTIPOINT">多点 (MULTIPOINT)</SelectItem>
                          <SelectItem value="MULTILINESTRING">多线 (MULTILINESTRING)</SelectItem>
                          <SelectItem value="MULTIPOLYGON">多面 (MULTIPOLYGON)</SelectItem>
                          <SelectItem value="GEOMETRYCOLLECTION">几何集合 (GEOMETRYCOLLECTION)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="table-srid" className="text-right">
                        空间参考系统
                      </Label>
                      <Select
                        value={newTableData.srid}
                        onValueChange={(value) => setNewTableData({ ...newTableData, srid: value })}
                      >
                        <SelectTrigger id="table-srid" className="col-span-3">
                          <SelectValue placeholder="选择空间参考系统" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EPSG:4326">WGS 84 (EPSG:4326)</SelectItem>
                          <SelectItem value="EPSG:3857">Web Mercator (EPSG:3857)</SelectItem>
                          <SelectItem value="EPSG:2436">北京1954 (EPSG:2436)</SelectItem>
                          <SelectItem value="EPSG:4490">CGCS2000 (EPSG:4490)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>表字段</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                          <Plus className="mr-2 h-4 w-4" />
                          添加字段
                        </Button>
                      </div>
                      
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-2 text-sm font-medium">
                          <div className="col-span-3">字段名</div>
                          <div className="col-span-3">数据类型</div>
                          <div className="col-span-2">长度/精度</div>
                          <div className="col-span-2">可空</div>
                          <div className="col-span-2">操作</div>
                        </div>
                        <div className="divide-y">
                          {newTableData.columns.map((column, index) => (
                            <div key={index} className="grid grid-cols-12 items-center px-4 py-2 text-sm">
                              <div className="col-span-3">
                                <Input
                                  value={column.name}
                                  onChange={(e) => updateColumn(index, 'name', e.target.value)}
                                  placeholder="字段名"
                                  disabled={column.isPrimary} // 主键不可修改
                                />
                              </div>
                              <div className="col-span-3">
                                <Select
                                  value={column.type}
                                  onValueChange={(value) => updateColumn(index, 'type', value)}
                                  disabled={column.isPrimary} // 主键不可修改
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="选择类型" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="serial">自增ID (serial)</SelectItem>
                                    <SelectItem value="integer">整数 (integer)</SelectItem>
                                    <SelectItem value="bigint">长整数 (bigint)</SelectItem>
                                    <SelectItem value="varchar">字符串 (varchar)</SelectItem>
                                    <SelectItem value="text">文本 (text)</SelectItem>
                                    <SelectItem value="numeric">数值 (numeric)</SelectItem>
                                    <SelectItem value="boolean">布尔值 (boolean)</SelectItem>
                                    <SelectItem value="date">日期 (date)</SelectItem>
                                    <SelectItem value="timestamp">时间戳 (timestamp)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <Input
                                  value={column.length || ""}
                                  onChange={(e) => updateColumn(index, 'length', e.target.value)}
                                  placeholder="长度"
                                  disabled={column.isPrimary || !['varchar', 'numeric'].includes(column.type)}
                                />
                              </div>
                              <div className="col-span-2 flex items-center justify-center">
                                <Checkbox
                                  checked={column.nullable}
                                  onCheckedChange={(checked) => updateColumn(index, 'nullable', checked)}
                                  disabled={column.isPrimary} // 主键不可为空
                                />
                              </div>
                              <div className="col-span-2 flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeColumn(index)}
                                  disabled={column.isPrimary} // 主键不可删除
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        注意：表将自动包含一个名为 "geom" 的几何字段，用于存储空间数据。
                      </p>
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
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>空间表列表</CardTitle>
              <CardDescription>
                {selectedDatabase 
                  ? `${databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中的空间表` 
                  : "请选择一个数据库"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDatabase ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个地理空间数据库</p>
                  </div>
                </div>
              ) : loading.tables ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Map className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">
                      {tables.length === 0 ? "暂无空间表" : "没有匹配的空间表"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tables.length === 0 ? "该数据库中没有空间表" : "尝试使用其他搜索条件"}
                    </p>
                    {tables.length === 0 && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsCreateTableOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        创建第一个空间表
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>表名</div>
                    <div>几何类型</div>
                    <div>空间参考</div>
                    <div>记录数</div>
                    <div>索引</div>
                    <div>大小</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {filteredTables.map((table) => (
                      <div key={table.name} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{table.name}</div>
                        <div>{table.geometryType}</div>
                        <div>{table.srid}</div>
                        <div>{table.records.toLocaleString()}</div>
                        <div>
                          <Badge variant="outline">{table.indexType}</Badge>
                        </div>
                        <div>{(table.records * 0.5 / 1000).toFixed(2)} MB</div>
                        <div className="flex justify-end gap-2">
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
                                setGeoQuery(`SELECT * FROM ${table.name} LIMIT 10;`)
                                setActiveTab("query")
                              }}>
                                查询数据
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTable(table.name)
                                setActiveTab("visualization")
                              }}>
                                地图可视化
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

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>空间查询工具</CardTitle>
              <CardDescription>执行空间 SQL 查询</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select 
                  value={selectedDatabase || ""} 
                  onValueChange={setSelectedDatabase}
                  disabled={loading.databases}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={loading.databases ? "加载中..." : "选择数据库"} />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name} ({db.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedTable || ""} 
                  onValueChange={(value) => {
                    setSelectedTable(value)
                    setGeoQuery(`SELECT * FROM ${value} LIMIT 10;`)
                  }}
                  disabled={loading.tables || !selectedDatabase || tables.length === 0}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={
                      loading.tables 
                        ? "加载中..." 
                        : !selectedDatabase 
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="geo-query">查询语句</Label>
                <Textarea
                  id="geo-query"
                  value={geoQuery}
                  onChange={(e) => setGeoQuery(e.target.value)}
                  className="font-mono min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  提示：使用 PostGIS 函数如 ST_Distance、ST_DWithin、ST_Intersects 等进行空间查询
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery} disabled={queryLoading || !selectedDatabase}>
                  {queryLoading ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-spin" />
                      执行中...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      执行查询
                    </>
                  )}
                </Button>
              </div>

              {queryResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      查询结果: <span className="font-medium">{queryResult.rowCount || queryResult.rows?.length || 0} 行</span>
                    </div>
                    <div>
                      执行时间: <span className="font-medium">{queryResult.executionTime}</span>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                      {queryResult.columns.map((column: string) => (
                        <div key={column}>{column}</div>
                      ))}
                    </div>
                    <div className="divide-y max-h-[400px] overflow-auto">
                      {queryResult.rows.map((row: any, index: number) => (
                        <div key={index} className="grid grid-cols-3 items-center px-4 py-3 text-sm">
                          <div className="font-medium">{row.name}</div>
                          <div>{row.type}</div>
                          <div className="font-mono text-xs">{row.coordinates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => {
                      // 将查询结果转换为 CSV 格式
                      const headers = queryResult.columns.join(',')
                      const rows = queryResult.rows.map((row: any) => 
                        queryResult.columns.map((col: string) => `"${row[col]}"`).join(',')
                      ).join('\n')
                      const csvContent = `${headers}\n${rows}`
                      
                      // 创建 Blob 对象
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                      
                      // 创建下载链接并触发下载
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.setAttribute('download', `spatial-query-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      导出结果
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>地图可视化</CardTitle>
              <CardDescription>在地图上可视化空间数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Select 
                  value={selectedDatabase || ""} 
                  onValueChange={(value) => {
                    setSelectedDatabase(value)
                    setMapData(null) // 清除地图数据
                  }}
                  disabled={loading.databases}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={loading.databases ? "加载中..." : "选择数据库"} />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name} ({db.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={selectedTable || ""} 
                  onValueChange={(value) => {
                    setSelectedTable(value)
                    setMapData(null) // 清除地图数据
                  }}
                  disabled={loading.tables || !selectedDatabase || tables.length === 0}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={
                      loading.tables 
                        ? "加载中..." 
                        : !selectedDatabase 
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
                  onClick={handleLoadMapData}
                  disabled={!selectedDatabase || !selectedTable || isLoadingMap}
                >
                  {isLoadingMap ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      加载数据
                    </>
                  )}
                </Button>
              </div>

              <div className="border rounded-md h-[500px] flex items-center justify-center bg-muted/20 relative">
                {isLoadingMap ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">加载地图数据中...</p>
                  </div>
                ) : mapData ? (
                  <div className="absolute inset-0 p-4">
                    <div className="bg-white rounded-md p-4 shadow-md max-w-xs">
                      <h3 className="font-medium mb-2">地图数据已加载</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        已加载 {mapData.features.length} 个空间要素
                      </p>
                      <div className="space-y-2">
                        {mapData.features.map((feature: any, index: number) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span>{feature.properties.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {feature.geometry.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white rounded-md p-2 shadow-md">
                      <p className="text-xs text-muted-foreground">
                        注：实际地图渲染需要集成地图库如 Leaflet 或 Mapbox
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Map className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">地图可视化</h3>
                    <p className="mt-1 text-sm text-muted-foreground">选择数据库和表，然后点击"加载数据"按钮</p>
                  </div>
                )}
              </div>
              
              {mapData && (
                <div className="mt-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">地图控制</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">缩放级别</Label>
                          <Select defaultValue="10">
                            <SelectTrigger>
                              <SelectValue placeholder="选择缩放级别" />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(15)].map((_, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">底图</Label>
                          <Select defaultValue="osm">
                            <SelectTrigger>
                              <SelectValue placeholder="选择底图" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="osm">OpenStreetMap</SelectItem>
                              <SelectItem value="satellite">卫星影像</SelectItem>
                              <SelectItem value="terrain">地形图</SelectItem>
                              <SelectItem value="dark">暗色地图</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">样式</Label>
                          <Select defaultValue="default">
                            <SelectTrigger>
                              <SelectValue placeholder="选择样式" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">默认样式</SelectItem>
                              <SelectItem value="heatmap">热力图</SelectItem>
                              <SelectItem value="cluster">聚合图</SelectItem>
                              <SelectItem value="choropleth">分级统计图</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">标签</Label>
                          <Select defaultValue="name">
                            <SelectTrigger>
                              <SelectValue placeholder="选择标签字段" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">名称</SelectItem>
                              <SelectItem value="id">ID</SelectItem>
                              <SelectItem value="none">不显示</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setMapData(null)}>
                        清除地图
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 确认删除数据库对话框 */}
      <Dialog open={isConfirmDeleteOpen && databaseToDelete !== null} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除数据库</DialogTitle>
            <DialogDescription>
              您确定要删除此地理空间数据库吗？此操作不可撤销，将永久删除数据库及其所有表和数据。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除数据库将永久移除其中的所有表和数据。此操作无法撤销。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteDatabase}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除表对话框 */}
      <Dialog open={isConfirmDeleteOpen && tableToDelete !== null} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除表</DialogTitle>
            <DialogDescription>
              您确定要删除表 "{tableToDelete}" 吗？此操作不可撤销，将永久删除表及其所有数据。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除表将永久移除其中的所有数据。此操作无法撤销。
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
    </div>
  )
}