"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Plus,
  Save,
  RefreshCw,
  BarChart,
  AlertTriangle,
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
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
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
import { timeseriesApi } from "@/api"
import { TimeSeries, RetentionPolicy } from "@/mock/dashboard/types"

export default function TimeseriesDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [isCreateDatabaseOpen, setIsCreateDatabaseOpen] = useState(false)
  const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false)
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false)
  const [timeseriesQuery, setTimeseriesQuery] = useState(
    "SELECT mean(value) FROM cpu_usage WHERE time > now() - 1h GROUP BY time(5m)"
  )
  const [queryResult, setQueryResult] = useState<any>(null)
  const [databases, setDatabases] = useState<any[]>([])
  const [series, setSeries] = useState<TimeSeries[]>([])
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null)
  const [loading, setLoading] = useState({
    databases: true,
    series: false,
    policies: false,
    query: false,
    metrics: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [newDatabaseData, setNewDatabaseData] = useState({
    name: "",
    retention: "30天",
  })
  const [newSeriesData, setNewSeriesData] = useState({
    name: "",
    type: "float",
    tags: [{ key: "host", value: "server01" }],
  })
  const [newPolicyData, setNewPolicyData] = useState({
    name: "",
    duration: "30d",
    replication: 1,
    default: false,
  })
  const [timeRange, setTimeRange] = useState("24h")

  // 获取时序数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading((prev) => ({ ...prev, databases: true }))
        setError(null)
        const response = await timeseriesApi.getTimeseriesDatabases()
        if (response.success) {
          setDatabases(response.data)
          if (response.data.length > 0 && !selectedDatabase) {
            setSelectedDatabase(response.data[0].id)
          }
        } else {
          setError(response.message || "获取时序数据库失败")
        }
      } catch (err) {
        console.error("获取时序数据库出错:", err)
        setError("获取时序数据库失败")
      } finally {
        setLoading((prev) => ({ ...prev, databases: false }))
      }
    }

    fetchDatabases()
  }, [])

  // 获取时间序列列表
  useEffect(() => {
    if (!selectedDatabase) return

    const fetchSeries = async () => {
      try {
        setLoading((prev) => ({ ...prev, series: true }))
        setError(null)
        const response = await timeseriesApi.getTimeseries(selectedDatabase)
        if (response.success) {
          setSeries(response.data)
        } else {
          setError(response.message || "获取时间序列失败")
        }
      } catch (err) {
        console.error("获取时间序列出错:", err)
        setError("获取时间序列失败")
      } finally {
        setLoading((prev) => ({ ...prev, series: false }))
      }
    }

    fetchSeries()
  }, [selectedDatabase])

  // 获取保留策略列表
  useEffect(() => {
    if (!selectedDatabase) return

    const fetchPolicies = async () => {
      try {
        setLoading((prev) => ({ ...prev, policies: true }))
        setError(null)
        const response = await timeseriesApi.getRetentionPolicies(selectedDatabase)
        if (response.success) {
          setRetentionPolicies(response.data)
        } else {
          setError(response.message || "获取保留策略失败")
        }
      } catch (err) {
        console.error("获取保留策略出错:", err)
        setError("获取保留策略失败")
      } finally {
        setLoading((prev) => ({ ...prev, policies: false }))
      }
    }

    fetchPolicies()
  }, [selectedDatabase])

  // 获取性能指标
  useEffect(() => {
    if (!selectedDatabase || activeTab !== "performance") return

    const fetchPerformanceMetrics = async () => {
      try {
        setLoading((prev) => ({ ...prev, metrics: true }))
        setError(null)
        const response = await timeseriesApi.getTimeseriesDatabaseMetrics(selectedDatabase, timeRange)
        if (response.success) {
          setPerformanceMetrics(response.data)
        } else {
          setError(response.message || "获取数据库性能指标失败")
        }
      } catch (err) {
        console.error("获取数据库性能指标出错:", err)
        setError("获取数据库性能指标失败")
      } finally {
        setLoading((prev) => ({ ...prev, metrics: false }))
      }
    }

    fetchPerformanceMetrics()
  }, [selectedDatabase, activeTab, timeRange])

  // 执行时序查询
  const handleExecuteQuery = async () => {
    if (!selectedDatabase) {
      setError("请先选择数据库")
      return
    }

    try {
      setLoading((prev) => ({ ...prev, query: true }))
      setError(null)
      const response = await timeseriesApi.executeTimeseriesQuery(selectedDatabase, timeseriesQuery)
      if (response.success) {
        setQueryResult(response.data)
      } else {
        setError(response.message || "执行查询失败")
      }
    } catch (err) {
      console.error("执行查询出错:", err)
      setError("执行查询失败")
    } finally {
      setLoading((prev) => ({ ...prev, query: false }))
    }
  }

  // 创建时序数据库
  const handleCreateDatabase = async () => {
    if (!newDatabaseData.name) {
      setError("数据库名称不能为空")
      return
    }

    try {
      setLoading((prev) => ({ ...prev, databases: true }))
      setError(null)
      const response = await timeseriesApi.createTimeseriesDatabase({
        name: newDatabaseData.name,
        retention: newDatabaseData.retention,
      })
      if (response.success) {
        setDatabases([...databases, response.data])
        setIsCreateDatabaseOpen(false)
        setNewDatabaseData({
          name: "",
          retention: "30天",
        })
      } else {
        setError(response.message || "创建数据库失败")
      }
    } catch (err) {
      console.error("创建数据库出错:", err)
      setError("创建数据库失败")
    } finally {
      setLoading((prev) => ({ ...prev, databases: false }))
    }
  }

  // 创建时间序列
  const handleCreateSeries = async () => {
    if (!selectedDatabase) {
      setError("请先选择数据库")
      return
    }

    if (!newSeriesData.name) {
      setError("序列名称不能为空")
      return
    }

    try {
      setLoading((prev) => ({ ...prev, series: true }))
      setError(null)
      const response = await timeseriesApi.createTimeseries(selectedDatabase, newSeriesData)
      if (response.success) {
        setSeries([...series, response.data])
        setIsCreateSeriesOpen(false)
        setNewSeriesData({
          name: "",
          type: "float",
          tags: [{ key: "host", value: "server01" }],
        })
      } else {
        setError(response.message || "创建时间序列失败")
      }
    } catch (err) {
      console.error("创建时间序列出错:", err)
      setError("创建时间序列失败")
    } finally {
      setLoading((prev) => ({ ...prev, series: false }))
    }
  }

  // 创建保留策略
  const handleCreatePolicy = async () => {
    if (!selectedDatabase) {
      setError("请先选择数据库")
      return
    }

    if (!newPolicyData.name) {
      setError("策略名称不能为空")
      return
    }

    try {
      setLoading((prev) => ({ ...prev, policies: true }))
      setError(null)
      const response = await timeseriesApi.createRetentionPolicy(selectedDatabase, newPolicyData)
      if (response.success) {
        setRetentionPolicies([...retentionPolicies, response.data])
        setIsCreatePolicyOpen(false)
        setNewPolicyData({
          name: "",
          duration: "30d",
          replication: 1,
          default: false,
        })
      } else {
        setError(response.message || "创建保留策略失败")
      }
    } catch (err) {
      console.error("创建保留策略出错:", err)
      setError("创建保留策略失败")
    } finally {
      setLoading((prev) => ({ ...prev, policies: false }))
    }
  }

  // 添加标签
  const addTag = () => {
    setNewSeriesData({
      ...newSeriesData,
      tags: [...newSeriesData.tags, { key: "", value: "" }],
    })
  }

  // 更新标签
  const updateTag = (index: number, field: "key" | "value", value: string) => {
    const updatedTags = [...newSeriesData.tags]
    updatedTags[index][field] = value
    setNewSeriesData({
      ...newSeriesData,
      tags: updatedTags,
    })
  }

  // 移除标签
  const removeTag = (index: number) => {
    if (newSeriesData.tags.length <= 1) return
    const updatedTags = newSeriesData.tags.filter((_, i) => i !== index)
    setNewSeriesData({
      ...newSeriesData,
      tags: updatedTags,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">时序数据库管理</h1>
          <p className="text-muted-foreground">管理和查询时序数据库</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDatabaseOpen} onOpenChange={setIsCreateDatabaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Clock className="mr-2 h-4 w-4" />
                创建时序数据库
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新时序数据库</DialogTitle>
                <DialogDescription>创建一个新的时序数据库实例</DialogDescription>
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
                  <Label htmlFor="db-retention" className="text-right">
                    默认保留策略
                  </Label>
                  <Select
                    value={newDatabaseData.retention}
                    onValueChange={(value) => setNewDatabaseData({ ...newDatabaseData, retention: value })}
                  >
                    <SelectTrigger id="db-retention" className="col-span-3">
                      <SelectValue placeholder="选择保留策略" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30天">30天</SelectItem>
                      <SelectItem value="90天">90天</SelectItem>
                      <SelectItem value="180天">180天</SelectItem>
                      <SelectItem value="365天">365天</SelectItem>
                      <SelectItem value="永久">永久</SelectItem>
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
          <TabsTrigger value="series">时间序列</TabsTrigger>
          <TabsTrigger value="query">时序查询</TabsTrigger>
          <TabsTrigger value="retention">保留策略</TabsTrigger>
          <TabsTrigger value="performance">性能监控</TabsTrigger>
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
              {loading.databases ? (
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
                          <DropdownMenuItem onClick={() => setSelectedDatabase(db.id)}>查看详情</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("series")
                          }}>
                            管理序列
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("query")
                          }}>
                            执行查询
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("retention")
                          }}>
                            保留策略
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除数据库</DropdownMenuItem>
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
              <Select value={selectedDatabase || ""} onValueChange={setSelectedDatabase}>
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
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="搜索时间序列..." className="pl-8" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateSeriesOpen} onOpenChange={setIsCreateSeriesOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedDatabase}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建时间序列
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新时间序列</DialogTitle>
                    <DialogDescription>在数据库中创建一个新的时间序列</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="series-name" className="text-right">
                        序列名称
                      </Label>
                      <Input
                        id="series-name"
                        value={newSeriesData.name}
                        onChange={(e) => setNewSeriesData({ ...newSeriesData, name: e.target.value })}
                        placeholder="输入序列名称"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="series-type" className="text-right">
                        数据类型
                      </Label>
                      <Select
                        value={newSeriesData.type}
                        onValueChange={(value) => setNewSeriesData({ ...newSeriesData, type: value })}
                      >
                        <SelectTrigger id="series-type" className="col-span-3">
                          <SelectValue placeholder="选择数据类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="float">浮点数 (float)</SelectItem>
                          <SelectItem value="integer">整数 (integer)</SelectItem>
                          <SelectItem value="string">字符串 (string)</SelectItem>
                          <SelectItem value="boolean">布尔值 (boolean)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">标签</Label>
                      <div className="col-span-3 space-y-2">
                        {newSeriesData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="键"
                              value={tag.key}
                              onChange={(e) => updateTag(index, "key", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="值"
                              value={tag.value}
                              onChange={(e) => updateTag(index, "value", e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTag(index)}
                              disabled={newSeriesData.tags.length <= 1}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addTag}>
                          <Plus className="mr-2 h-4 w-4" />
                          添加标签
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateSeriesOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateSeries}>创建序列</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>时间序列列表</CardTitle>
              <CardDescription>
                {selectedDatabase
                  ? `${databases.find((db) => db.id === selectedDatabase)?.name || selectedDatabase} 中的时间序列`
                  : "请选择一个数据库"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDatabase ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个时序数据库</p>
                  </div>
                </div>
              ) : loading.series ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : series.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">暂无时间序列</h3>
                    <p className="mt-1 text-sm text-muted-foreground">该数据库中没有时间序列，请创建新序列</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsCreateSeriesOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个时间序列
                    </Button>
                  </div>
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
                    {series.map((s, index) => (
                      <div key={index} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {s.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline">
                                {tag.key}={tag.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>{s.type}</div>
                        <div>{s.points}</div>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>序列操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setTimeseriesQuery(`SELECT * FROM ${s.name} LIMIT 10`)
                                setActiveTab("query")
                              }}>
                                查询数据
                              </DropdownMenuItem>
                              <DropdownMenuItem>查看详情</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">删除序列</DropdownMenuItem>
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
              <CardTitle>时序查询工具</CardTitle>
              <CardDescription>执行时序查询语言 (InfluxQL) 查询</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={selectedDatabase || ""} onValueChange={setSelectedDatabase}>
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
                <Label htmlFor="timeseries-query">查询语句</Label>
                <Textarea
                  id="timeseries-query"
                  value={timeseriesQuery}
                  onChange={(e) => setTimeseriesQuery(e.target.value)}
                  className="font-mono min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery} disabled={loading.query || !selectedDatabase}>
                  {loading.query ? (
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

                  <div className="h-[300px]">
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
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-2 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                      <div>时间</div>
                      <div>值</div>
                    </div>
                    <div className="divide-y max-h-[200px] overflow-auto">
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

        <TabsContent value="retention" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Select value={selectedDatabase || ""} onValueChange={setSelectedDatabase}>
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
            <div className="flex items-center gap-2">
              <Dialog open={isCreatePolicyOpen} onOpenChange={setIsCreatePolicyOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedDatabase}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建保留策略
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新保留策略</DialogTitle>
                    <DialogDescription>为数据库创建一个新的数据保留策略</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-name" className="text-right">
                        策略名称
                      </Label>
                      <Input
                        id="policy-name"
                        value={newPolicyData.name}
                        onChange={(e) => setNewPolicyData({ ...newPolicyData, name: e.target.value })}
                        placeholder="输入策略名称"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-duration" className="text-right">
                        保留时长
                      </Label>
                      <Select
                        value={newPolicyData.duration}
                        onValueChange={(value) => setNewPolicyData({ ...newPolicyData, duration: value })}
                      >
                        <SelectTrigger id="policy-duration" className="col-span-3">
                          <SelectValue placeholder="选择保留时长" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1小时</SelectItem>
                          <SelectItem value="1d">1天</SelectItem>
                          <SelectItem value="7d">7天</SelectItem>
                          <SelectItem value="30d">30天</SelectItem>
                          <SelectItem value="90d">90天</SelectItem>
                          <SelectItem value="365d">365天</SelectItem>
                          <SelectItem value="INF">永久</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-replication" className="text-right">
                        复制因子
                      </Label>
                      <Input
                        id="policy-replication"
                        type="number"
                        min="1"
                        max="3"
                        value={newPolicyData.replication}
                        onChange={(e) =>
                          setNewPolicyData({ ...newPolicyData, replication: parseInt(e.target.value) || 1 })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-default" className="text-right">
                        设为默认
                      </Label>
                      <div className="flex items-center col-span-3">
                        <input
                          type="checkbox"
                          id="policy-default"
                          checked={newPolicyData.default}
                          onChange={(e) => setNewPolicyData({ ...newPolicyData, default: e.target.checked })}
                          className="mr-2"
                        />
                        <Label htmlFor="policy-default">设为默认保留策略</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePolicyOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreatePolicy}>创建策略</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>保留策略列表</CardTitle>
              <CardDescription>
                {selectedDatabase
                  ? `${databases.find((db) => db.id === selectedDatabase)?.name || selectedDatabase} 的保留策略`
                  : "请选择一个数据库"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDatabase ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                    <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个时序数据库</p>
                  </div>
                </div>
              ) : loading.policies ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : retentionPolicies.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">暂无保留策略</h3>
                    <p className="mt-1 text-sm text-muted-foreground">该数据库中没有保留策略，请创建新策略</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsCreatePolicyOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个保留策略
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                    <div>策略名称</div>
                    <div>保留时长</div>
                    <div>复制因子</div>
                    <div>默认策略</div>
                    <div className="text-right">操作</div>
                  </div>
                  <div className="divide-y">
                    {retentionPolicies.map((policy, index) => (
                      <div key={index} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{policy.name}</div>
                        <div>{policy.duration}</div>
                        <div>{policy.replication}</div>
                        <div>{policy.default ? "是" : "否"}</div>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">操作</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>策略操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>编辑策略</DropdownMenuItem>
                              <DropdownMenuItem disabled={policy.default}>设为默认</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" disabled={policy.default}>
                                删除策略
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

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Select value={selectedDatabase || ""} onValueChange={setSelectedDatabase}>
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
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">最近1小时</SelectItem>
                  <SelectItem value="6h">最近6小时</SelectItem>
                  <SelectItem value="24h">最近24小时</SelectItem>
                  <SelectItem value="7d">最近7天</SelectItem>
                  <SelectItem value="30d">最近30天</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={async () => {
                if (!selectedDatabase) return;
                
                try {
                  setLoading(prev => ({ ...prev, metrics: true }));
                  setError(null);
                  const response = await timeseriesApi.getTimeseriesDatabaseMetrics(selectedDatabase, timeRange);
                  if (response.success) {
                    setPerformanceMetrics(response.data);
                  } else {
                    setError(response.message || "获取数据库性能指标失败");
                  }
                } catch (err) {
                  console.error("获取数据库性能指标出错:", err);
                  setError("获取数据库性能指标失败");
                } finally {
                  setLoading(prev => ({ ...prev, metrics: false }));
                }
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新
              </Button>
            </div>
          </div>

          {!selectedDatabase ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">未选择数据库</h3>
                  <p className="mt-1 text-sm text-muted-foreground">请从上方下拉菜单中选择一个时序数据库</p>
                </div>
              </CardContent>
            </Card>
          ) : loading.metrics ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : !performanceMetrics ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">暂无性能数据</h3>
                  <p className="mt-1 text-sm text-muted-foreground">无法获取性能指标数据</p>
                  <Button variant="outline" className="mt-4" onClick={async () => {
                    try {
                      setLoading(prev => ({ ...prev, metrics: true }));
                      setError(null);
                      const response = await timeseriesApi.getTimeseriesDatabaseMetrics(selectedDatabase, timeRange);
                      if (response.success) {
                        setPerformanceMetrics(response.data);
                      } else {
                        setError(response.message || "获取数据库性能指标失败");
                      }
                    } catch (err) {
                      console.error("获取数据库性能指标出错:", err);
                      setError("获取数据库性能指标失败");
                    } finally {
                      setLoading(prev => ({ ...prev, metrics: false }));
                    }
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重试
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>写入性能</CardTitle>
                  <CardDescription>每秒写入点数</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceMetrics.writePerformance}
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="写入点数/秒"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>读取性能</CardTitle>
                  <CardDescription>每秒读取点数</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceMetrics.readPerformance}
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="读取点数/秒"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>查询延迟</CardTitle>
                  <CardDescription>查询响应时间 (毫秒)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceMetrics.queryLatency}
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="查询延迟 (ms)"
                        stroke="#ff7300"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>内存使用</CardTitle>
                  <CardDescription>内存使用率 (%)</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceMetrics.memoryUsage}
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
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="内存使用率 (%)"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}