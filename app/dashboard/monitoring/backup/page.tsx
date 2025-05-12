"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  RotateCcw,
  FileText,
  Settings,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 模拟备份历史数据
const backupHistory = [
  {
    id: "backup-001",
    name: "每日自动备份",
    type: "自动",
    status: "成功",
    size: "2.4 GB",
    startTime: "2023-05-10 00:00:00",
    endTime: "2023-05-10 00:45:22",
    duration: "45分钟",
  },
  {
    id: "backup-002",
    name: "每周完整备份",
    type: "自动",
    status: "成功",
    size: "8.7 GB",
    startTime: "2023-05-07 01:00:00",
    endTime: "2023-05-07 02:35:15",
    duration: "1小时35分钟",
  },
  {
    id: "backup-003",
    name: "版本发布前备份",
    type: "手动",
    status: "成功",
    size: "7.2 GB",
    startTime: "2023-05-05 10:15:00",
    endTime: "2023-05-05 11:42:30",
    duration: "1小时27分钟",
  },
  {
    id: "backup-004",
    name: "数据库迁移前备份",
    type: "手动",
    status: "失败",
    size: "-",
    startTime: "2023-05-03 14:30:00",
    endTime: "2023-05-03 14:45:12",
    duration: "15分钟",
  },
  {
    id: "backup-005",
    name: "每月完整备份",
    type: "自动",
    status: "成功",
    size: "10.5 GB",
    startTime: "2023-05-01 01:00:00",
    endTime: "2023-05-01 03:12:45",
    duration: "2小时12分钟",
  },
]

// 模拟备份计划数据
const backupSchedules = [
  {
    id: "schedule-001",
    name: "每日增量备份",
    type: "增量",
    schedule: "每天 00:00",
    target: "所有数据库",
    retention: "7天",
    status: "启用",
    lastRun: "2023-05-10 00:00:00",
    nextRun: "2023-05-11 00:00:00",
  },
  {
    id: "schedule-002",
    name: "每周完整备份",
    type: "完整",
    schedule: "每周日 01:00",
    target: "所有数据库",
    retention: "4周",
    status: "启用",
    lastRun: "2023-05-07 01:00:00",
    nextRun: "2023-05-14 01:00:00",
  },
  {
    id: "schedule-003",
    name: "每月归档备份",
    type: "完整",
    schedule: "每月1日 01:00",
    target: "所有数据库",
    retention: "12个月",
    status: "启用",
    lastRun: "2023-05-01 01:00:00",
    nextRun: "2023-06-01 01:00:00",
  },
]

