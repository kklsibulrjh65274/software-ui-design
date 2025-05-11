"use client"

import { useState } from "react"
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
import { Activity, Server, HardDrive, Network, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// 模拟性能数据
const performanceData = [
  { time: "00:00", cpu: 45, memory: 60, disk: 35, network: 20 },
  { time: "01:00", cpu: 40, memory: 58, disk: 37, network: 25 },
  { time: "02:00", cpu: 35, memory: 55, disk: 38, network: 22 },
  { time: "03:00", cpu: 30, memory: 52, disk: 36, network: 18 },
  { time: "04:00", cpu: 32, memory: 50, disk: 35, network: 15 },
  { time: "05:00", cpu: 35, memory: 53, disk: 34, network: 20 },
  { time: "06:00", cpu: 42, memory: 58, disk: 36, network: 25 },
  { time: "07:00", cpu: 55, memory: 65, disk: 40, network: 35 },
  { time: "08:00", cpu: 70, memory: 72, disk: 45, network: 50 },
  { time: "09:00", cpu: 85, memory: 80, disk: 50, network: 65 },
  { time: "10:00", cpu: 82, memory: 78, disk: 52, network: 60 },
  { time: "11:00", cpu: 80, memory: 75, disk: 55, network: 58 },
  { time: "12:00", cpu: 78, memory: 72, disk: 53, network: 55 },
]

const queryPerformanceData = [
  { name: "SELECT", avg: 45, max: 120, count: 1250 },
  { name: "INSERT", avg: 30, max: 85, count: 850 },
  { name: "UPDATE", avg: 35, max: 95, count: 650 },
  { name: "DELETE", avg: 25, max: 70, count: 320 },
  { name: "JOIN", avg: 65, max: 180, count: 580 },
  { name: "INDEX", avg: 20, max: 60, count: 420 },
]

const databasePerformanceData = [
  { name: "postgres-main", qps: 850, latency: 25, connections: 120 },
  { name: "postgres-replica", qps: 450, latency: 18, connections: 85 },
  { name: "timeseries-01", qps: 1200, latency: 15, connections: 65 },
  { name: "vector-search", qps: 350, latency: 30, connections: 40 },
  { name: "geo-analytics", qps: 180, latency: 22, connections: 35 },
]

export default function PerformanceMonitoringPage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // 模拟数据刷新
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">较昨日 +5%</p>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内存使用率</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">较昨日 +2%</p>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">磁盘 I/O</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125 MB/s</div>
            <p className="text-xs text-muted-foreground">较昨日 -8%</p>
            <Progress value={55} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">网络吞吐量</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">250 Mbps</div>
            <p className="text-xs text-muted-foreground">较昨日 +15%</p>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>系统资源使用趋势</CardTitle>
          <CardDescription>过去 12 小时的系统资源使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
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

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">数据库性能</TabsTrigger>
          <TabsTrigger value="query">查询性能</TabsTrigger>
          <TabsTrigger value="system">系统性能</TabsTrigger>
        </TabsList>
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据库性能指标</CardTitle>
              <CardDescription>各数据库实例的性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={databasePerformanceData}
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
                      data={databasePerformanceData}
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
                      data={databasePerformanceData}
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
                      <Area type="monotone" dataKey="qps" stackId="1" stroke="#8884d8" fill="#8884d8" name="查询负载" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>查询性能分析</CardTitle>
              <CardDescription>各类查询的性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={queryPerformanceData}
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
                    data={queryPerformanceData}
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
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CPU 使用率趋势</CardTitle>
                <CardDescription>过去 12 小时的 CPU 使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
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
                      <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU 使用率 (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>内存使用率趋势</CardTitle>
                <CardDescription>过去 12 小时的内存使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
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
                      <Line type="monotone" dataKey="memory" stroke="#10b981" name="内存使用率 (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>磁盘使用率趋势</CardTitle>
                <CardDescription>过去 12 小时的磁盘使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
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
                      <Line type="monotone" dataKey="disk" stroke="#f59e0b" name="磁盘使用率 (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>网络使用率趋势</CardTitle>
                <CardDescription>过去 12 小时的网络使用率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
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
                      <Line type="monotone" dataKey="network" stroke="#8b5cf6" name="网络使用率 (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
