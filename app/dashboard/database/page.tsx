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
import { Database, Table, Clock, VideoIcon as Vector, Map, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// 导入 API
import { databaseApi } from "@/api"
import { useState, useEffect } from "react"

const databaseTypes = [
  { name: "关系型", value: 45, color: "#3b82f6" },
  { name: "时序型", value: 25, color: "#10b981" },
  { name: "向量型", value: 20, color: "#f59e0b" },
  { name: "地理空间型", value: 10, color: "#8b5cf6" },
]

const storageData = [
  { name: "关系型", size: 2300, capacity: 5000 },
  { name: "时序型", size: 2350, capacity: 3000 },
  { name: "向量型", size: 450, capacity: 1000 },
  { name: "地理空间型", size: 320, capacity: 1000 },
]

export default function DatabaseOverviewPage() {
  const [databases, setDatabases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDatabaseOpen, setIsCreateDatabaseOpen] = useState(false)
  const [newDatabaseData, setNewDatabaseData] = useState({
    name: "",
    type: "relational",
    charset: "UTF-8",
    collation: "en_US.UTF-8"
  })

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true)
        const response = await databaseApi.getDatabases()
        if (response.success) {
          setDatabases(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取数据库数据失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDatabases()
  }, [])

  const handleCreateDatabase = async () => {
    if (!newDatabaseData.name) {
      setError("数据库名称不能为空")
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await databaseApi.createDatabase({
        name: newDatabaseData.name,
        type: newDatabaseData.type,
        charset: newDatabaseData.charset,
        collation: newDatabaseData.collation
      })
      
      if (response.success) {
        setDatabases([...databases, response.data])
        setIsCreateDatabaseOpen(false)
        setNewDatabaseData({
          name: "",
          type: "relational",
          charset: "UTF-8",
          collation: "en_US.UTF-8"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建数据库失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 计算各类数据库数量
  const relationalCount = databases.filter(db => db.id.startsWith('postgres-')).length
  const timeseriesCount = databases.filter(db => db.id.startsWith('timeseries-')).length
  const vectorCount = databases.filter(db => db.id.startsWith('vector-')).length
  const geospatialCount = databases.filter(db => db.id.startsWith('geo-')).length

  // 计算各类数据库状态
  const relationalWarnings = databases.filter(db => 
    db.id.startsWith('postgres-') && db.status === "警告"
  ).length
  const timeseriesWarnings = databases.filter(db => 
    db.id.startsWith('timeseries-') && db.status === "警告"
  ).length
  const vectorWarnings = databases.filter(db => 
    db.id.startsWith('vector-') && db.status === "警告"
  ).length
  const geospatialWarnings = databases.filter(db => 
    db.id.startsWith('geo-') && db.status === "警告"
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据库管理</h1>
          <p className="text-muted-foreground">管理和监控所有数据库实例</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDatabaseOpen} onOpenChange={setIsCreateDatabaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Database className="mr-2 h-4 w-4" />
                创建数据库
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新数据库</DialogTitle>
                <DialogDescription>创建一个新的数据库实例</DialogDescription>
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
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="db-type" className="text-right">
                    数据库类型
                  </Label>
                  <Select
                    value={newDatabaseData.type}
                    onValueChange={(value) => setNewDatabaseData({...newDatabaseData, type: value})}
                  >
                    <SelectTrigger id="db-type" className="col-span-3">
                      <SelectValue placeholder="选择数据库类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relational">关系型数据库</SelectItem>
                      <SelectItem value="timeseries">时序数据库</SelectItem>
                      <SelectItem value="vector">向量数据库</SelectItem>
                      <SelectItem value="geospatial">地理空间数据库</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newDatabaseData.type === "relational" && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="db-charset" className="text-right">
                        字符集
                      </Label>
                      <Select
                        value={newDatabaseData.charset}
                        onValueChange={(value) => setNewDatabaseData({...newDatabaseData, charset: value})}
                      >
                        <SelectTrigger id="db-charset" className="col-span-3">
                          <SelectValue placeholder="选择字符集" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTF-8">UTF-8</SelectItem>
                          <SelectItem value="UTF-16">UTF-16</SelectItem>
                          <SelectItem value="ASCII">ASCII</SelectItem>
                          <SelectItem value="GBK">GBK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="db-collation" className="text-right">
                        排序规则
                      </Label>
                      <Select
                        value={newDatabaseData.collation}
                        onValueChange={(value) => setNewDatabaseData({...newDatabaseData, collation: value})}
                      >
                        <SelectTrigger id="db-collation" className="col-span-3">
                          <SelectValue placeholder="选择排序规则" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_US.UTF-8">en_US.UTF-8</SelectItem>
                          <SelectItem value="zh_CN.UTF-8">zh_CN.UTF-8</SelectItem>
                          <SelectItem value="C">C (Binary)</SelectItem>
                          <SelectItem value="POSIX">POSIX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDatabaseOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateDatabase}>创建数据库</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={async () => {
            try {
              setLoading(true)
              setError(null)
              const response = await databaseApi.getDatabases()
              if (response.success) {
                setDatabases(response.data)
              } else {
                setError(response.message)
              }
            } catch (err) {
              setError('刷新数据库数据失败')
              console.error(err)
            } finally {
              setLoading(false)
            }
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">关系型数据库</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationalCount}</div>
            <p className="text-xs text-muted-foreground">{relationalWarnings} 个实例需要注意</p>
            <Progress value={80} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">时序数据库</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeseriesCount}</div>
            <p className="text-xs text-muted-foreground">{timeseriesWarnings} 个实例需要注意</p>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">向量数据库</CardTitle>
            <Vector className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vectorCount}</div>
            <p className="text-xs text-muted-foreground">{vectorWarnings > 0 ? `${vectorWarnings} 个实例需要注意` : "所有实例正常"}</p>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">地理空间数据库</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{geospatialCount}</div>
            <p className="text-xs text-muted-foreground">{geospatialWarnings > 0 ? `${geospatialWarnings} 个实例需要注意` : "所有实例正常"}</p>
            <Progress value={30} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                    data={[
                      { name: "关系型", value: relationalCount, color: "#3b82f6" },
                      { name: "时序型", value: timeseriesCount, color: "#10b981" },
                      { name: "向量型", value: vectorCount, color: "#f59e0b" },
                      { name: "地理空间型", value: geospatialCount, color: "#8b5cf6" },
                    ]}
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : databases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">暂无数据库实例</h3>
              <p className="text-sm text-muted-foreground mt-1">点击"创建数据库"按钮添加第一个数据库</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDatabaseOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                创建第一个数据库
              </Button>
            </div>
          ) : (
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
                {databases.map((db) => (
                  <div key={db.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{db.id}</div>
                    <div>{db.name}</div>
                    <div>
                      {db.id.startsWith('postgres-') && "关系型"}
                      {db.id.startsWith('timeseries-') && "时序型"}
                      {db.id.startsWith('vector-') && "向量型"}
                      {db.id.startsWith('geo-') && "地理空间型"}
                    </div>
                    <div>{db.size}</div>
                    <div>
                      <Badge
                        variant={db.status === "正常" ? "success" : db.status === "警告" ? "warning" : "destructive"}
                      >
                        {db.status || "正常"}
                      </Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // 根据数据库类型跳转到不同页面
                          let path = "/dashboard/database"
                          if (db.id.startsWith('postgres-')) {
                            path += "/relational"
                          } else if (db.id.startsWith('timeseries-')) {
                            path += "/timeseries"
                          } else if (db.id.startsWith('vector-')) {
                            path += "/vector"
                          } else if (db.id.startsWith('geo-')) {
                            path += "/geospatial"
                          }
                          window.location.href = path
                        }}
                      >
                        查看
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // 根据数据库类型跳转到不同页面
                          let path = "/dashboard/database"
                          if (db.id.startsWith('postgres-')) {
                            path += "/relational"
                          } else if (db.id.startsWith('timeseries-')) {
                            path += "/timeseries"
                          } else if (db.id.startsWith('vector-')) {
                            path += "/vector"
                          } else if (db.id.startsWith('geo-')) {
                            path += "/geospatial"
                          }
                          window.location.href = path
                        }}
                      >
                        管理
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}