export default function BackupManagementPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  const handleStartBackup = () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    // 模拟备份进度
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        const next = prev + 5
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsBackingUp(false)
          }, 1000)
          return 100
        }
        return next
      })
    }, 500)
  }

  const handleOpenRestoreDialog = (backupId: string) => {
    setSelectedBackup(backupId)
    setIsRestoreDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">备份管理</h1>
          <p className="text-muted-foreground">管理系统备份和恢复</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleStartBackup} disabled={isBackingUp}>
            {isBackingUp ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                备份中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                立即备份
              </>
            )}
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            备份设置
          </Button>
        </div>
      </div>

      {isBackingUp && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">备份进度</span>
                <span className="text-sm">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">正在备份系统数据，请勿关闭页面...</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">备份概览</TabsTrigger>
          <TabsTrigger value="history">备份历史</TabsTrigger>
          <TabsTrigger value="schedules">备份计划</TabsTrigger>
          <TabsTrigger value="settings">备份设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最近备份状态</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">成功</div>
                <p className="text-xs text-muted-foreground">最近备份于 2023-05-10 00:45:22</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">备份大小</CardTitle>
                <Save className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4 GB</div>
                <p className="text-xs text-muted-foreground">较上次 +0.2 GB</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">备份时长</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 分钟</div>
                <p className="text-xs text-muted-foreground">较上次 -5 分钟</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">下次备份</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">今天 00:00</div>
                <p className="text-xs text-muted-foreground">每日增量备份</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>备份存储使用情况</CardTitle>
              <CardDescription>备份存储空间使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">总备份存储空间</span>
                    <span className="text-sm font-medium">28.8 GB / 100 GB</span>
                  </div>
                  <Progress value={28.8} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">备份类型分布</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">每日增量备份</span>
                        <span className="text-xs font-medium">7.5 GB</span>
                      </div>
                      <Progress value={7.5} max={28.8} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">每周完整备份</span>
                        <span className="text-xs font-medium">8.7 GB</span>
                      </div>
                      <Progress
                        value={8.7}
                        max={28.8}
                        className="h-1.5 bg-green-100"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">每月归档备份</span>
                        <span className="text-xs font-medium">12.6 GB</span>
                      </div>
                      <Progress
                        value={12.6}
                        max={28.8}
                        className="h-1.5 bg-amber-100"
                        indicatorClassName="bg-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近备份</CardTitle>
              <CardDescription>最近 3 次备份记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>备份名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>完成时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.slice(0, 3).map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.name}</TableCell>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>
                        <Badge variant={backup.status === "成功" ? "success" : "destructive"}>
                          {backup.status === "成功" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.endTime}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRestoreDialog(backup.id)}
                          disabled={backup.status !== "成功"}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          恢复
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("history")}>
                查看全部
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>备份历史记录</CardTitle>
              <CardDescription>所有备份的历史记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Input type="search" placeholder="搜索备份..." className="pl-8" />
                  <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="筛选状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="success">成功</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>备份名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>结束时间</TableHead>
                    <TableHead>耗时</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.name}</TableCell>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>
                        <Badge variant={backup.status === "成功" ? "success" : "destructive"}>
                          {backup.status === "成功" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.startTime}</TableCell>
                      <TableCell>{backup.endTime}</TableCell>
                      <TableCell>{backup.duration}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRestoreDialog(backup.id)}
                          disabled={backup.status !== "成功"}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          恢复
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>备份计划</CardTitle>
                <CardDescription>配置自动备份计划</CardDescription>
              </div>
              <Button size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                添加计划
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>计划名称</TableHead>
                    <TableHead>备份类型</TableHead>
                    <TableHead>执行时间</TableHead>
                    <TableHead>备份目标</TableHead>
                    <TableHead>保留策略</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>上次执行</TableHead>
                    <TableHead>下次执行</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.type}</TableCell>
                      <TableCell>{schedule.schedule}</TableCell>
                      <TableCell>{schedule.target}</TableCell>
                      <TableCell>{schedule.retention}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.status === "启用" ? "success" : "secondary"}>{schedule.status}</Badge>
                      </TableCell>
                      <TableCell>{schedule.lastRun}</TableCell>
                      <TableCell>{schedule.nextRun}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          编辑
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>备份设置</CardTitle>
              <CardDescription>配置备份的全局设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backup-path">备份存储路径</Label>
                  <Input id="backup-path" defaultValue="/data/backups" />
                  <p className="text-xs text-muted-foreground">系统备份文件的存储路径</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">默认保留策略</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="backup-retention">
                      <SelectValue placeholder="选择保留策略" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">保留 7 天</SelectItem>
                      <SelectItem value="14">保留 14 天</SelectItem>
                      <SelectItem value="30">保留 30 天</SelectItem>
                      <SelectItem value="90">保留 90 天</SelectItem>
                      <SelectItem value="365">保留 365 天</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">自动备份的保留时间</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>备份选项</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="compression-enabled" defaultChecked />
                    <label
                      htmlFor="compression-enabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      启用压缩
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="encryption-enabled" defaultChecked />
                    <label
                      htmlFor="encryption-enabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      启用加密
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verify-backup" defaultChecked />
                    <label
                      htmlFor="verify-backup"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      备份后验证
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-on-completion" defaultChecked />
                    <label
                      htmlFor="notify-on-completion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      备份完成后通知
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parallel-jobs">并行备份任务数</Label>
                <Select defaultValue="2">
                  <SelectTrigger id="parallel-jobs">
                    <SelectValue placeholder="选择并行任务数" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 个任务</SelectItem>
                    <SelectItem value="2">2 个任务</SelectItem>
                    <SelectItem value="4">4 个任务</SelectItem>
                    <SelectItem value="8">8 个任务</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">同时执行的备份任务数量</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">重置</Button>
              <Button>保存设置</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>从备份恢复</DialogTitle>
            <DialogDescription>您确定要从选定的备份恢复系统吗？此操作将覆盖当前数据，无法撤销。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选择恢复选项</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="restore-all" defaultChecked />
                  <label
                    htmlFor="restore-all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    恢复所有数据
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="restore-validate" defaultChecked />
                  <label
                    htmlFor="restore-validate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    恢复前验证备份
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="restore-backup" defaultChecked />
                  <label
                    htmlFor="restore-backup"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    恢复前备份当前数据
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-amber-50 p-4 text-amber-800 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h3 className="font-medium">警告</h3>
              </div>
              <p className="mt-1 text-sm">恢复操作将覆盖当前系统数据。此操作无法撤销。请确保您已了解恢复的影响。</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => setIsRestoreDialogOpen(false)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}