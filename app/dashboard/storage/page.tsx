"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import { HardDrive, FolderTree, Package, HardDriveIcon as HardDisk, Server } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const storageTypes = [
  { name: "文件存储", value: 40, color: "#3b82f6" },
  { name: "对象存储", value: 35, color: "#10b981" },
  { name: "块存储", value: 25, color: "#f59e0b" },
]

const storageNodes = [
  { id: "node-01", name: "存储节点 1", type: "主节点", status: "在线", usage: 65 },
  { id: "node-02", name: "存储节点 2", type: "主节点", status: "在线", usage: 48 },
  { id: "node-03", name: "存储节点 3", type: "副本节点", status: "在线", usage: 72 },
  { id: "node-04", name: "存储节点 4", type: "副本节点", status: "在线", usage: 35 },
  { id: "node-05", name: "存储节点 5", type: "主节点", status: "离线", usage: 0 },
]

const performanceData = [
  { name: "00:00", iops: 1200, throughput: 250, latency: 5 },
  { name: "04:00", iops: 800, throughput: 200, latency: 4 },
  { name: "08:00", iops: 2400, throughput: 350, latency: 8 },
  { name: "12:00", iops: 3200, throughput: 400, latency: 12 },
  { name: "16:00", iops: 2800, throughput: 380, latency: 10 },
  { name: "20:00", iops: 1800, throughput: 300, latency: 7 },
]

export default function StorageOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">存储管理</h1>
          <p className="text-muted-foreground">管理和监控所有存储资源</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <HardDrive className="mr-2 h-4 w-4" />
            添加存储
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文件存储</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8 TB</div>
            <p className="text-xs text-muted-foreground">已使用 65%</p>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">对象存储</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5 TB</div>
            <p className="text-xs text-muted-foreground">已使用 42%</p>
            <Progress value={42} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">块存储</CardTitle>
            <HardDisk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.2 TB</div>
            <p className="text-xs text-muted-foreground">已使用 55%</p>
            <Progress value={55} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储节点</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/5</div>
            <p className="text-xs text-muted-foreground">4 个节点在线</p>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>存储类型分布</CardTitle>
            <CardDescription>各类存储容量占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={storageTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {storageTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>存储性能指标</CardTitle>
            <CardDescription>过去 24 小时的性能数据</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="iops">
              <TabsList className="mb-4">
                <TabsTrigger value="iops">IOPS</TabsTrigger>
                <TabsTrigger value="throughput">吞吐量</TabsTrigger>
                <TabsTrigger value="latency">延迟</TabsTrigger>
              </TabsList>
              <TabsContent value="iops" className="h-64">
                <ChartContainer
                  config={{
                    iops: {
                      label: "IOPS",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="iops" stroke="var(--color-iops)" activeDot={{ r: 8 }} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="throughput" className="h-64">
                <ChartContainer
                  config={{
                    throughput: {
                      label: "吞吐量 (MB/s)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="throughput" stroke="var(--color-throughput)" activeDot={{ r: 8 }} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="latency" className="h-64">
                <ChartContainer
                  config={{
                    latency: {
                      label: "延迟 (ms)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" activeDot={{ r: 8 }} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>存储节点状态</CardTitle>
          <CardDescription>所有存储节点的状态和使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>类型</div>
              <div>状态</div>
              <div>使用率</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {storageNodes.map((node) => (
                <div key={node.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                  <div className="font-medium">{node.id}</div>
                  <div>{node.name}</div>
                  <div>{node.type}</div>
                  <div>
                    <Badge variant={node.status === "在线" ? "success" : "destructive"}>{node.status}</Badge>
                  </div>
                  <div>
                    {node.status === "在线" ? (
                      <div className="flex items-center gap-2">
                        <Progress value={node.usage} className="h-2 flex-1" />
                        <span className="text-xs">{node.usage}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">不可用</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      查看
                    </Button>
                    <Button variant="ghost" size="sm">
                      管理
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
