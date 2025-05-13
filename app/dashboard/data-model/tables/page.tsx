"use client"

import { useState, useEffect } from "react"
import { Table, Search, Filter, MoreHorizontal, Plus, Database, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { dataModelApi, databaseApi } from "@/api"

export default function DataModelTablesPage() {
  const [activeTab, setActiveTab] = useState("tables")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [tableStructure, setTableStructure] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState({
    tables: true,
    structure: false
  })
  const [error, setError] = useState<string | null>(null)

  // 获取表列表
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(prev => ({ ...prev, tables: true }))
        const response = await databaseApi.getTables()
        if (response.success) {
          setTables(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取表数据失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, tables: false }))
      }
    }

    fetchTables()
  }, [])

  // 获取表结构
  useEffect(() => {
    const fetchTableStructure = async () => {
      if (!selectedTable || !selectedDatabase) return
      
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
  }, [selectedTable, selectedDatabase])

  const handleViewTable = (tableName: string, databaseId: string) => {
    setSelectedTable(tableName)
    setSelectedDatabase(databaseId)
    setActiveTab("structure")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">表结构管理</h1>
          <p className="text-muted-foreground">管理数据库表结构</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Table className="mr-2 h-4 w-4" />
            创建表
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索表..." className="pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择数据库类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="relational">关系型</SelectItem>
                <SelectItem value="timeseries">时序型</SelectItem>
                <SelectItem value="vector">向量型</SelectItem>
                <SelectItem value="geospatial">地理空间型</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>表名</div>
              <div>数据库</div>
              <div>类型</div>
              <div>字段数</div>
              <div>行数</div>
              <div>大小</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading.tables ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : tables.length === 0 ? (
                <div className="py-8 text-center">
                  <Table className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无表数据</p>
                </div>
              ) : (
                tables.map((table) => (
                  <div key={table.name} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{table.name}</div>
                    <div>{table.database}</div>
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
                          <DropdownMenuItem onClick={() => handleViewTable(table.name, table.database)}>查看结构</DropdownMenuItem>
                          <DropdownMenuItem>查看数据</DropdownMenuItem>
                          <DropdownMenuItem>管理索引</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除表</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          {selectedTable ? (
            (() => {
              const table = tables.find((t) => t.name === selectedTable)
              if (!table) return null

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="h-5 w-5" />
                      <h2 className="text-xl font-semibold">{table.name}</h2>
                      <Badge variant="outline">{table.type}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        添加字段
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>表结构</CardTitle>
                      <CardDescription>
                        {table.database} / {table.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading.structure ? (
                        <div className="py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">加载中...</p>
                        </div>
                      ) : tableStructure.length === 0 ? (
                        <div className="py-8 text-center">
                          <Database className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">暂无表结构数据</p>
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
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )
            })()
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-60">
                <div className="text-center">
                  <Table className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                  <p className="mt-1 text-sm text-muted-foreground">请从表列表中选择一个表查看结构</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="indexes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Select defaultValue="select-db">
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="选择数据库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-db">选择数据库</SelectItem>
                  <SelectItem value="postgres-main">主数据库 (postgres-main)</SelectItem>
                  <SelectItem value="timeseries-01">监控数据库 (timeseries-01)</SelectItem>
                  <SelectItem value="vector-search">搜索引擎 (vector-search)</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="select-table">
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="选择表" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-table">选择表</SelectItem>
                  <SelectItem value="users">用户表 (users)</SelectItem>
                  <SelectItem value="orders">订单表 (orders)</SelectItem>
                  <SelectItem value="products">产品表 (products)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建索引
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>索引管理</CardTitle>
              <CardDescription>请先选择数据库和表</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-60">
              <div className="text-center">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">未选择表</h3>
                <p className="mt-1 text-sm text-muted-foreground">请选择一个数据库和表来管理索引</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}