"use client"

import { useState } from "react"
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

// 模拟日志数据
const systemLogs = [
  {
    id: "log-001",
    timestamp: "2023-05-10 08:45:12",
    level: "错误",
    source: "数据库服务",
    message: "无法连接到数据库节点 node-05",
    details: "连接超时，节点可能已下线或网络问题。已尝试重连3次。",
    traceId: "trace-db-45678",
  },
  {
    id: "log-002",
    timestamp: "2023-05-10 08:30:45",
    level: "警告",
    source: "存储服务",
    message: "存储节点 node-03 磁盘使用率超过 80%",
    details: "当前使用率82.5%，触发预警阈值。建议清理不必要数据或扩展存储容量。",
    traceId: "trace-storage-12345",
  },
  {
    id: "log-003",
    timestamp: "2023-05-10 08:15:30",
    level: "信息",
    source: "系统服务",
    message: "系统备份任务已完成",
    details: "备份大小: 2.3GB，耗时: 15分钟，备份位置: /backups/2023-05-10/",
    traceId: "trace-backup-78901",
  },
  {
    id: "log-004",
    timestamp: "2023-05-10 08:00:15",
    level: "信息",
    source: "用户服务",
    message: "用户 admin 登录系统",
    details: "IP地址: 192.168.1.100，浏览器: Chrome 112.0.5615.138，登录时间: 2023-05-10 08:00:15",
    traceId: "trace-user-23456",
  },
  {
    id: "log-005",
    timestamp: "2023-05-10 07:45:00",
    level: "警告",
    source: "网络服务",
    message: "检测到网络延迟增加",
    details: "平均延迟从 5ms 增加到 25ms，可能影响系统性能。建议检查网络设备和连接。",
    traceId: "trace-network-34567",
  },
  {
    id: "log-006",
    timestamp: "2023-05-10 07:30:22",
    level: "错误",
    source: "数据库服务",
    message: "查询执行超时: SELECT * FROM large_table WHERE complex_condition",
    details: "查询ID: query-789012，执行时间超过60秒，已自动终止。建议优化查询或增加索引。",
    traceId: "trace-db-56789",
  },
  {
    id: "log-007",
    timestamp: "2023-05-10 07:15:10",
    level: "信息",
    source: "系统服务",
    message: "系统自动更新已完成",
    details: "更新版本: v2.3.1，更新内容: 安全补丁和性能优化，重启服务: 否",
    traceId: "trace-system-67890",
  },
  {
    id: "log-008",
    timestamp: "2023-05-10 07:00:05",
    level: "调试",
    source: "API服务",
    message: "API请求处理时间: 230ms",
    details: "端点: /api/v1/data，方法: GET，参数: {limit: 100, offset: 0}，响应大小: 45KB",
    traceId: "trace-api-78901",
  },
  {
    id: "log-009",
    timestamp: "2023-05-10 06:45:30",
    level: "信息",
    source: "调度服务",
    message: "后台任务已启动: 数据同步",
    details: "任务ID: task-123456，预计完成时间: 2023-05-10 07:15:30，优先级: 中",
    traceId: "trace-scheduler-89012",
  },
  {
    id: "log-010",
    timestamp: "2023-05-10 06:30:15",
    level: "警告",
    source: "缓存服务",
    message: "缓存命中率下降到 65%",
    details: "正常范围: >85%，建议检查缓存策略或增加缓存容量。可能的原因: 工作负载变化或内存压力。",
    traceId: "trace-cache-90123",
  },
  {
    id: "log-011",
    timestamp: "2023-05-10 06:15:00",
    level: "错误",
    source: "认证服务",
    message: "多次失败的登录尝试: user123",
    details: "5次失败尝试，IP地址: 203.0.113.42，账户已临时锁定30分钟。可能的安全问题。",
    traceId: "trace-auth-01234",
  },
  {
    id: "log-012",
    timestamp: "2023-05-10 06:00:45",
    level: "信息",
    source: "配置服务",
    message: "配置更改: 最大连接数",
    details: "参数: max_connections，旧值: 1000，新值: 1500，生效时间: 立即，操作用户: admin",
    traceId: "trace-config-12345",
  },
  {
    id: "log-013",
    timestamp: "2023-05-10 05:45:30",
    level: "调试",
    source: "查询优化器",
    message: "查询计划生成: 复杂查询优化",
    details: "查询ID: query-345678，表数量: 5，条件数量: 8，选择的索引: idx_timestamp，估计行数: 10,000",
    traceId: "trace-optimizer-23456",
  },
  {
    id: "log-014",
    timestamp: "2023-05-10 05:30:15",
    level: "警告",
    source: "监控服务",
    message: "节点 node-07 CPU 使用率超过 90%",
    details: "当前使用率: 92.3%，持续时间: 5分钟，主要进程: database_server (PID: 1234, CPU: 75%)",
    traceId: "trace-monitor-34567",
  },
  {
    id: "log-015",
    timestamp: "2023-05-10 05:15:00",
    level: "信息",
    source: "集群服务",
    message: "新节点加入集群: node-12",
    details: "节点类型: 计算节点，IP: 10.0.0.12，资源: 16 CPU, 64GB RAM，状态: 初始化中",
    traceId: "trace-cluster-45678",
  },
]

