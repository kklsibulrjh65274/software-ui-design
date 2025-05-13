"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  AlertTriangle,
  Plus,
  Download,
  BarChart,
  Settings,
  Trash2,
  RefreshCw,
  Save
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from "recharts"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

// 导入 API
import { timeseriesApi } from "@/api"

export default function TimeseriesDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [timeQuery, setTimeQuery] = useState(
    "SELECT mean(cpu_usage) FROM system_metrics WHERE time >= now() - 12h GROUP BY time(1h)",
  )
  const [queryResult, setQueryResult] = useState<any>(null)
  const [databases, setDatabases] = useState<any[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [series, setSeries] = useState<any[]>([])
  const [retentionPolicies, setRetentionPolicies] = useState<any[]>([])
  const [databaseStats, setDatabaseStats] = useState<any>(null)
  const [databaseMetrics, setDatabaseMetrics] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("24h")
  
  const [loading, setLoading] = useState({
    databases: true,
    series: false,
    query: false,
    policies: false,
    stats: false,
    metrics: false
  })
  const [error, setError] = useState<string | null>(null)
  
  // 对话框状态
  const [isCreateDatabaseOpen, setIsCreateDatabaseOpen] = useState(false)
  const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false)
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false)
  
  // 表单数据
  const [newDatabaseData, setNewDatabaseData] = useState({
    name: "",
    retention: "30天"
  })
  const [newSeriesData, setNewSeriesData] = useState({
    name: "",
    type: "float",
    tags: [{ key: "", value: "" }]
  })
  const [newPolicyData, setNewPolicyData] = useState({
    name: "",
    duration: "30d",
    replication: 1,
    default: false
  })

  // 获取时序数据库列表
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(prev => ({ ...prev, databases: true }))
        const response = await timeseriesApi.getTimeseriesDatabases()
        if (response.success) {
          setDatabases(response.data)
          if (response.data.length > 0 && !selectedDatabase) {
            setSelectedDatabase(response.data[0].id)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取时序数据库失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, databases: false }))
      }
    }

    fetchDatabases()
  }, [])

  // 获取时间序列列表
  useEffect(() => {
    if (!selectedDatabase) return
    
    const fetchSeries = async () => {
      try {
        setLoading(prev => ({ ...prev, series: true }))
        const response = await timeseriesApi.getTimeseries(selectedDatabase)
        if (response.success) {
          setSeries(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取时间序列失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, series: false }))
      }
    }
    
    fetchSeries()
  }, [selectedDatabase])
  
  // 获取保留策略列表
  useEffect(() => {
    if (!selectedDatabase) return
    
    const fetchPolicies = async () => {
      try {
        setLoading(prev => ({ ...prev, policies: true }))
        const response = await timeseriesApi.getRetentionPolicies(selectedDatabase)
        if (response.success) {
          setRetentionPolicies(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取保留策略失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, policies: false }))
      }
    }
    
    fetchPolicies()
  }, [selectedDatabase])
  
  // 获取数据库统计信息
  useEffect(() => {
    if (!selectedDatabase || activeTab !== 'stats') return
    
    const fetchStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }))
        const response = await timeseriesApi.getTimeseriesDatabaseStats(selectedDatabase)
        if (response.success) {
          setDatabaseStats(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取数据库统计信息失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, stats: false }))
      }
    }
    
    fetchStats()
  }, [selectedDatabase, activeTab])
  
  // 获取数据库性能指标
  useEffect(() => {
    if (!selectedDatabase || activeTab !== 'stats') return
    
    const fetchMetrics = async () => {
      try {
        setLoading(prev => ({ ...prev, metrics: true }))
        const response = await timeseriesApi.getTimeseriesDatabaseMetrics(selectedDatabase, timeRange)
        if (response.success) {
          setDatabaseMetrics(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取数据库性能指标失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, metrics: false }))
      }
    }
    
    fetchMetrics()
  }, [selectedDatabase, activeTab, timeRange])

  const handleExecuteQuery = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, query: true }))
      setError(null)
      
      // 使用 API 执行时序查询
      const response = await timeseriesApi.executeTimeseriesQuery(selectedDatabase, timeQuery)
      
      if (response.success) {
        setQueryResult(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('执行时序查询失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, query: false }))
    }
  }
  
  // 创建时序数据库
  const handleCreateDatabase = async () => {
    try {
      setLoading(prev => ({ ...prev, databases: true }))
      
      const response = await timeseriesApi.createTimeseriesDatabase(newDatabaseData)
      
      if (response.success) {
        setDatabases(prev => [...prev, response.data])
        setSelectedDatabase(response.data.id)
        setIsCreateDatabaseOpen(false)
        setNewDatabaseData({
          name: "",
          retention: "30天"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建时序数据库失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, databases: false }))
    }
  }
  
  // 创建时间序列
  const handleCreateSeries = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, series: true }))
      
      // 过滤掉空标签
      const filteredTags = newSeriesData.tags.filter(tag => tag.key && tag.value)
      
      const response = await timeseriesApi.createTimeseries(selectedDatabase, {
        ...newSeriesData,
        tags: filteredTags
      })
      
      if (response.success) {
        setSeries(prev => [...prev, response.data])
        setIsCreateSeriesOpen(false)
        setNewSeriesData({
          name: "",
          type: "float",
          tags: [{ key: "", value: "" }]
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建时间序列失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, series: false }))
    }
  }
  
  // 创建保留策略
  const handleCreatePolicy = async () => {
    if (!selectedDatabase) {
      setError('请先选择数据库')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, policies: true }))
      
      const response = await timeseriesApi.createRetentionPolicy(selectedDatabase, newPolicyData)
      
      if (response.success) {
        setRetentionPolicies(prev => [...prev, response.data])
        setIsCreatePolicyOpen(false)
        setNewPolicyData({
          name: "",
          duration: "30d",
          replication: 1,
          default: false
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建保留策略失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, policies: false }))
    }
  }
  
  // 删除时序数据库
  const handleDeleteDatabase = async (id: string) => {
    if (!confirm(`确定要删除数据库 ${id} 吗？此操作不可恢复！`)) {
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, databases: true }))
      
      const response = await timeseriesApi.deleteTimeseriesDatabase(id)
      
      if (response.success) {
        setDatabases(prev => prev.filter(db => db.id !== id))
        if (selectedDatabase === id) {
          setSelectedDatabase(databases.length > 1 ? databases.find(db => db.id !== id)?.id || null : null)
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除时序数据库失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, databases: false }))
    }
  }
  
  // 添加标签字段
  const addTagField = () => {
    setNewSeriesData({
      ...newSeriesData,
      tags: [...newSeriesData.tags, { key: "", value: "" }]
    })
  }
  
  // 更新标签字段
  const updateTagField = (index: number, field: 'key' | 'value', value: string) => {
    const updatedTags = [...newSeriesData.tags]
    updatedTags[index][field] = value
    setNewSeriesData({
      ...newSeriesData,
      tags: updatedTags
    })
  }
  
  // 删除标签字段
  const removeTagField = (index: number) => {
    if (newSeriesData.tags.length <= 1) {
      return // 保留至少一个标签字段
    }
    const updatedTags = newSeriesData.tags.filter((_, i) => i !== index)
    setNewSeriesData({
      ...newSeriesData,
      tags: updatedTags
    })
  }
  
  // 下载查询结果
  const handleDownloadQueryResult = () => {
    if (!queryResult) {
      setError('没有可下载的查询结果')
      return
    }
    
    try {
      // 将查询结果转换为 CSV 格式
      const headers = ['time', 'value'].join(',')
      const rows = queryResult.data.map((point: any) => 
        `${point.time},${point.value}`
      ).join('\n')
      const csvContent = `${headers}\n${rows}`
      
      // 创建 Blob 对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接并触发下载
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `timeseries-query-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError('下载查询结果失败')
      console.error(err)
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
                <DialogDescription>
                  配置新时序数据库的详细信息。创建后，您可以添加时间序列和查询数据。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-name" className="text-right">
                    数据库名称
                  </Label>
                  <Input
                    id="db-name"
                    value={newDatabaseData.name}
                    onChange={(e) => setNewDatabaseData({...newDatabaseData, name: e.target.value})}
                    placeholder="输入数据库名称"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-retention" className="text-right">
                    默认保留策略
                  </Label>
                  <Select 
                    value={newDatabaseData.retention}
                    onValueChange={(value) => setNewDatabaseData({...newDatabaseData, retention: value})}
                  >
                    <SelectTrigger id="db-retention" className="col-span-3">
                      <SelectValue placeholder="选择保留时间" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7天">7天</SelectItem>
                      <SelectItem value="30天">30天</SelectItem>
                      <SelectItem value="90天">90天</SelectItem>
                      <SelectItem value="180天">180天</SelectItem>
                      <SelectItem value="365天">365天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDatabaseOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateDatabase} disabled={!newDatabaseData.name}>
                  创建数据库
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="databases">数据库列表</TabsTrigger>
          <TabsTrigger value="series">时间序列</TabsTrigger>
          <TabsTrigger value="query">数据查询</TabsTrigger>
          <TabsTrigger value="policies">保留策略</TabsTrigger>
          <TabsTrigger value="stats">性能统计</TabsTrigger>
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
            <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>保留策略</div>
              <div>序列数</div>
              <div>数据点数</div>
              <div>状态</div>
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
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreateDatabaseOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建第一个时序数据库
                  </Button>
                </div>
              ) : (
                databases.map((db) => (
                  <div key={db.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{db.id}</div>
                    <div>{db.name}</div>
                    <div>{db.retention}</div>
                    <div>{db.series}</div>
                    <div>{db.points}</div>
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
                            setActiveTab("series")
                          }}>
                            查看序列
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("policies")
                          }}>
                            管理保留策略
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("query")
                          }}>
                            查询数据
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedDatabase(db.id)
                            setActiveTab("stats")
                          }}>
                            查看统计信息
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteDatabase(db.id)}
                          >
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
                    <DialogDescription>
                      在数据库 {databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中创建新的时间序列。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="series-name" className="text-right">
                        序列名称
                      </Label>
                      <Input
                        id="series-name"
                        value={newSeriesData.name}
                        onChange={(e) => setNewSeriesData({...newSeriesData, name: e.target.value})}
                        placeholder="输入序列名称"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="series-type" className="text-right">
                        数据类型
                      </Label>
                      <Select 
                        value={newSeriesData.type}
                        onValueChange={(value) => setNewSeriesData({...newSeriesData, type: value})}
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
                      <div className="text-right pt-2">
                        <Label>标签</Label>
                      </div>
                      <div className="col-span-3 space-y-2">
                        {newSeriesData.tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="标签名"
                              value={tag.key}
                              onChange={(e) => updateTagField(index, 'key', e.target.value)}
                              className="flex-1"
                            />
                            <span>=</span>
                            <Input
                              placeholder="标签值"
                              value={tag.value}
                              onChange={(e) => updateTagField(index, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeTagField(index)}
                              disabled={newSeriesData.tags.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addTagField}
                          className="mt-2"
                        >
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
                    <Button onClick={handleCreateSeries} disabled={!newSeriesData.name}>
                      创建时间序列
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>时间序列列表</CardTitle>
              <CardDescription>
                {selectedDatabase ? 
                  `${databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 中的时间序列` : 
                  "请选择一个数据库"}
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
                    <p className="mt-1 text-sm text-muted-foreground">该数据库中没有时间序列，请创建新的时间序列</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateSeriesOpen(true)}
                    >
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
                    {series.map((item, index) => (
                      <div key={index} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                        <div className="font-medium">{item.name}</div>
                        <div>
                          {item.tags.map((tag: any, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="mr-1">
                              {tag.key}={tag.value}
                            </Badge>
                          ))}
                        </div>
                        <div>{item.type}</div>
                        <div>{item.points}</div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedSeries(item.name)
                              setTimeQuery(`SELECT * FROM ${item.name} LIMIT 100`)
                              setActiveTab("query")
                            }}
                          >
                            查看
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedSeries(item.name)
                              setTimeQuery(`SELECT * FROM ${item.name} WHERE time >= now() - 24h GROUP BY time(1h)`)
                              setActiveTab("query")
                              handleExecuteQuery()
                            }}
                          >
                            图表
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={async () => {
                              if (confirm(`确定要删除时间序列 ${item.name} 吗？此操作不可恢复！`)) {
                                try {
                                  const response = await timeseriesApi.deleteTimeseries(selectedDatabase!, item.name)
                                  if (response.success) {
                                    setSeries(prev => prev.filter(s => s.name !== item.name))
                                  } else {
                                    setError(response.message)
                                  }
                                } catch (err) {
                                  setError('删除时间序列失败')
                                  console.error(err)
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时序数据查询</CardTitle>
              <CardDescription>查询和可视化时间序列数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDownloadQueryResult} 
                  disabled={!queryResult}
                  title="下载查询结果"
                >
                   <Download className="h-4 w-4" />
                   <span className="sr-only">下载</span>
                </Button>
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
                  
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleDownloadQueryResult}>
                      <Download className="mr-2 h-4 w-4" />
                      下载结果
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
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
                    <DialogDescription>
                      为数据库 {databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 创建新的数据保留策略。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-name" className="text-right">
                        策略名称
                      </Label>
                      <Input
                        id="policy-name"
                        value={newPolicyData.name}
                        onChange={(e) => setNewPolicyData({...newPolicyData, name: e.target.value})}
                        placeholder="输入策略名称"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-duration" className="text-right">
                        保留时长
                      </Label>
                      <Select 
                        value={newPolicyData.duration}
                        onValueChange={(value) => setNewPolicyData({...newPolicyData, duration: value})}
                      >
                        <SelectTrigger id="policy-duration" className="col-span-3">
                          <SelectValue placeholder="选择保留时长" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1天</SelectItem>
                          <SelectItem value="7d">7天</SelectItem>
                          <SelectItem value="30d">30天</SelectItem>
                          <SelectItem value="90d">90天</SelectItem>
                          <SelectItem value="180d">180天</SelectItem>
                          <SelectItem value="365d">365天</SelectItem>
                          <SelectItem value="INF">永久</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="policy-replication" className="text-right">
                        复制因子
                      </Label>
                      <Select 
                        value={String(newPolicyData.replication)}
                        onValueChange={(value) => setNewPolicyData({...newPolicyData, replication: parseInt(value)})}
                      >
                        <SelectTrigger id="policy-replication" className="col-span-3">
                          <SelectValue placeholder="选择复制因子" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (无复制)</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right">
                        <Label htmlFor="policy-default">默认策略</Label>
                      </div>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Checkbox 
                          id="policy-default" 
                          checked={newPolicyData.default}
                          onCheckedChange={(checked) => 
                            setNewPolicyData({...newPolicyData, default: checked === true})
                          }
                        />
                        <Label htmlFor="policy-default">设为默认保留策略</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePolicyOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreatePolicy} disabled={!newPolicyData.name}>
                      创建策略
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>保留策略管理</CardTitle>
              <CardDescription>
                {selectedDatabase ? 
                  `${databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 的保留策略` : 
                  "请选择一个数据库"}
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
                    <p className="mt-1 text-sm text-muted-foreground">该数据库中没有保留策略，请创建新的保留策略</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreatePolicyOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个保留策略
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>策略名称</TableHead>
                      <TableHead>保留时长</TableHead>
                      <TableHead>复制因子</TableHead>
                      <TableHead>默认策略</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retentionPolicies.map((policy, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{policy.name}</TableCell>
                        <TableCell>{policy.duration}</TableCell>
                        <TableCell>{policy.replication}</TableCell>
                        <TableCell>
                          {policy.default ? (
                            <Badge variant="success">是</Badge>
                          ) : (
                            <Badge variant="outline">否</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await timeseriesApi.updateRetentionPolicy(
                                    selectedDatabase!,
                                    policy.name,
                                    { default: true }
                                  )
                                  
                                  if (response.success) {
                                    // 更新策略列表，将当前策略设为默认，其他取消默认
                                    setRetentionPolicies(prev => 
                                      prev.map(p => ({
                                        ...p,
                                        default: p.name === policy.name
                                      }))
                                    )
                                  } else {
                                    setError(response.message)
                                  }
                                } catch (err) {
                                  setError('设置默认策略失败')
                                  console.error(err)
                                }
                              }}
                              disabled={policy.default}
                            >
                              设为默认
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={async () => {
                                if (policy.default) {
                                  setError('不能删除默认保留策略')
                                  return
                                }
                                
                                if (confirm(`确定要删除保留策略 ${policy.name} 吗？此操作不可恢复！`)) {
                                  try {
                                    const response = await timeseriesApi.deleteRetentionPolicy(selectedDatabase!, policy.name)
                                    if (response.success) {
                                      setRetentionPolicies(prev => prev.filter(p => p.name !== policy.name))
                                    } else {
                                      setError(response.message)
                                    }
                                  } catch (err) {
                                    setError('删除保留策略失败')
                                    console.error(err)
                                  }
                                }
                              }}
                              disabled={policy.default}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
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
            <div className="flex items-center gap-2">
              <Select 
                value={timeRange} 
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">最近 1 小时</SelectItem>
                  <SelectItem value="6h">最近 6 小时</SelectItem>
                  <SelectItem value="24h">最近 24 小时</SelectItem>
                  <SelectItem value="7d">最近 7 天</SelectItem>
                  <SelectItem value="30d">最近 30 天</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (selectedDatabase) {
                    Promise.all([
                      timeseriesApi.getTimeseriesDatabaseStats(selectedDatabase),
                      timeseriesApi.getTimeseriesDatabaseMetrics(selectedDatabase, timeRange)
                    ]).then(([statsResponse, metricsResponse]) => {
                      if (statsResponse.success) {
                        setDatabaseStats(statsResponse.data)
                      }
                      if (metricsResponse.success) {
                        setDatabaseMetrics(metricsResponse.data)
                      }
                    }).catch(err => {
                      setError('刷新统计数据失败')
                      console.error(err)
                    })
                  }
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">刷新</span>
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
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">时间序列数</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading.stats ? (
                      <div className="h-8 flex items-center">
                        <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{databaseStats?.seriesCount || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">时间序列总数</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">数据点数</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading.stats ? (
                      <div className="h-8 flex items-center">
                        <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{databaseStats?.totalPoints || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">存储的数据点总数</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">磁盘使用</CardTitle>
                    <Save className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading.stats ? (
                      <div className="h-8 flex items-center">
                        <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{databaseStats?.diskSize || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">占用的磁盘空间</p>
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">写入速率</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading.stats ? (
                      <div className="h-8 flex items-center">
                        <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{databaseStats?.writeRate || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">每秒写入的数据点数</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>写入性能</CardTitle>
                    <CardDescription>每秒写入的数据点数</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading.metrics ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !databaseMetrics?.writePerformance ? (
                      <div className="flex h-full items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">暂无性能数据</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={databaseMetrics.writePerformance}
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
                          <Line type="monotone" dataKey="value" name="写入速率 (点/秒)" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>读取性能</CardTitle>
                    <CardDescription>每秒读取的数据点数</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading.metrics ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !databaseMetrics?.readPerformance ? (
                      <div className="flex h-full items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">暂无性能数据</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={databaseMetrics.readPerformance}
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
                          <Line type="monotone" dataKey="value" name="读取速率 (点/秒)" stroke="#10b981" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>查询延迟</CardTitle>
                    <CardDescription>查询响应时间 (毫秒)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading.metrics ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !databaseMetrics?.queryLatency ? (
                      <div className="flex h-full items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">暂无性能数据</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={databaseMetrics.queryLatency}
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
                          <Line type="monotone" dataKey="value" name="查询延迟 (ms)" stroke="#f59e0b" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>内存使用</CardTitle>
                    <CardDescription>内存使用率 (%)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading.metrics ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : !databaseMetrics?.memoryUsage ? (
                      <div className="flex h-full items-center justify-center">
                        <BarChart className="h-16 w-16 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">暂无性能数据</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={databaseMetrics.memoryUsage}
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
                          <Line type="monotone" dataKey="value" name="内存使用率 (%)" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>数据库详细信息</CardTitle>
                  <CardDescription>
                    {databases.find(db => db.id === selectedDatabase)?.name || selectedDatabase} 的详细信息
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.stats ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !databaseStats ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">暂无数据库详细信息</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">数据库名称:</span>
                          <span className="text-sm">{databases.find(db => db.id === selectedDatabase)?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">数据库 ID:</span>
                          <span className="text-sm">{selectedDatabase}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">时间序列数:</span>
                          <span className="text-sm">{databaseStats.seriesCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">数据点总数:</span>
                          <span className="text-sm">{databaseStats.totalPoints}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">磁盘使用:</span>
                          <span className="text-sm">{databaseStats.diskSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">运行时间:</span>
                          <span className="text-sm">{databaseStats.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">写入速率:</span>
                          <span className="text-sm">{databaseStats.writeRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">读取速率:</span>
                          <span className="text-sm">{databaseStats.readRate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}