"use client"

import type React from "react"

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
  BarChart,
  Bar,
} from "recharts"
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  MailWarning,
  Plus,
  Settings,
  Trash2,
  XCircle,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { systemApi } from "@/api"

// Alert severity types with corresponding colors and icons
const severityConfig = {
  critical: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, badge: "destructive" },
  high: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle, badge: "orange" },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: MailWarning, badge: "yellow" },
  low: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Info, badge: "blue" },
  info: { color: "bg-slate-100 text-slate-800 border-slate-200", icon: Info, badge: "secondary" },
  resolved: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2, badge: "success" },
}

// Format date for display
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

// Calculate time ago for display
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return `${interval} 年前`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `${interval} 月前`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `${interval} 天前`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `${interval} 小时前`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `${interval} 分钟前`
  }

  return `${Math.floor(seconds)} 秒前`
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState("current")
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showAlertDetails, setShowAlertDetails] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [alerts, setAlerts] = useState<any[]>([])
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取告警数据
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const response = await systemApi.getSystemAlerts()
        if (response.success) {
          setAlerts(response.data)
          setAlertHistory(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取告警数据失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  // Filter alerts based on search query and severity filter
  const filteredActiveAlerts = alerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity

    return matchesSearch && matchesSeverity
  })

  const filteredAlertHistory = alertHistory.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity

    return matchesSearch && matchesSeverity
  })

  // Handle alert acknowledgement
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await systemApi.acknowledgeAlert(alertId)
      if (response.success) {
        // 更新本地状态
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
        setAlertHistory(alertHistory.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('确认告警失败')
      console.error(err)
    }
  }

  // Show alert details
  const viewAlertDetails = (alert: any) => {
    setSelectedAlert(alert)
    setShowAlertDetails(true)
  }

  // 解决告警
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await systemApi.resolveAlert(alertId)
      if (response.success) {
        // 更新本地状态
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true, resolvedAt: new Date() } : alert
        ))
        setAlertHistory(alertHistory.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true, resolvedAt: new Date() } : alert
        ))
        setShowAlertDetails(false)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('解决告警失败')
      console.error(err)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">告警管理</h1>
          <p className="text-muted-foreground">监控和管理系统告警，配置告警规则和通知渠道</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            通知设置
          </Button>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            创建告警规则
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>告警概览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-100 text-red-800 rounded-md">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                <span>严重</span>
              </div>
              <Badge variant="destructive">{alerts.filter((a) => a.severity === "critical").length}</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-100 text-orange-800 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>高危</span>
              </div>
              <Badge className="bg-orange-500">{alerts.filter((a) => a.severity === "high").length}</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-100 text-yellow-800 rounded-md">
              <div className="flex items-center">
                <MailWarning className="h-5 w-5 mr-2" />
                <span>中等</span>
              </div>
              <Badge className="bg-yellow-500">{alerts.filter((a) => a.severity === "medium").length}</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-100 text-blue-800 rounded-md">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <span>低危</span>
              </div>
              <Badge className="bg-blue-500">{alerts.filter((a) => a.severity === "low").length}</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-100 text-slate-800 rounded-md">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <span>信息</span>
              </div>
              <Badge variant="secondary">{alerts.filter((a) => a.severity === "info").length}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>告警管理</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="按严重程度筛选" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有严重程度</SelectItem>
                        <SelectItem value="critical">严重</SelectItem>
                        <SelectItem value="high">高危</SelectItem>
                        <SelectItem value="medium">中等</SelectItem>
                        <SelectItem value="low">低危</SelectItem>
                        <SelectItem value="info">信息</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="搜索告警..."
                      className="w-[200px] pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="current" onValueChange={setActiveTab}>
                <div className="border-b px-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="current" className="relative">
                      当前告警
                      {alerts.length > 0 && <Badge className="ml-2 bg-red-500">{alerts.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="history">历史告警</TabsTrigger>
                    <TabsTrigger value="rules">告警规则</TabsTrigger>
                    <TabsTrigger value="channels">通知渠道</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="current" className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <h3 className="text-lg font-medium">加载中...</h3>
                    </div>
                  ) : filteredActiveAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="text-lg font-medium">没有匹配的告警</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery || filterSeverity !== "all" ? "尝试调整筛选条件" : "当前没有活跃的告警"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredActiveAlerts.map((alert) => {
                        const SeverityIcon = severityConfig[alert.severity as keyof typeof severityConfig].icon
                        return (
                          <div
                            key={alert.id}
                            className={`p-4 hover:bg-muted/50 cursor-pointer ${severityConfig[alert.severity as keyof typeof severityConfig].color} border-l-4`}
                            onClick={() => viewAlertDetails(alert)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <SeverityIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium">{alert.title}</h4>
                                  <p className="text-sm mt-1">{alert.message}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                      variant={
                                        severityConfig[alert.severity as keyof typeof severityConfig].badge as any
                                      }
                                    >
                                      {alert.severity}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {timeAgo(alert.timestamp)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">来源: {alert.source}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    acknowledgeAlert(alert.id)
                                  }}
                                  disabled={alert.acknowledged}
                                >
                                  {alert.acknowledged ? "已确认" : "确认"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>严重程度</TableHead>
                          <TableHead>告警标题</TableHead>
                          <TableHead>来源</TableHead>
                          <TableHead>触发时间</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                <p className="text-muted-foreground">加载中...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredAlertHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">没有匹配的告警历史记录</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAlertHistory.map((alert) => {
                            const SeverityIcon = severityConfig[alert.severity as keyof typeof severityConfig].icon
                            return (
                              <TableRow
                                key={alert.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => viewAlertDetails(alert)}
                              >
                                <TableCell>
                                  <div className="flex items-center">
                                    <SeverityIcon className="h-4 w-4 mr-2" />
                                    <Badge
                                      variant={
                                        severityConfig[alert.severity as keyof typeof severityConfig].badge as any
                                      }
                                    >
                                      {alert.severity}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{alert.title}</TableCell>
                                <TableCell>{alert.source}</TableCell>
                                <TableCell>{formatDate(alert.timestamp)}</TableCell>
                                <TableCell>
                                  {alert.resolved ? (
                                    <Badge variant="success">已解决</Badge>
                                  ) : alert.acknowledged ? (
                                    <Badge variant="secondary">已确认</Badge>
                                  ) : (
                                    <Badge variant="destructive">未处理</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      viewAlertDetails(alert)
                                    }}
                                  >
                                    详情
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="p-0">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">告警规则配置</h3>
                      <p className="text-sm text-muted-foreground">配置系统监控的告警触发条件和响应操作</p>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      添加规则
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>规则名称</TableHead>
                          <TableHead>条件</TableHead>
                          <TableHead>严重程度</TableHead>
                          <TableHead>目标</TableHead>
                          <TableHead>通知渠道</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                <p className="text-muted-foreground">加载中...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          [
                            {
                              id: "rule-001",
                              name: "CPU使用率监控",
                              description: "当CPU使用率超过阈值时触发告警",
                              condition: "CPU使用率 > 90% 持续 5分钟",
                              severity: "critical",
                              enabled: true,
                              target: "所有节点",
                              notificationChannels: ["邮件", "短信", "系统通知"],
                            },
                            {
                              id: "rule-002",
                              name: "磁盘空间监控",
                              description: "当磁盘可用空间低于阈值时触发告警",
                              condition: "可用空间 < 10%",
                              severity: "high",
                              enabled: true,
                              target: "存储节点",
                              notificationChannels: ["邮件", "系统通知"],
                            },
                            {
                              id: "rule-003",
                              name: "数据库连接监控",
                              description: "当数据库连接数接近上限时触发告警",
                              condition: "连接数 > 配置上限的 80%",
                              severity: "medium",
                              enabled: true,
                              target: "数据库实例",
                              notificationChannels: ["系统通知"],
                            },
                            {
                              id: "rule-004",
                              name: "备份任务监控",
                              description: "当备份任务失败时触发告警",
                              condition: "备份任务状态 = 失败",
                              severity: "high",
                              enabled: true,
                              target: "备份系统",
                              notificationChannels: ["邮件", "短信", "系统通知"],
                            },
                            {
                              id: "rule-005",
                              name: "节点状态监控",
                              description: "当节点离线时触发告警",
                              condition: "节点状态 = 离线 持续 1分钟",
                              severity: "critical",
                              enabled: true,
                              target: "所有节点",
                              notificationChannels: ["邮件", "短信", "系统通知"],
                            },
                          ].map((rule) => {
                            const SeverityIcon = severityConfig[rule.severity as keyof typeof severityConfig].icon
                            return (
                              <TableRow key={rule.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{rule.name}</div>
                                    <div className="text-xs text-muted-foreground">{rule.description}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{rule.condition}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <SeverityIcon className="h-4 w-4 mr-2" />
                                    <Badge
                                      variant={severityConfig[rule.severity as keyof typeof severityConfig].badge as any}
                                    >
                                      {rule.severity}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{rule.target}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {rule.notificationChannels.map((channel, idx) => (
                                      <Badge key={idx} variant="outline">
                                        {channel}
                                      </Badge>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Switch checked={rule.enabled} />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="channels" className="p-0">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">通知渠道配置</h3>
                      <p className="text-sm text-muted-foreground">配置告警通知的接收方式和接收人</p>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      添加渠道
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>渠道名称</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>接收人</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                <p className="text-muted-foreground">加载中...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          [
                            {
                              id: "channel-001",
                              name: "系统管理员邮件组",
                              type: "邮件",
                              recipients: "admin@example.com, sysops@example.com",
                              enabled: true,
                            },
                            {
                              id: "channel-002",
                              name: "运维团队短信",
                              type: "短信",
                              recipients: "+86 13800138000, +86 13900139000",
                              enabled: true,
                            },
                            {
                              id: "channel-003",
                              name: "系统内通知",
                              type: "系统通知",
                              recipients: "所有管理员用户",
                              enabled: true,
                            },
                            {
                              id: "channel-004",
                              name: "Webhook集成",
                              type: "Webhook",
                              recipients: "https://api.example.com/alerts",
                              enabled: false,
                            },
                          ].map((channel) => (
                            <TableRow key={channel.id}>
                              <TableCell>
                                <div className="font-medium">{channel.name}</div>
                              </TableCell>
                              <TableCell>{channel.type}</TableCell>
                              <TableCell>{channel.recipients}</TableCell>
                              <TableCell>
                                <Switch checked={channel.enabled} />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent className="max-w-2xl">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mb-2 ${severityConfig[selectedAlert.severity as keyof typeof severityConfig].color}`}
                >
                  {selectedAlert.severity}
                </div>
                <DialogTitle className="text-xl">{selectedAlert.title}</DialogTitle>
                <DialogDescription>
                  告警 ID: {selectedAlert.id} | 触发时间: {formatDate(selectedAlert.timestamp)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">告警详情</h4>
                  <p>{selectedAlert.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">来源</h4>
                    <p>{selectedAlert.source}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">状态</h4>
                    <p>
                      {selectedAlert.resolved ? (
                        <Badge variant="success">已解决</Badge>
                      ) : selectedAlert.acknowledged ? (
                        <Badge variant="secondary">已确认</Badge>
                      ) : (
                        <Badge variant="destructive">未处理</Badge>
                      )}
                    </p>
                  </div>
                </div>

                {selectedAlert.resolved && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">解决时间</h4>
                    <p>{formatDate(selectedAlert.resolvedAt)}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">建议操作</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>检查系统资源使用情况</li>
                    <li>查看相关服务日志</li>
                    <li>检查网络连接状态</li>
                    <li>联系系统管理员进行进一步排查</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                {!selectedAlert.resolved && (
                  <div className="flex gap-2">
                    {!selectedAlert.acknowledged && (
                      <Button variant="outline" onClick={() => acknowledgeAlert(selectedAlert.id)}>
                        确认告警
                      </Button>
                    )}
                    <Button onClick={() => resolveAlert(selectedAlert.id)}>解决告警</Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}