// 模拟数据库日志
const databaseLogs = [
  {
    id: "db-log-001",
    timestamp: "2023-05-10 08:40:22",
    level: "错误",
    source: "PostgreSQL",
    message: "无法创建索引: 表 'users' 上的 'idx_email'",
    details: "错误代码: 23505，详情: 重复键违反唯一约束，已存在相同的索引名称。",
    traceId: "trace-db-12345",
  },
  {
    id: "db-log-002",
    timestamp: "2023-05-10 08:35:15",
    level: "警告",
    source: "MySQL",
    message: "慢查询检测: 查询执行时间 > 5秒",
    details: "查询: SELECT * FROM orders JOIN order_items WHERE date > '2023-01-01' AND ...",
    traceId: "trace-db-23456",
  },
  {
    id: "db-log-003",
    timestamp: "2023-05-10 08:25:30",
    level: "信息",
    source: "MongoDB",
    message: "集合分片完成: 'products'",
    details: "分片键: { category: 1, created_at: 1 }，块数量: 12，分布: 4个分片服务器",
    traceId: "trace-db-34567",
  },
  {
    id: "db-log-004",
    timestamp: "2023-05-10 08:20:10",
    level: "调试",
    source: "Redis",
    message: "键过期事件: 'session:user:12345'",
    details: "TTL: 3600秒，大小: 2KB，过期原因: 自然过期",
    traceId: "trace-db-45678",
  },
  {
    id: "db-log-005",
    timestamp: "2023-05-10 08:15:45",
    level: "错误",
    source: "Elasticsearch",
    message: "分片分配失败: 索引 'logs-2023-05'",
    details: "原因: 磁盘空间不足，节点: es-node-03，所需空间: 5GB，可用空间: 2GB",
    traceId: "trace-db-56789",
  },
  {
    id: "db-log-006",
    timestamp: "2023-05-10 08:10:30",
    level: "警告",
    source: "PostgreSQL",
    message: "自动清理进程负载过高",
    details: "表: 'events'，大小: 50GB，死元组: 15M，估计完成时间: 25分钟",
    traceId: "trace-db-67890",
  },
  {
    id: "db-log-007",
    timestamp: "2023-05-10 08:05:15",
    level: "信息",
    source: "MySQL",
    message: "InnoDB 缓冲池状态更新",
    details: "命中率: 98.5%，脏页: 2.3%，读取: 12,500/秒，写入: 3,200/秒",
    traceId: "trace-db-78901",
  },
  {
    id: "db-log-008",
    timestamp: "2023-05-10 08:00:00",
    level: "调试",
    source: "MongoDB",
    message: "索引构建进度: 'users.idx_last_login'",
    details: "进度: 75%，已处理文档: 3.75M，估计剩余时间: 2分钟",
    traceId: "trace-db-89012",
  },
  {
    id: "db-log-009",
    timestamp: "2023-05-10 07:55:45",
    level: "错误",
    source: "Cassandra",
    message: "节点通信失败: 'cass-node-05'",
    details: "超时: 30秒，尝试次数: 3，影响: 读写一致性可能受影响",
    traceId: "trace-db-90123",
  },
  {
    id: "db-log-010",
    timestamp: "2023-05-10 07:50:30",
    level: "警告",
    source: "Redis",
    message: "内存使用率接近最大值: 85%",
    details: "已用: 12.75GB，最大: 15GB，建议: 检查大键或增加内存配置",
    traceId: "trace-db-01234",
  },
]

