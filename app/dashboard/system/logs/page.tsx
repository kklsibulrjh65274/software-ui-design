"use client"

import { useState, useEffect } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Download,
  Filter,
  Info,
  RefreshCw,
  Search,
  Server,
  Settings,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { systemApi } from "@/api"

// 日志级别图标映射
const levelIcons = {
  错误: <AlertCircle className="h-4 w-4 text-red-500" />,
  警告: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  信息: <Info className="h-4 w-4 text-blue-500" />,
  调试: <Check className="h-4 w-4 text-green-500" />,
}

// 日志级别颜色映射
const levelColors = {
  错误: "bg-red-100 text-red-800 hover:bg-red-200",
  警告: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  信息: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  调试: "bg-green-100 text-green-800 hover:bg-green-200",
}

export default function LogsManagementPage() {
  // 状态管理
  const [activeTab, setActiveTab] = useState("system")
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["错误", "警告", "信息", "调试"])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isRealtime, setIsRealtime] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [retentionDays, setRetentionDays] = useState(30)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取日志数据
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        const params: QueryParams = {}
        
        if (searchQuery) {
          params.search = searchQuery
        }
        
        if (selectedLevels.length < 4) {
          params.filter = { level: selectedLevels }
        }
        
        if (selectedSources.length > 0) {
          params.filter = { ...params.filter, source: selectedSources }
        }
        
        const response = await systemApi.getSystemLogs(params)
        if (response.success) {
          setLogs(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取日志数据失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
    
    // 如果启用了实时更新，设置定时器
    let interval: NodeJS.Timeout | null = null
    if (isRealtime) {
      interval = setInterval(fetchLogs, 30000) // 每30秒刷新一次
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [searchQuery, selectedLevels, selectedSources, dateRange, isRealtime])

  // 日志级别切换
  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== level))
    } else {
      setSelectedLevels([...selectedLevels, level])
    }
  }

  // 源过滤切换
  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source))
    } else {
      setSelectedSources([...selectedSources, source])
    }
  }

  // 过滤日志
  const filteredLogs = logs.filter((log) => {
    // 级别过滤
    if (!selectedLevels.includes(log.level)) {
      return false
    }

    // 源过滤
    if (selectedSources.length > 0 && !selectedSources.includes(log.source)) {
      return false
    }

    // 搜索过滤
    if (
      searchQuery &&
      !log.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.source.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // 日期范围过滤
    if (dateRange && dateRange.from && dateRange.to) {
      const logDate = new Date(log.timestamp)
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)
      to.setHours(23, 59, 59, 999) // 设置为当天结束

      if (logDate < from || logDate > to) {
        return false
      }
    }

    return true
  })

  // 获取所有可用的源
  const availableSources = Array.from(new Set(logs.map((log) => log.source)))

  // 日志统计
  const logStats = {
    total: filteredLogs.length,
    error: filteredLogs.filter((log) => log.level === "错误").length,
    warning: filteredLogs.filter((log) => log.level === "警告").length,
    info: filteredLogs.filter((log) => log.level === "信息").length,
    debug: filteredLogs.filter((log) => log.level === "调试").length,
  }

  // 导出日志
  const exportLogs = () => {
    // 实际应用中，这里会处理日志导出逻辑
    console.log(`导出日志，格式: ${exportFormat}，数量: ${filteredLogs.length}`)
    setIsExportDialogOpen(false)
    // 这里可以添加实际的导出逻辑，如创建文件并下载
  }

  // 保存设置
  const saveSettings = () => {
    console.log(`保存日志设置，保留天数: ${retentionDays}`)
    setIsSettingsOpen(false)
    // 这里可以添加实际的设置保存逻辑
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">日志管理</h1>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsRealtime(!isRealtime)}
                  className={isRealtime ? "bg-green-100" : ""}
                >
                  <RefreshCw className={`h-4 w-4 ${isRealtime ? "text-green-600 animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRealtime ? "停止实时更新" : "启用实时更新"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsExportDialogOpen(true)}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>导出日志</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>日志设置</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 日志统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">总日志数</p>
                <p className="text-2xl font-bold">{logStats.total}</p>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className={logStats.error > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">错误</p>
                <p className="text-2xl font-bold text-red-600">{logStats.error}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={logStats.warning > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">警告</p>
                <p className="text-2xl font-bold text-amber-600">{logStats.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">信息</p>
                <p className="text-2xl font-bold text-blue-600">{logStats.info}</p>
              </div>
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">调试</p>
                <p className="text-2xl font-bold text-green-600">{logStats.debug}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 日志过滤和搜索 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索日志消息或来源..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                筛选
                <Badge className="ml-1 bg-primary/20 text-primary hover:bg-primary/30">
                  {selectedLevels.length + (selectedSources.length > 0 ? 1 : 0) + (dateRange ? 1 : 0)}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">日志级别</h4>
                  <div className="flex flex-wrap gap-2">
                    <div
                      className={`cursor-pointer rounded-md px-2 py-1 text-sm flex items-center gap-1 ${selectedLevels.includes("错误") ? levelColors["错误"] : "bg-gray-100"}`}
                      onClick={() => toggleLevel("错误")}
                    >
                      {levelIcons["错误"]} 错误
                    </div>
                    <div
                      className={`cursor-pointer rounded-md px-2 py-1 text-sm flex items-center gap-1 ${selectedLevels.includes("警告") ? levelColors["警告"] : "bg-gray-100"}`}
                      onClick={() => toggleLevel("警告")}
                    >
                      {levelIcons["警告"]} 警告
                    </div>
                    <div
                      className={`cursor-pointer rounded-md px-2 py-1 text-sm flex items-center gap-1 ${selectedLevels.includes("信息") ? levelColors["信息"] : "bg-gray-100"}`}
                      onClick={() => toggleLevel("信息")}
                    >
                      {levelIcons["信息"]} 信息
                    </div>
                    <div
                      className={`cursor-pointer rounded-md px-2 py-1 text-sm flex items-center gap-1 ${selectedLevels.includes("调试") ? levelColors["调试"] : "bg-gray-100"}`}
                      onClick={() => toggleLevel("调试")}
                    >
                      {levelIcons["调试"]} 调试
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">日志来源</h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {availableSources.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={selectedSources.includes(source)}
                          onCheckedChange={() => toggleSource(source)}
                        />
                        <Label htmlFor={`source-${source}`}>{source}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">日期范围</h4>
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} locale={zhCN} />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLevels(["错误", "警告", "信息", "调试"])
                      setSelectedSources([])
                      setDateRange(undefined)
                    }}
                  >
                    重置
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    应用筛选
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择日志类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有日志</SelectItem>
              <SelectItem value="system">系统日志</SelectItem>
              <SelectItem value="database">数据库日志</SelectItem>
              <SelectItem value="application">应用日志</SelectItem>
              <SelectItem value="security">安全日志</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 日志表格 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>日志记录</CardTitle>
          <CardDescription>
            显示 {filteredLogs.length} 条日志记录
            {dateRange?.from && dateRange?.to && (
              <span>
                {" "}
                · {format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} 至{" "}
                {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">级别</TableHead>
                  <TableHead className="w-[180px]">时间</TableHead>
                  <TableHead className="w-[150px]">来源</TableHead>
                  <TableHead>消息</TableHead>
                  <TableHead className="w-[100px]">追踪 ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      没有找到匹配的日志记录
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell>
                        <Badge
                          className={
                            log.level === "错误"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : log.level === "警告"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                : log.level === "信息"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                          }
                        >
                          <span className="flex items-center gap-1">
                            {levelIcons[log.level as keyof typeof levelIcons]}
                            {log.level}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell className="font-mono text-xs">{log.traceId.split("-")[1]}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 日志详情对话框 */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && levelIcons[selectedLog.level as keyof typeof levelIcons]}
              {selectedLog?.message}
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">日志 ID</p>
                  <p className="font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">时间戳</p>
                  <p className="font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">级别</p>
                  <Badge className={levelColors[selectedLog.level as keyof typeof levelColors]}>
                    <span className="flex items-center gap-1">
                      {levelIcons[selectedLog.level as keyof typeof levelIcons]}
                      {selectedLog.level}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">来源</p>
                  <p>{selectedLog.source}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">追踪 ID</p>
                  <p className="font-mono">{selectedLog.traceId}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">消息</p>
                <div className="p-3 bg-muted rounded-md">{selectedLog.message}</div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">详细信息</p>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                  {selectedLog.details}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  关闭
                </Button>
                <div className="space-x-2">
                  {selectedLog.level === "错误" && (
                    <Button
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900"
                    >
                      创建告警
                    </Button>
                  )}
                  <Button>查看相关日志</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 导出对话框 */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出日志</DialogTitle>
            <DialogDescription>选择导出格式和选项</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">导出格式</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="选择格式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="txt">纯文本</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-details">包含详细信息</Label>
                <Switch id="include-details" defaultChecked />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">将导出 {filteredLogs.length} 条日志记录</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={exportLogs}>导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日志设置</DialogTitle>
            <DialogDescription>配置日志保留和显示选项</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="retention-days">日志保留天数</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="retention-days"
                  min={7}
                  max={90}
                  step={1}
                  value={[retentionDays]}
                  onValueChange={(value) => setRetentionDays(value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{retentionDays}天</span>
              </div>
              <p className="text-sm text-muted-foreground">日志将在 {retentionDays} 天后自动删除</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">自动刷新</Label>
                <Switch id="auto-refresh" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">每 30 秒自动刷新日志列表</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-alerts">严重错误邮件提醒</Label>
                <Switch id="email-alerts" defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">当出现严重错误时发送邮件通知</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              取消
            </Button>
            <Button onClick={saveSettings}>保存设置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}