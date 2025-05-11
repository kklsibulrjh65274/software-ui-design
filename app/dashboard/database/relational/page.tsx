"use client"

import { useState } from "react"
import { Table, Database, Search, Filter, MoreHorizontal, Play, Download, Upload } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"

const databases = [
  { id: "postgres-main", name: "主数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "1.2 TB", tables: 42 },
  {
    id: "postgres-replica",
    name: "副本数据库",
    charset: "UTF-8",
    collation: "en_US.UTF-8",
    size: "1.1 TB",
    tables: 42,
  },
  { id: "postgres-dev", name: "开发数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "800 GB", tables: 38 },
  { id: "postgres-test", name: "测试数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "750 GB", tables: 35 },
  {
    id: "postgres-analytics",
    name: "分析数据库",
    charset: "UTF-8",
    collation: "en_US.UTF-8",
    size: "2.1 TB",
    tables: 28,
  },
]

export default function RelationalDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResult, setQueryResult] = useState<any>(null)

  const handleExecuteQuery = () => {
    // 模拟查询结果
    setQueryResult({
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
              {databases.map((db) => (
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
              ))}
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
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="postgres-main">主数据库 (postgres-main)</option>
                  <option value="postgres-replica">副本数据库 (postgres-replica)</option>
                  <option value="postgres-dev">开发数据库 (postgres-dev)</option>
                  <option value="postgres-test">测试数据库 (postgres-test)</option>
                  <option value="postgres-analytics">分析数据库 (postgres-analytics)</option>
                </select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">下载</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">上传</span>
                </Button>
              </div>

              <Textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="font-mono min-h-[200px]"
              />

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery}>
                  <Play className="mr-2 h-4 w-4" />
                  执行查询
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
