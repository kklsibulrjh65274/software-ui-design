"use client"

import { useState } from "react"
import { Upload, Download, CheckCircle, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const importTasks = [
  {
    id: "import-001",
    name: "用户数据导入",
    source: "users.csv",
    target: "users",
    database: "postgres-main",
    status: "完成",
    progress: 100,
    rows: 15420,
    created: "2023-05-09 14:30:22",
  },
  {
    id: "import-002",
    name: "产品数据导入",
    source: "products.csv",
    target: "products",
    database: "postgres-main",
    status: "进行中",
    progress: 65,
    rows: 8500,
    created: "2023-05-10 09:15:45",
  },
  {
    id: "import-003",
    name: "订单历史导入",
    source: "orders_history.csv",
    target: "orders",
    database: "postgres-main",
    status: "失败",
    progress: 32,
    rows: 25000,
    created: "2023-05-08 16:42:10",
  },
]

const exportTasks = [
  {
    id: "export-001",
    name: "用户数据导出",
    source: "users",
    target: "users_backup.csv",
    database: "postgres-main",
    status: "完成",
    progress: 100,
    rows: 15420,
    created: "2023-05-07 11:20:15",
  },
  {
    id: "export-002",
    name: "月度报表导出",
    source: "monthly_report",
    target: "report_2023_04.xlsx",
    database: "postgres-analytics",
    status: "完成",
    progress: 100,
    rows: 1250,
    created: "2023-05-01 08:30:00",
  },
]

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState("import")
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  const handleStartImport = () => {
    setIsImporting(true)
    setImportProgress(0)

    // 模拟导入进度
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        const next = prev + 5
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsImporting(false)
          }, 1000)
          return 100
        }
        return next
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据导入导出</h1>
          <p className="text-muted-foreground">导入和导出数据库数据</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">数据导入</TabsTrigger>
          <TabsTrigger value="export">数据导出</TabsTrigger>
          <TabsTrigger value="tasks">任务状态</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导入数据</CardTitle>
              <CardDescription>将外部数据导入到数据库中</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="import-name">任务名称</Label>
                  <Input id="import-name" placeholder="输入导入任务名称" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-database">目标数据库</Label>
                  <Select>
                    <SelectTrigger id="import-database">
                      <SelectValue placeholder="选择数据库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres-main">主数据库 (postgres-main)</SelectItem>
                      <SelectItem value="postgres-replica">副本数据库 (postgres-replica)</SelectItem>
                      <SelectItem value="timeseries-01">监控数据库 (timeseries-01)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="import-table">目标表</Label>
                  <Select>
                    <SelectTrigger id="import-table">
                      <SelectValue placeholder="选择表" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="users">用户表 (users)</SelectItem>
                      <SelectItem value="products">产品表 (products)</SelectItem>
                      <SelectItem value="orders">订单表 (orders)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-format">文件格式</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger id="import-format">
                      <SelectValue placeholder="选择格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">选择文件</Label>
                <div className="flex items-center gap-2">
                  <Input id="import-file" type="file" className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>导入选项</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-header" />
                    <label
                      htmlFor="import-header"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      文件包含标题行
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-truncate" />
                    <label
                      htmlFor="import-truncate"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      导入前清空表
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-ignore-errors" />
                    <label
                      htmlFor="import-ignore-errors"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      忽略错误并继续
                    </label>
                  </div>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">导入进度</span>
                    <span className="text-sm">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">正在导入数据，请勿关闭页面...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" disabled={isImporting}>
                取消
              </Button>
              <Button onClick={handleStartImport} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    开始导入
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导出数据</CardTitle>
              <CardDescription>将数据库数据导出到文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="export-name">任务名称</Label>
                  <Input id="export-name" placeholder="输入导出任务名称" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-database">源数据库</Label>
                  <Select>
                    <SelectTrigger id="export-database">
                      <SelectValue placeholder="选择数据库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres-main">主数据库 (postgres-main)</SelectItem>
                      <SelectItem value="postgres-replica">副本数据库 (postgres-replica)</SelectItem>
                      <SelectItem value="timeseries-01">监控数据库 (timeseries-01)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-source">数据源</Label>
                <Select>
                  <SelectTrigger id="export-source">
                    <SelectValue placeholder="选择数据源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">表</SelectItem>
                    <SelectItem value="query">SQL 查询</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-table">选择表</Label>
                <Select>
                  <SelectTrigger id="export-table">
                    <SelectValue placeholder="选择表" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">用户表 (users)</SelectItem>
                    <SelectItem value="products">产品表 (products)</SelectItem>
                    <SelectItem value="orders">订单表 (orders)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="export-format">文件格式</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="选择格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-filename">文件名</Label>
                  <Input id="export-filename" placeholder="输入导出文件名" defaultValue="export.csv" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>导出选项</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-header" defaultChecked />
                    <label
                      htmlFor="export-header"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      包含标题行
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-compress" />
                    <label
                      htmlFor="export-compress"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      压缩文件
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">取消</Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                开始导出
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导入任务</CardTitle>
              <CardDescription>数据导入任务状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>任务名称</div>
                  <div>源文件</div>
                  <div>目标表</div>
                  <div>数据库</div>
                  <div>状态</div>
                  <div>进度</div>
                  <div>创建时间</div>
                </div>
                <div className="divide-y">
                  {importTasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                      <div className="font-medium">{task.name}</div>
                      <div>{task.source}</div>
                      <div>{task.target}</div>
                      <div>{task.database}</div>
                      <div>
                        <Badge
                          variant={
                            task.status === "完成" ? "success" : task.status === "进行中" ? "default" : "destructive"
                          }
                        >
                          {task.status === "完成" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {task.status === "进行中" && <Clock className="mr-1 h-3 w-3" />}
                          {task.status === "失败" && <XCircle className="mr-1 h-3 w-3" />}
                          {task.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      </div>
                      <div>{task.created}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>导出任务</CardTitle>
              <CardDescription>数据导出任务状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>任务名称</div>
                  <div>源表</div>
                  <div>目标文件</div>
                  <div>数据库</div>
                  <div>状态</div>
                  <div>进度</div>
                  <div>创建时间</div>
                </div>
                <div className="divide-y">
                  {exportTasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                      <div className="font-medium">{task.name}</div>
                      <div>{task.source}</div>
                      <div>{task.target}</div>
                      <div>{task.database}</div>
                      <div>
                        <Badge
                          variant={
                            task.status === "完成" ? "success" : task.status === "进行中" ? "default" : "destructive"
                          }
                        >
                          {task.status === "完成" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {task.status === "进行中" && <Clock className="mr-1 h-3 w-3" />}
                          {task.status === "失败" && <XCircle className="mr-1 h-3 w-3" />}
                          {task.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      </div>
                      <div>{task.created}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
