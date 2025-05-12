"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Database,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Download,
  AlertTriangle
} from "lucide-react"

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

// 导入 API
import { databaseApi } from "@/api"

export default function RelationalDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [selectedDatabase, setSelectedDatabase] = useState("postgres-main")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [databases, setDatabases] = useState<any[]>([])
  const [loadingDatabases, setLoadingDatabases] = useState(true)

  // 获取数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoadingDatabases(true)
        const response = await databaseApi.relationalApi.getRelationalDatabases()
        if (response.success) {
          setDatabases(response.data)
        } else {
          setError(response.message || "获取数据库列表失败")
        }
      } catch (err) {
        console.error("获取数据库列表出错:", err)
        setError("获取数据库列表时发生错误")
      } finally {
        setLoadingDatabases(false)
      }
    }

    fetchDatabases()
  }, [])

  const handleExecuteQuery = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 使用 API 执行查询
      const response = await databaseApi.relationalApi.executeSQLQuery(selectedDatabase, sqlQuery)
      
      if (response.success) {
        setQueryResult(response.data)
      } else {
        setError(response.message || "查询执行失败")
      }
    } catch (err) {
      console.error("执行查询出错:", err)
      setError("执行查询时发生错误")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadQuery = () => {
    if (!queryResult) {
      setError("没有可下载的查询结果")
      return
    }

    try {
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
      link.setAttribute('download', `query-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("下载查询结果出错:", err)
      setError("下载查询结果时发生错误")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">关系型数据库管理</h1>
          <p className="text-muted-foreground">管理和查询关系型数据库</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Database className="mr-2 h-4 w-4" />
            创建数据库
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
          <TabsTrigger value="databases">数据库列表</TabsTrigger>
          <TabsTrigger value="tables">表管理</TabsTrigger>
          <TabsTrigger value="query">SQL 查询</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索数据库..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>字符集</div>
              <div>排序规则</div>
              <div>大小</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loadingDatabases ? (
                <div className="py-8 text-center">加载中...</div>
              ) : databases.length === 0 ? (
                <div className="py-8 text-center">暂无数据库</div>
              ) : (
                databases.map((db) => (
                  <div key={db.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{db.id}</div>
                    <div>{db.name}</div>
                    <div>{db.charset}</div>
                    <div>{db.collation}</div>
                    <div>
                      {db.size}
                      <Badge variant="outline" className="ml-2">
                        {db.tables} 个表
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
                          <DropdownMenuItem>查看表</DropdownMenuItem>
                          <DropdownMenuItem>备份</DropdownMenuItem>
                          <DropdownMenuItem>复制</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="搜索表..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button>
                <Table className="mr-2 h-4 w-4" />
                创建表
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>表管理</CardTitle>
              <CardDescription>请先选择一个数据库</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
              <div className="text-center">
                <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                <p className="mt-1 text-sm text-muted-foreground">请从数据库列表中选择一个数据库来管理表</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL 查询工具</CardTitle>
              <CardDescription>执行 SQL 查询并查看结果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="选择数据库" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDatabases ? (
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
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadQuery} 
                  disabled={!queryResult}
                  title="下载查询结果"
                >
                   <Download className="h-4 w-4" />
                   <span className="sr-only">下载</span>
                </Button>
              </div>

              <Textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="font-mono min-h-[200px]"
                placeholder="输入 SQL 查询语句..."
              />

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Play className="mr-2 h-4 w-4 animate-pulse" />
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      查询结果: <span className="font-medium">{queryResult.rowCount} 行</span>
                    </div>
                    <div>
                      执行时间: <span className="font-medium">{queryResult.executionTime}</span>
                    </div>
                  </div>

                  <div className="rounded-md border overflow-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          {queryResult.columns.map((column: string) => (
                            <th key={column} className="px-4 py-3 text-left text-sm font-medium">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {queryResult.rows.map((row: any, index: number) => (
                          <tr key={index}>
                            {queryResult.columns.map((column: string) => (
                              <td key={column} className="px-4 py-3 text-sm">
                                {row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleDownloadQuery}>
                      <Download className="mr-2 h-4 w-4" />
                      下载结果
                    </Button>
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