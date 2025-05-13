"use client"

import { useState, useEffect } from "react"
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
  Trash2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// 导入 API
import { monitoringApi } from "@/api"
import { BackupHistory, BackupSchedule } from "@/mock/dashboard/types"

export default function BackupManagementPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([])
  const [loading, setLoading] = useState({
    history: true,
    schedules: true
  })
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newScheduleData, setNewScheduleData] = useState({
    name: "",
    type: "增量",
    schedule: "每天 00:00",
    target: "所有数据库",
    retention: "7天",
    status: "启用"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取备份历史
        setLoading(prev => ({ ...prev, history: true }))
        const historyResponse = await monitoringApi.getBackupHistory()
        if (historyResponse.success) {
          setBackupHistory(historyResponse.data)
        } else {
          setError(historyResponse.message)
        }
        
        // 获取备份计划
        setLoading(prev => ({ ...prev, schedules: true }))
        const schedulesResponse = await monitoringApi.getBackupSchedules()
        if (schedulesResponse.success) {
          setBackupSchedules(schedulesResponse.data)
        } else {
          setError(schedulesResponse.message)
        }
      } catch (err) {
        setError('获取备份数据失败')
        console.error(err)
      } finally {
        setLoading({
          history: false,
          schedules: false
        })
      }
    }

    fetchData()
  }, [])

  const handleStartBackup = async () => {
    try {
      setIsBackingUp(true)
      setBackupProgress(0)
      setError(null)
      
      // 创建手动备份
      const response = await monitoringApi.createManualBackup({
        name: "手动备份",
        type: "完整"
      })
      
      if (!response.success) {
        setError(response.message)
        setIsBackingUp(false)
        return
      }
      
      // 模拟备份进度
      const interval = setInterval(() => {
        setBackupProgress((prev) => {
          const next = prev + 5
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsBackingUp(false)
              // 添加新备份到历史记录
              setBackupHistory(prev => [response.data, ...prev])
            }, 1000)
            return 100
          }
          return next
        })
      }, 500)
    } catch (err) {
      setError('启动备份失败')
      console.error(err)
      setIsBackingUp(false)
    }
  }

  const handleOpenRestoreDialog = (backupId: string) => {
    setSelectedBackup(backupId)
    setIsRestoreDialogOpen(true)
  }
  
  const handleCreateSchedule = async () => {
    if (!newScheduleData.name || !newScheduleData.schedule) {
      setError('计划名称和执行时间不能为空')
      return
    }
    
    try {
      setLoading(prev => ({ ...prev, schedules: true }))
      setError(null)
      
      const response = await monitoringApi.createBackupSchedule({
        name: newScheduleData.name,
        type: newScheduleData.type,
        schedule: newScheduleData.schedule,
        target: newScheduleData.target,
        retention: newScheduleData.retention,
        status: newScheduleData.status,
        lastRun: "-",
        nextRun: calculateNextRun(newScheduleData.schedule)
      })
      
      if (response.success) {
        setBackupSchedules([...backupSchedules, response.data])
        setIsCreateScheduleOpen(false)
        setNewScheduleData({
          name: "",
          type: "增量",
          schedule: "每天 00:00",
          target: "所有数据库",
          retention: "7天",
          status: "启用"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建备份计划失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }))
    }
  }
  
  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, schedules: true }))
      setError(null)
      
      const response = await monitoringApi.deleteBackupSchedule(scheduleToDelete)
      
      if (response.success) {
        setBackupSchedules(backupSchedules.filter(schedule => schedule.id !== scheduleToDelete))
        setIsConfirmDeleteOpen(false)
        setScheduleToDelete(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除备份计划失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }))
    }
  }
  
  // 计算下次执行时间
  const calculateNextRun = (schedule: string): string => {
    const now = new Date()
    
    if (schedule.startsWith('每天')) {
      const time = schedule.split(' ')[1]
      const [hours, minutes] = time.split(':').map(Number)
      const nextRun = new Date(now)
      nextRun.setHours(hours, minutes, 0, 0)
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      return nextRun.toISOString().replace('T', ' ').substring(0, 19)
    }
    
    if (schedule.startsWith('每周')) {
      const day = schedule.split(' ')[1]
      const time = schedule.split(' ')[2]
      const [hours, minutes] = time.split(':').map(Number)
      
      const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']
      const targetDay = daysOfWeek.indexOf(day)
      
      const nextRun = new Date(now)
      nextRun.setHours(hours, minutes, 0, 0)
      
      // 计算下一个目标星期几
      const currentDay = nextRun.getDay()
      const daysToAdd = (targetDay + 7 - currentDay) % 7
      
      nextRun.setDate(nextRun.getDate() + daysToAdd)
      if (daysToAdd === 0 && nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7)
      }
      
      return nextRun.toISOString().replace('T', ' ').substring(0, 19)
    }
    
    if (schedule.startsWith('每月')) {
      const day = parseInt(schedule.split('日')[0].split('每月')[1])
      const time = schedule.split(' ')[1]
      const [hours, minutes] = time.split(':').map(Number)
      
      const nextRun = new Date(now)
      nextRun.setDate(day)
      nextRun.setHours(hours, minutes, 0, 0)
      
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
      
      return nextRun.toISOString().replace('T', ' ').substring(0, 19)
    }
    
    return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
  }
  
  // 过滤备份历史
  const filteredHistory = backupHistory.filter(backup => {
    const matchesSearch = 
      backup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backup.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || backup.type === typeFilter
    const matchesStatus = statusFilter === 'all' || backup.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

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

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                <p className="text-xs text-muted-foreground">
                  {backupHistory.length > 0 
                    ? `最近备份于 ${backupHistory[0].endTime}` 
                    : "尚未执行备份"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">备份大小</CardTitle>
                <Save className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backupHistory.length > 0 ? backupHistory[0].size : "0 GB"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backupHistory.length > 1 
                    ? `较上次 ${compareSizes(backupHistory[0].size, backupHistory[1].size)}` 
                    : "无历史数据"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">备份时长</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backupHistory.length > 0 ? backupHistory[0].duration : "0 分钟"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backupHistory.length > 1 
                    ? `较上次 ${compareDurations(backupHistory[0].duration, backupHistory[1].duration)}` 
                    : "无历史数据"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">下次备份</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backupSchedules.length > 0 
                    ? formatNextRun(backupSchedules[0].nextRun) 
                    : "未计划"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {backupSchedules.length > 0 
                    ? `${backupSchedules[0].type}备份` 
                    : "无备份计划"}
                </p>
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
              {loading.history ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : backupHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <Save className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无备份历史数据</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleStartBackup}
                    disabled={isBackingUp}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    创建第一个备份
                  </Button>
                </div>
              ) : (
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
              )}
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
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="搜索备份..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="筛选类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="自动">自动备份</SelectItem>
                    <SelectItem value="手动">手动备份</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="筛选状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="成功">成功</SelectItem>
                    <SelectItem value="失败">失败</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => {
                  setSearchQuery("")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }}>
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">重置筛选</span>
                </Button>
              </div>

              {loading.history ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <Save className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {backupHistory.length === 0 
                      ? "暂无备份历史数据" 
                      : "没有符合筛选条件的备份"}
                  </p>
                  {backupHistory.length === 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleStartBackup}
                      disabled={isBackingUp}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      创建第一个备份
                    </Button>
                  )}
                </div>
              ) : (
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
                    {filteredHistory.map((backup) => (
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>备份操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleOpenRestoreDialog(backup.id)}
                                disabled={backup.status !== "成功"}
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                恢复
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled={backup.status !== "成功"}>
                                <Download className="mr-2 h-4 w-4" />
                                下载
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    添加计划
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建备份计划</DialogTitle>
                    <DialogDescription>
                      创建一个新的自动备份计划
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-name" className="text-right">
                        计划名称
                      </Label>
                      <Input
                        id="schedule-name"
                        value={newScheduleData.name}
                        onChange={(e) => setNewScheduleData({...newScheduleData, name: e.target.value})}
                        placeholder="输入计划名称"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-type" className="text-right">
                        备份类型
                      </Label>
                      <Select
                        value={newScheduleData.type}
                        onValueChange={(value) => setNewScheduleData({...newScheduleData, type: value})}
                      >
                        <SelectTrigger id="schedule-type" className="col-span-3">
                          <SelectValue placeholder="选择备份类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="增量">增量备份</SelectItem>
                          <SelectItem value="完整">完整备份</SelectItem>
                          <SelectItem value="差异">差异备份</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-time" className="text-right">
                        执行时间
                      </Label>
                      <Select
                        value={newScheduleData.schedule}
                        onValueChange={(value) => setNewScheduleData({...newScheduleData, schedule: value})}
                      >
                        <SelectTrigger id="schedule-time" className="col-span-3">
                          <SelectValue placeholder="选择执行时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="每天 00:00">每天 00:00</SelectItem>
                          <SelectItem value="每天 12:00">每天 12:00</SelectItem>
                          <SelectItem value="每周日 01:00">每周日 01:00</SelectItem>
                          <SelectItem value="每月1日 01:00">每月1日 01:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-target" className="text-right">
                        备份目标
                      </Label>
                      <Select
                        value={newScheduleData.target}
                        onValueChange={(value) => setNewScheduleData({...newScheduleData, target: value})}
                      >
                        <SelectTrigger id="schedule-target" className="col-span-3">
                          <SelectValue placeholder="选择备份目标" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="所有数据库">所有数据库</SelectItem>
                          <SelectItem value="关系型数据库">关系型数据库</SelectItem>
                          <SelectItem value="时序数据库">时序数据库</SelectItem>
                          <SelectItem value="向量数据库">向量数据库</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="schedule-retention" className="text-right">
                        保留策略
                      </Label>
                      <Select
                        value={newScheduleData.retention}
                        onValueChange={(value) => setNewScheduleData({...newScheduleData, retention: value})}
                      >
                        <SelectTrigger id="schedule-retention" className="col-span-3">
                          <SelectValue placeholder="选择保留策略" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7天">保留7天</SelectItem>
                          <SelectItem value="30天">保留30天</SelectItem>
                          <SelectItem value="90天">保留90天</SelectItem>
                          <SelectItem value="365天">保留365天</SelectItem>
                          <SelectItem value="永久">永久保留</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateScheduleOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateSchedule}>创建计划</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading.schedules ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : backupSchedules.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">暂无备份计划</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreateScheduleOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    创建第一个备份计划
                  </Button>
                </div>
              ) : (
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
                          <Badge variant={schedule.status === "启用" ? "success" : "secondary"}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{schedule.lastRun}</TableCell>
                        <TableCell>{schedule.nextRun}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>计划操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                编辑计划
                              </DropdownMenuItem>
                              {schedule.status === "启用" ? (
                                <DropdownMenuItem>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  禁用计划
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  启用计划
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Save className="mr-2 h-4 w-4" />
                                立即执行
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  setScheduleToDelete(schedule.id)
                                  setIsConfirmDeleteOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除计划
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>备份路径设置</CardTitle>
              <CardDescription>配置系统备份的存储位置和策略</CardDescription>
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
                <Label htmlFor="backup-schedule">备份计划</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-schedule">
                    <SelectValue placeholder="选择备份计划" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">每小时</SelectItem>
                    <SelectItem value="daily">每天</SelectItem>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">自动备份的执行频率</p>
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
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={handleStartBackup} disabled={isBackingUp}>
                {isBackingUp ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    备份中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    立即备份
                  </>
                )}
              </Button>
              <Button type="button">
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 从备份恢复对话框 */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>从备份恢复</DialogTitle>
            <DialogDescription>
              您确定要从选定的备份恢复系统吗？此操作将覆盖当前数据，无法撤销。
            </DialogDescription>
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
            <Button variant="destructive" onClick={() => {
              // 模拟恢复操作
              alert(`从备份 ${selectedBackup} 恢复系统数据`)
              setIsRestoreDialogOpen(false)
            }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 确认删除计划对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除备份计划</DialogTitle>
            <DialogDescription>
              您确定要删除此备份计划吗？删除后将不再执行自动备份。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除备份计划后，系统将不再按照此计划执行自动备份。已经创建的备份不会被删除。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 辅助函数：比较备份大小
function compareSizes(current: string, previous: string): string {
  const currentSize = parseFloat(current.replace(' GB', ''))
  const previousSize = parseFloat(previous.replace(' GB', ''))
  
  if (isNaN(currentSize) || isNaN(previousSize)) return ''
  
  const diff = currentSize - previousSize
  return diff >= 0 ? `+${diff.toFixed(1)} GB` : `${diff.toFixed(1)} GB`
}

// 辅助函数：比较备份时长
function compareDurations(current: string, previous: string): string {
  // 简化处理，假设格式为 "XX分钟"
  const currentMinutes = parseInt(current.replace('分钟', ''))
  const previousMinutes = parseInt(previous.replace('分钟', ''))
  
  if (isNaN(currentMinutes) || isNaN(previousMinutes)) return ''
  
  const diff = currentMinutes - previousMinutes
  return diff >= 0 ? `+${diff} 分钟` : `-${Math.abs(diff)} 分钟`
}

// 辅助函数：格式化下次执行时间
function formatNextRun(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  const now = new Date()
  
  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 如果是明天
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `明天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 其他情况
  return dateTimeString
}