// 模拟应用日志
const applicationLogs = [
  {
    id: "app-log-001",
    timestamp: "2023-05-10 08:42:15",
    level: "错误",
    source: "API网关",
    message: "路由解析失败: '/api/v2/analytics'",
    details: "错误: 找不到匹配的路由配置，请求方法: GET，客户端IP: 192.168.5.25",
    traceId: "trace-app-12345",
  },
  {
    id: "app-log-002",
    timestamp: "2023-05-10 08:38:30",
    level: "警告",
    source: "用户服务",
    message: "密码重置请求频率异常: user@example.com",
    details: "5分钟内3次请求，IP地址: 203.0.113.42，可能的安全问题",
    traceId: "trace-app-23456",
  },
  {
    id: "app-log-003",
    timestamp: "2023-05-10 08:33:45",
    level: "信息",
    source: "订单服务",
    message: "大订单处理完成: #ORD-78901",
    details: "订单金额: ¥25,000，商品数量: 12，处理时间: 2.3秒",
    traceId: "trace-app-34567",
  },
  {
    id: "app-log-004",
    timestamp: "2023-05-10 08:28:10",
    level: "调试",
    source: "支付服务",
    message: "支付处理流程追踪",
    details: "步骤: 验证 -> 授权 -> 捕获 -> 确认，总耗时: 1.2秒，支付提供商: AliPay",
    traceId: "trace-app-45678",
  },
  {
    id: "app-log-005",
    timestamp: "2023-05-10 08:23:55",
    level: "错误",
    source: "通知服务",
    message: "推送通知失败: 设备令牌无效",
    details: "用户ID: 12345，设备类型: iOS，应用版本: 2.3.0，错误代码: INVALID_TOKEN",
    traceId: "trace-app-56789",
  },
  {
    id: "app-log-006",
    timestamp: "2023-05-10 08:18:40",
    level: "警告",
    source: "库存服务",
    message: "产品库存不足警告: SKU-78901",
    details: "产品: 高端笔记本电脑，当前库存: 5，安全库存: 10，建议: 补充库存",
    traceId: "trace-app-67890",
  },
  {
    id: "app-log-007",
    timestamp: "2023-05-10 08:13:25",
    level: "信息",
    source: "搜索服务",
    message: "搜索索引重建完成",
    details: "索引: products_zh，文档数: 1.2M，耗时: 45秒，新增文档: 1,500",
    traceId: "trace-app-78901",
  },
  {
    id: "app-log-008",
    timestamp: "2023-05-10 08:08:10",
    level: "调试",
    source: "缓存服务",
    message: "缓存键驱逐事件",
    details: "键模式: user:profile:*，驱逐原因: LRU策略，驱逐数量: 500，内存释放: 15MB",
    traceId: "trace-app-89012",
  },
  {
    id: "app-log-009",
    timestamp: "2023-05-10 08:03:55",
    level: "错误",
    source: "文件服务",
    message: "文件上传失败: 大小超过限制",
    details: "文件名: large_dataset.csv，大小: 52MB，限制: 50MB，用户: admin@example.com",
    traceId: "trace-app-90123",
  },
  {
    id: "app-log-010",
    timestamp: "2023-05-10 07:58:40",
    level: "警告",
    source: "认证服务",
    message: "用户会话即将过期提醒失败",
    details: "用户ID: 34567，邮件发送失败，原因: 邮箱地址无效，会话将在30分钟后过期",
    traceId: "trace-app-01234",
  },
]

