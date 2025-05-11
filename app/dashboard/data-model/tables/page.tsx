"use client"

import { useState } from "react"
import { Table, Search, Filter, MoreHorizontal, Plus, Database } from "lucide-react"

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

const tables = [
  {
    name: "users",
    database: "postgres-main",
    type: "关系型",
    fields: 12,
    rows: "1.2M",
    size: "245 MB",
    indexes: 3,
  },
  {
    name: "orders",
    database: "postgres-main",
    type: "关系型",
    fields: 15,
    rows: "5.8M",
    size: "1.2 GB",
    indexes: 4,
  },
  {
    name: "products",
    database: "postgres-main",
    type: "关系型",
    fields: 18,
    rows: "250K",
    size: "180 MB",
    indexes: 2,
  },
  {
    name: "metrics",
    database: "timeseries-01",
    type: "时序型",
    fields: 8,
    rows: "45M",
    size: "3.5 GB",
    indexes: 2,
  },
  {
    name: "embeddings",
    database: "vector-search",
    type: "向量型",
    fields: 5,
    rows: "1.5M",
    size: "2.8 GB",
    indexes: 1,
  },
]

export default function DataModelTablesPage() {
  const [activeTab, setActiveTab] = useState("tables")
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const handleViewTable = (tableName: string) => {
    setSelectedTable(tableName)
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
              {tables.map((table) => (
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
                        <DropdownMenuItem onClick={() => handleViewTable(table.name)}>查看结构</DropdownMenuItem>
                        <DropdownMenuItem>查看数据</DropdownMenuItem>
                        <DropdownMenuItem>管理索引</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">删除表</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
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
                          {table.name === "users" && (
                            <>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>自增</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">username</div>
                                <div>varchar</div>
                                <div>50</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">email</div>
                                <div>varchar</div>
                                <div>100</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">password_hash</div>
                                <div>varchar</div>
                                <div>255</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">created_at</div>
                                <div>timestamp</div>
                                <div>-</div>
                                <div>否</div>
                                <div>CURRENT_TIMESTAMP</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {table.name === "products" && (
                            <>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>自增</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">name</div>
                                <div>varchar</div>
                                <div>100</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">description</div>
                                <div>text</div>
                                <div>-</div>
                                <div>是</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">price</div>
                                <div>decimal</div>
                                <div>10,2</div>
                                <div>否</div>
                                <div>0.00</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">category_id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {table.name === "metrics" && (
                            <>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">time</div>
                                <div>timestamp</div>
                                <div>-</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">host</div>
                                <div>varchar</div>
                                <div>50</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">cpu_usage</div>
                                <div>float</div>
                                <div>-</div>
                                <div>是</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">memory_usage</div>
                                <div>float</div>
                                <div>-</div>
                                <div>是</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {table.name === "embeddings" && (
                            <>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>自增</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">text</div>
                                <div>text</div>
                                <div>-</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">embedding</div>
                                <div>vector</div>
                                <div>1536</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {table.name === "orders" && (
                            <>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>自增</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">user_id</div>
                                <div>integer</div>
                                <div>-</div>
                                <div>否</div>
                                <div>-</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">status</div>
                                <div>varchar</div>
                                <div>20</div>
                                <div>否</div>
                                <div>'pending'</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">total_amount</div>
                                <div>decimal</div>
                                <div>10,2</div>
                                <div>否</div>
                                <div>0.00</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                                <div className="font-medium">created_at</div>
                                <div>timestamp</div>
                                <div>-</div>
                                <div>否</div>
                                <div>CURRENT_TIMESTAMP</div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    编辑
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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
