"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  Activity,
  Server,
  HardDrive,
  Network,
  RefreshCw,
  AlertTriangle,
  Database,
  Clock,
  Search,
  Filter,
  Download,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// 导入 API
import { systemApi } from "@/api"

export default function PerformanceMonitoringPage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("system")
  const [databaseFilter, setDatabaseFilter] = useState("all")
  const [queryFilter, setQueryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // 获取性能数据
  useEffect(() => {
    fetchPerformanceData()
  }, [timeRange])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsRefreshing(true)
      
      const response = await systemApi.getPerformanceData({ timeRange })
      
      if (response.success) {
        setPerformanceData(response.data)
      } else {
        setError(response.message || "获取性能数据失败")
      }
    } catch (err) {
      console.error("获取性能数据出错:", err)
      setError("获取性能数据失败")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchPerformanceData()
  }
  
  // 导出性能数据为CSV
  const handleExportData = () => {
    if (!performanceData) return
    
    try {
      // 根据当前活动标签选择要导出的数据
      let dataToExport: any[] = []
      let filename = ""
      
      if (activeTab === "system") {
        dataToExport = performanceData.systemData || performanceData
        filename = "system-performance"
      } else if (activeTab === "database") {
        dataToExport = performanceData.databasePerformance || []
        filename = "database-performance"
      } else if (activeTab === "query") {
        dataToExport = performanceData.queryPerformance || []
        filename = "query-performance"
      }
      
      if (dataToExport.length === 0) {
        setError("没有可导出的数据")
        return
      }
      
      // 获取所有可能的列
      const allKeys = new Set<string>()
      dataToExport.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key))
      })
      
      // 创建CSV内容
      const headers = Array.from(allKeys).join(',')
      const rows = dataToExport.map(item => 
        Array.from(allKeys).map(key => 
          item[key] !== undefined ? `"${item[key]}"` : '""'
        ).join(',')
      ).join('\n')
      
      const csvContent = `${headers}\n${rows}`
      
      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (err) {
      console.error("导出数据出错:", err)
      setError("导出数据失败")
    }
  }
  
  // 保存性能快照
  const handleSaveSnapshot = () => {
    if (!performanceData) return
    
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        timeRange,
        data: performanceData
      }
      
      // 获取现有快照
      const existingSnapshots = JSON.parse(localStorage.getItem('performanceSnapshots') || '[]')
      
      // 添加新快照
      existingSnapshots.unshift(snapshot)
      
      // 限制保存的快照数量
      if (existingSnapshots.length > 10) {
        existingSnapshots.pop()
      }
      
      // 保存回本地存储
      localStorage.setItem('performanceSnapshots', JSON.stringify(existingSnapshots))
      
      alert('性能快照已保存')
    } catch (err) {
      console.error("保存快照出错:", err)
      setError("保存快照失败")
    }
  }

  // 如果没有数据，显示加载状态
  if (loading && !performanceData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">性能监控</h1>
            <p className="text-muted-foreground">监控系统性能指标和资源使用情况</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">性能监控</h1>
          <p className="text-muted-foreground">监控系统性能指标和资源使用情况</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
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
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">刷新</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleExportData} disabled={!performanceData}>
            <Download className="h-4 w-4" />
            <span className="sr-only">导出</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleSaveSnapshot} disabled={!performanceData}>
            <Save className="h-4 w-4" />
            <span className="sr-only">保存快照</span>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.cpu?.current || 0}%</div>
            <p className="text-xs text-muted-foreground">
              较昨日 {compareValues(performanceData?.cpu?.current, performanceData?.cpu?.yesterday)}
            </p>
            <Progress 
              value={performanceData?.cpu?.current || 0} 
              className="mt-2"
              indicatorClassName={
                (performanceData?.cpu?.current || 0) > 80 ? "bg-red-500" : 
                (performanceData?.cpu?.current || 0) > 60 ? "bg-amber-500" : 
                "bg-green-500"
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内存使用率</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.memory?.current || 0}%</div>
            <p className="text-xs text-muted-foreground">
              较昨日 {compareValues(performanceData?.memory?.current, performanceData?.memory?.yesterday)}
            </p>
            <Progress 
              value={performanceData?.memory?.current || 0} 
              className="mt-2"
              indicatorClassName={
                (performanceData?.memory?.current || 0) > 80 ? "bg-red-500" : 
                (performanceData?.memory?.current || 0) > 60 ? "bg-amber-500" : 
                "bg-green-500"
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">磁盘 I/O</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.disk?.iops || 0} IOPS</div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.disk?.throughput || "0 MB/s"} 吞吐量
            </p>
            <Progress 
              value={performanceData?.disk?.utilization || 0} 
              className="mt-2"
              indicatorClassName={
                (performanceData?.disk?.utilization || 0) > 80 ? "bg-red-500" : 
                (performanceData?.disk?.utilization || 0) > 60 ? "bg-amber-500" : 
                "bg-green-500"
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">网络吞吐量</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceData?.network?.throughput || "0 Mbps"}</div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.network?.packets || "0"} 包/秒
            </p>
            <Progress 
              value={performanceData?.network?.utilization || 0} 
              className="mt-2"
              indicatorClassName={
                (performanceData?.network?.utilization || 0) > 80 ? "bg-red-500" : 
                (performanceData?.network?.utilization || 0) > 60 ? "bg-amber-500" : 
                "bg-green-500"
              }
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">系统性能</TabsTrigger>
          <TabsTrigger value="database">数据库性能</TabsTrigger>
          <TabsTrigger value="query">查询性能</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统资源使用趋势</CardTitle>
              <CardDescription>过去 {formatTimeRange(timeRange)} 的系统资源使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData?.systemData || performanceData}
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
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU 使用率 (%)" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="内存使用率 (%)" />
                    <Line type="monotone" dataKey="disk" stroke="#f59e0b" name="磁盘使用率 (%)" />
                    <Line type="monotone" dataKey="network" stroke="#8b5cf6" name="网络使用率 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CPU 使用率趋势</CardTitle>
                <CardDescription>过去 {formatTimeRange(timeRange)} 的 CPU 使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData?.systemData || performanceData}
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
                      <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" name="CPU 使用率 (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>内存使用率趋势</CardTitle>
                <CardDescription>过去 {formatTimeRange(timeRange)} 的内存使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData?.systemData || performanceData}
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
                      <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b981" name="内存使用率 (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>磁盘使用率趋势</CardTitle>
                <CardDescription>过去 {formatTimeRange(timeRange)} 的磁盘使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData?.systemData || performanceData}
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
                      <Area type="monotone" dataKey="disk" stroke="#f59e0b" fill="#f59e0b" name="磁盘使用率 (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>网络使用率趋势</CardTitle>
                <CardDescription>过去 {formatTimeRange(timeRange)} 的网络使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={performanceData?.systemData || performanceData}
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
                      <Area type="monotone" dataKey="network" stroke="#8b5cf6" fill="#8b5cf6" name="网络使用率 (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>系统资源使用详情</CardTitle>
              <CardDescription>各项系统资源的使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>资源</TableHead>
                    <TableHead>当前使用率</TableHead>
                    <TableHead>平均使用率</TableHead>
                    <TableHead>峰值使用率</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">CPU</TableCell>
                    <TableCell>{performanceData?.cpu?.current || 0}%</TableCell>
                    <TableCell>{performanceData?.cpu?.average || 0}%</TableCell>
                    <TableCell>{performanceData?.cpu?.peak || 0}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        (performanceData?.cpu?.current || 0) > 80 ? "destructive" : 
                        (performanceData?.cpu?.current || 0) > 60 ? "warning" : 
                        "success"
                      }>
                        {(performanceData?.cpu?.current || 0) > 80 ? "高负载" : 
                         (performanceData?.cpu?.current || 0) > 60 ? "中负载" : 
                         "正常"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">内存</TableCell>
                    <TableCell>{performanceData?.memory?.current || 0}%</TableCell>
                    <TableCell>{performanceData?.memory?.average || 0}%</TableCell>
                    <TableCell>{performanceData?.memory?.peak || 0}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        (performanceData?.memory?.current || 0) > 80 ? "destructive" : 
                        (performanceData?.memory?.current || 0) > 60 ? "warning" : 
                        "success"
                      }>
                        {(performanceData?.memory?.current || 0) > 80 ? "高负载" : 
                         (performanceData?.memory?.current || 0) > 60 ? "中负载" : 
                         "正常"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">磁盘</TableCell>
                    <TableCell>{performanceData?.disk?.current || 0}%</TableCell>
                    <TableCell>{performanceData?.disk?.average || 0}%</TableCell>
                    <TableCell>{performanceData?.disk?.peak || 0}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        (performanceData?.disk?.current || 0) > 80 ? "destructive" : 
                        (performanceData?.disk?.current || 0) > 60 ? "warning" : 
                        "success"
                      }>
                        {(performanceData?.disk?.current || 0) > 80 ? "高负载" : 
                         (performanceData?.disk?.current || 0) > 60 ? "中负载" : 
                         "正常"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">网络</TableCell>
                    <TableCell>{performanceData?.network?.current || 0}%</TableCell>
                    <TableCell>{performanceData?.network?.average || 0}%</TableCell>
                    <TableCell>{performanceData?.network?.peak || 0}%</TableCell>
                    <TableCell>
                      <Badge variant={
                        (performanceData?.network?.current || 0) > 80 ? "destructive" : 
                        (performanceData?.network?.current || 0) > 60 ? "warning" : 
                        "success"
                      }>
                        {(performanceData?.network?.current || 0) > 80 ? "高负载" : 
                         (performanceData?.network?.current || 0) > 60 ? "中负载" : 
                         "正常"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索数据库..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={databaseFilter} onValueChange={setDatabaseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选数据库类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="relational">关系型</SelectItem>
                <SelectItem value="timeseries">时序型</SelectItem>
                <SelectItem value="vector">向量型</SelectItem>
                <SelectItem value="geospatial">地理空间型</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery("")
              setDatabaseFilter("all")
            }}>
              <Filter className="h-4 w-4" />
              <span className="sr-only">重置筛选</span>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>数据库性能指标</CardTitle>
              <CardDescription>各数据库实例的性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filterDatabases(performanceData?.databasePerformance || [])}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="qps" name="每秒查询数 (QPS)" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="latency" name="平均延迟 (ms)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>连接数</CardTitle>
                <CardDescription>各数据库实例的活跃连接数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filterDatabases(performanceData?.databasePerformance || [])}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="connections" name="活跃连接数" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>数据库负载分布</CardTitle>
                <CardDescription>各数据库实例的负载分布情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filterDatabases(performanceData?.databasePerformance || [])}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="load" stackId="1" stroke="#8884d8" fill="#8884d8" name="查询负载" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>数据库实例性能详情</CardTitle>
              <CardDescription>各数据库实例的详细性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>数据库名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>QPS</TableHead>
                    <TableHead>延迟 (ms)</TableHead>
                    <TableHead>连接数</TableHead>
                    <TableHead>缓存命中率</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterDatabases(performanceData?.databasePerformance || []).map((db: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{db.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getDatabaseType(db.name)}
                        </Badge>
                      </TableCell>
                      <TableCell>{db.qps}</TableCell>
                      <TableCell>{db.latency}</TableCell>
                      <TableCell>{db.connections}</TableCell>
                      <TableCell>{db.cacheHitRate || "N/A"}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          db.latency > 50 ? "destructive" : 
                          db.latency > 30 ? "warning" : 
                          "success"
                        }>
                          {db.latency > 50 ? "高延迟" : 
                           db.latency > 30 ? "中延迟" : 
                           "正常"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索查询类型..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={queryFilter} onValueChange={setQueryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选查询类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="SELECT">SELECT</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="JOIN">JOIN</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery("")
              setQueryFilter("all")
            }}>
              <Filter className="h-4 w-4" />
              <span className="sr-only">重置筛选</span>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>查询性能分析</CardTitle>
              <CardDescription>各类查询的性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filterQueries(performanceData?.queryPerformance || [])}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg" name="平均执行时间 (ms)" fill="#3b82f6" />
                    <Bar dataKey="max" name="最大执行时间 (ms)" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>查询数量统计</CardTitle>
              <CardDescription>各类查询的执行次数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filterQueries(performanceData?.queryPerformance || [])}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="查询次数" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>慢查询分析</CardTitle>
              <CardDescription>执行时间较长的查询列表</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>查询类型</TableHead>
                    <TableHead>执行时间 (ms)</TableHead>
                    <TableHead>执行次数</TableHead>
                    <TableHead>数据库</TableHead>
                    <TableHead>表</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(performanceData?.slowQueries || []).map((query: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{query.type}</TableCell>
                      <TableCell>{query.executionTime}</TableCell>
                      <TableCell>{query.count}</TableCell>
                      <TableCell>{query.database}</TableCell>
                      <TableCell>{query.table}</TableCell>
                      <TableCell>
                        <Badge variant={
                          query.executionTime > 1000 ? "destructive" : 
                          query.executionTime > 500 ? "warning" : 
                          "success"
                        }>
                          {query.executionTime > 1000 ? "严重" : 
                           query.executionTime > 500 ? "警告" : 
                           "正常"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 辅助函数：比较当前值与昨日值
function compareValues(current: number, yesterday: number): string {
  if (current === undefined || yesterday === undefined) return "N/A"
  
  const diff = current - yesterday
  return diff >= 0 ? `+${diff}%` : `${diff}%`
}

// 辅助函数：格式化时间范围
function formatTimeRange(range: string): string {
  switch (range) {
    case "1h": return "1 小时"
    case "6h": return "6 小时"
    case "24h": return "24 小时"
    case "7d": return "7 天"
    case "30d": return "30 天"
    default: return range
  }
}

// 辅助函数：根据数据库名称获取类型
function getDatabaseType(name: string): string {
  if (name.includes("postgres")) return "关系型"
  if (name.includes("timeseries")) return "时序型"
  if (name.includes("vector")) return "向量型"
  if (name.includes("geo")) return "地理空间型"
  return "未知"
}

// 辅助函数：过滤数据库
function filterDatabases(databases: any[]): any[] {
  if (!databases || !Array.isArray(databases)) return []
  
  return databases.filter(db => {
    // 根据搜索查询过滤
    const matchesSearch = !searchQuery || 
      db.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 根据数据库类型过滤
    const matchesType = databaseFilter === "all" || 
      (databaseFilter === "relational" && db.name.includes("postgres")) ||
      (databaseFilter === "timeseries" && db.name.includes("timeseries")) ||
      (databaseFilter === "vector" && db.name.includes("vector")) ||
      (databaseFilter === "geospatial" && db.name.includes("geo"))
    
    return matchesSearch && matchesType
  })
}

// 辅助函数：过滤查询
function filterQueries(queries: any[]): any[] {
  if (!queries || !Array.isArray(queries)) return []
  
  return queries.filter(query => {
    // 根据搜索查询过滤
    const matchesSearch = !searchQuery || 
      query.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 根据查询类型过滤
    const matchesType = queryFilter === "all" || 
      query.name === queryFilter
    
    return matchesSearch && matchesType
  })
}