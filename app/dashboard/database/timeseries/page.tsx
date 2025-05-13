"use client"

import { useState, useEffect } from "react"
import { Clock, Search, Filter, MoreHorizontal, Play, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { timeseriesApi } from "@/api"

export default function TimeseriesDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [timeQuery, setTimeQuery] = useState(
    "SELECT mean(cpu_usage) FROM system_metrics WHERE time >= now() - 12h GROUP BY time(1h)",
  )
  const [queryResult, setQueryResult] = useState<any>(null)
  const [databases, setDatabases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queryLoading, setQueryLoading] = useState(false)

  // 获取时序数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true)
        const response = await timeseriesApi.getTimeseriesDatabases()
        if (response.success) {
          setDatabases(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取时序数据库失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDatabases()
  }, [])

  const handleExecuteQuery = async () => {
    try {
      setQueryLoading(true)
      setError(null)
      
      // 使用 API 执行时序查询
      const response = await timeseriesApi.executeTimeseriesQuery("timeseries-01", timeQuery)
      
      if (response.success) {
        setQueryResult(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('执行时序查询失败')
      console.error(err)
    } finally {
      setQueryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">时序数据库管理</h1>
          <p className="text-muted-foreground">管理和查询时间序列数据</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Clock className="mr-2 h-4 w-4" />
            创建时序数据库
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
          <TabsTrigger value="series">时间序列</TabsTrigger>
          <TabsTrigger value="query">数据查询</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索时序数据库..." className="pl-8" />
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
              <div>保留策略</div>
              <div>序列数</div>
              <div>数据点数</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : databases.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无时序数据库</p>
                </div>
              ) : (
                databases.map((db) => (
                  <div key={db.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{db.id}</div>
                    <div>{db.name}</div>
                    <div>{db.retention}</div>
                    <div>{db.series}</div>
                    <div>{db.points}</div>
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
                          <DropdownMenuItem>查看序列</DropdownMenuItem>
                          <DropdownMenuItem>修改保留策略</DropdownMenuItem>
                          <DropdownMenuItem>备份</DropdownMenuItem>
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

        <TabsContent value="series" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="搜索时间序列..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="timeseries-01">
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
              <CardTitle>时间序列列表</CardTitle>
              <CardDescription>监控数据库 (timeseries-01) 中的时间序列</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>序列名称</div>
                    <div>标签</div>
                    <div>数据类型</div>
                    <div>数据点数</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                      <div className="font-medium">cpu_usage</div>
                      <div>
                        <Badge variant="outline" className="mr-1">
                          host=server01
                        </Badge>
                        <Badge variant="outline">region=cn-east</Badge>
                      </div>
                      <div>float</div>
                      <div>2.5M</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          图表
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                      <div className="font-medium">memory_usage</div>
                      <div>
                        <Badge variant="outline" className="mr-1">
                          host=server01
                        </Badge>
                        <Badge variant="outline">region=cn-east</Badge>
                      </div>
                      <div>float</div>
                      <div>2.5M</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          图表
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                      <div className="font-medium">disk_usage</div>
                      <div>
                        <Badge variant="outline" className="mr-1">
                          host=server01
                        </Badge>
                        <Badge variant="outline">region=cn-east</Badge>
                      </div>
                      <div>float</div>
                      <div>2.5M</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          图表
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                      <div className="font-medium">network_in</div>
                      <div>
                        <Badge variant="outline" className="mr-1">
                          host=server01
                        </Badge>
                        <Badge variant="outline">region=cn-east</Badge>
                      </div>
                      <div>float</div>
                      <div>2.5M</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          图表
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                      <div className="font-medium">network_out</div>
                      <div>
                        <Badge variant="outline" className="mr-1">
                          host=server01
                        </Badge>
                        <Badge variant="outline">region=cn-east</Badge>
                      </div>
                      <div>float</div>
                      <div>2.5M</div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                        <Button variant="ghost" size="sm">
                          图表
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时序数据查询</CardTitle>
              <CardDescription>查询和可视化时间序列数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="timeseries-01">
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

              <div className="space-y-2">
                <Label htmlFor="time-query">查询语句</Label>
                <Textarea
                  id="time-query"
                  value={timeQuery}
                  onChange={(e) => setTimeQuery(e.target.value)}
                  className="font-mono min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery} disabled={queryLoading}>
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
                      查询结果: <span className="font-medium">{queryResult.pointCount} 个数据点</span>
                    </div>
                    <div>
                      执行时间: <span className="font-medium">{queryResult.executionTime}</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">查询结果图表</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={queryResult.data}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-2 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                      <div>时间</div>
                      <div>值</div>
                    </div>
                    <div className="divide-y max-h-60 overflow-auto">
                      {queryResult.data.map((point: any, index: number) => (
                        <div key={index} className="grid grid-cols-2 items-center px-4 py-2 text-sm">
                          <div>{point.time}</div>
                          <div>{point.value}</div>
                        </div>
                      ))}
                    </div>
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