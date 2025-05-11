"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Database, Table, Clock, VideoIcon as Vector, Map } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const databaseTypes = [
  { name: "关系型", value: 45, color: "#3b82f6" },
  { name: "时序型", value: 25, color: "#10b981" },
  { name: "向量型", value: 20, color: "#f59e0b" },
  { name: "地理空间型", value: 10, color: "#8b5cf6" },
]

const databaseInstances = [
  { id: "postgres-main", name: "主数据库", type: "关系型", size: "1.2 TB", status: "正常" },
  { id: "timeseries-01", name: "监控数据库", type: "时序型", size: "850 GB", status: "正常" },
  { id: "vector-search", name: "搜索引擎", type: "向量型", size: "450 GB", status: "警告" },
  { id: "geo-analytics", name: "地理分析", type: "地理空间型", size: "320 GB", status: "正常" },
  { id: "postgres-replica", name: "副本数据库", type: "关系型", size: "1.1 TB", status: "正常" },
  { id: "timeseries-02", name: "日志数据库", type: "时序型", size: "1.5 TB", status: "错误" },
]

const storageData = [
  { name: "关系型", size: 2300, capacity: 5000 },
  { name: "时序型", size: 2350, capacity: 3000 },
  { name: "向量型", size: 450, capacity: 1000 },
  { name: "地理空间型", size: 320, capacity: 1000 },
]

export default function DatabaseOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据库管理</h1>
          <p className="text-muted-foreground">管理和监控所有数据库实例</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Database className="mr-2 h-4 w-4" />
            创建数据库
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">关系型数据库</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">2 个实例需要注意</p>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">时序数据库</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">1 个实例需要注意</p>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">向量数据库</CardTitle>
            <Vector className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">所有实例正常</p>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">地理空间数据库</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">所有实例正常</p>
            <Progress value={30} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>数据库类型分布</CardTitle>
            <CardDescription>各类数据库实例数量占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={databaseTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {databaseTypes.map((entry, index) => (
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
            <CardTitle>存储使用情况</CardTitle>
            <CardDescription>各类数据库存储空间使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  size: {
                    label: "已用空间 (GB)",
                    color: "hsl(var(--chart-1))",
                  },
                  capacity: {
                    label: "总容量 (GB)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <BarChart
                  data={storageData}
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="size" fill="var(--color-size)" />
                  <Bar dataKey="capacity" fill="var(--color-capacity)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>数据库实例列表</CardTitle>
          <CardDescription>所有数据库实例的状态和信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>类型</div>
              <div>大小</div>
              <div>状态</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {databaseInstances.map((db) => (
                <div key={db.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                  <div className="font-medium">{db.id}</div>
                  <div>{db.name}</div>
                  <div>{db.type}</div>
                  <div>{db.size}</div>
                  <div>
                    <Badge
                      variant={db.status === "正常" ? "success" : db.status === "警告" ? "warning" : "destructive"}
                    >
                      {db.status}
                    </Badge>
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