// 模拟安全日志
const securityLogs = [
  {
    id: "sec-log-001",
    timestamp: "2023-05-10 08:41:30",
    level: "错误",
    source: "防火墙",
    message: "检测到可能的DDoS攻击",
    details: "目标IP: 203.0.113.10，端口: 443，流量: 1.2Gbps，已激活自动缓解措施",
    traceId: "trace-sec-12345",
  },
  {
    id: "sec-log-002",
    timestamp: "2023-05-10 08:36:15",
    level: "警告",
    source: "入侵检测系统",
    message: "检测到可疑的SQL注入尝试",
    details: "源IP: 198.51.100.23，目标: /login，模式: ' OR 1=1 --，已阻止请求",
    traceId: "trace-sec-23456",
  },
  {
    id: "sec-log-003",
    timestamp: "2023-05-10 08:31:00",
    level: "信息",
    source: "访问控制",
    message: "管理员权限变更",
    details: "用户: admin，操作: 添加权限，权限: SYSTEM_CONFIG_WRITE，操作者: super_admin",
    traceId: "trace-sec-34567",
  },
  {
    id: "sec-log-004",
    timestamp: "2023-05-10 08:25:45",
    level: "调试",
    source: "证书管理",
    message: "SSL证书轮换计划",
    details: "域名: api.example.com，当前证书过期时间: 2023-06-10，计划轮换时间: 2023-06-01",
    traceId: "trace-sec-45678",
  },
  {
    id: "sec-log-005",
    timestamp: "2023-05-10 08:20:30",
    level: "错误",
    source: "身份提供商",
    message: "SAML断言验证失败",
    details: "IdP: corporate-sso，用户: jsmith@example.com，错误: 签名无效，可能的时钟偏差",
    traceId: "trace-sec-56789",
  },
  {
    id: "sec-log-006",
    timestamp: "2023-05-10 08:15:15",
    level: "警告",
    source: "防火墙",
    message: "检测到异常端口扫描活动",
    details: "源IP: 203.0.113.42，扫描端口范围: 1-1024，持续时间: 30秒，已添加到监视列表",
    traceId: "trace-sec-67890",
  },
  {
    id: "sec-log-007",
    timestamp: "2023-05-10 08:10:00",
    level: "信息",
    source: "安全策略",
    message: "密码策略更新",
    details: "变更: 最小长度从8增加到12，必须包含特殊字符，90天后过期，生效时间: 立即",
    traceId: "trace-sec-78901",
  },
  {
    id: "sec-log-008",
    timestamp: "2023-05-10 08:04:45",
    level: "调试",
    source: "会话管理",
    message: "会话令牌分析",
    details: "活动会话: 1,250，平均持续时间: 45分钟，并发用户峰值: 300 (08:00-09:00)",
    traceId: "trace-sec-89012",
  },
  {
    id: "sec-log-009",
    timestamp: "2023-05-10 07:59:30",
    level: "错误",
    source: "数据保护",
    message: "敏感数据暴露尝试",
    details: "用户ID: 45678，尝试访问: /api/admin/users，所需权限: ADMIN_READ，用户权限: USER_READ",
    traceId: "trace-sec-90123",
  },
  {
    id: "sec-log-010",
    timestamp: "2023-05-10 07:54:15",
    level: "警告",
    source: "地理位置异常",
    message: "检测到用户登录位置异常",
    details: "用户: zhang.wei@example.com，通常位置: 北京，当前位置: 悉尼，已要求二次验证",
    traceId: "trace-sec-01234",
  },
]

// 合并所有日志用于搜索
const allLogs = [...systemLogs, ...databaseLogs, ...applicationLogs, ...securityLogs]

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

  // 获取当前选项卡的日志
  const getLogsForTab = () => {
    switch (activeTab) {
      case "system":
        return systemLogs
      case "database":
        return databaseLogs
      case "application":
        return applicationLogs
      case "security":
        return securityLogs
      case "all":
        return allLogs
      default:
        return systemLogs
    }
  }

  // 过滤日志
  const filteredLogs = getLogsForTab().filter((log) => {
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
  const availableSources = Array.from(new Set(getLogsForTab().map((log) => log.source)))

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
                {filteredLogs.length === 0 ? (
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
