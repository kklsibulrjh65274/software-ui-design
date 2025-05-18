// 系统相关的 mock 数据
export const systemAlerts = [
  {
    id: "alert-001",
    title: "高CPU使用率",
    message: "节点 db-node-3 CPU使用率超过90%已持续5分钟",
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    source: "系统监控",
    acknowledged: false,
  },
  {
    id: "alert-002",
    title: "磁盘空间不足",
    message: "存储节点 storage-2 可用空间低于10%",
    severity: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    source: "存储监控",
    acknowledged: true,
  },
  {
    id: "alert-003",
    title: "数据库连接数过高",
    message: "关系型数据库实例连接数接近配置上限",
    severity: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    source: "数据库监控",
    acknowledged: false,
  },
  {
    id: "alert-004",
    title: "备份任务失败",
    message: "数据库 postgres-main 的自动备份任务失败",
    severity: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    source: "备份系统",
    acknowledged: false,
  },
  {
    id: "alert-005",
    title: "节点离线",
    message: "节点 node-12 已离线超过10分钟",
    severity: "critical",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    source: "集群监控",
    acknowledged: false,
  }
]

export const systemLogs = [
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
  }
]

export const performanceData = {
  cpu: {
    current: 78,
    yesterday: 65,
    average: 72,
    peak: 92
  },
  memory: {
    current: 72,
    yesterday: 68,
    average: 70,
    peak: 85
  },
  disk: {
    current: 53,
    yesterday: 50,
    average: 55,
    peak: 60,
    iops: 1200,
    throughput: "120 MB/s",
    utilization: 65
  },
  network: {
    current: 55,
    yesterday: 48,
    average: 52,
    peak: 75,
    throughput: "850 Mbps",
    packets: "12K",
    utilization: 45
  },
  systemData: [
    { time: "00:00", cpu: 65, memory: 60, disk: 50, network: 45 },
    { time: "01:00", cpu: 60, memory: 58, disk: 50, network: 40 },
    { time: "02:00", cpu: 55, memory: 55, disk: 50, network: 35 },
    { time: "03:00", cpu: 50, memory: 52, disk: 50, network: 30 },
    { time: "04:00", cpu: 45, memory: 50, disk: 50, network: 25 },
    { time: "05:00", cpu: 50, memory: 53, disk: 50, network: 30 },
    { time: "06:00", cpu: 55, memory: 58, disk: 50, network: 35 },
    { time: "07:00", cpu: 65, memory: 65, disk: 50, network: 45 },
    { time: "08:00", cpu: 75, memory: 72, disk: 50, network: 60 },
    { time: "09:00", cpu: 85, memory: 80, disk: 50, network: 75 },
    { time: "10:00", cpu: 90, memory: 85, disk: 50, network: 80 },
    { time: "11:00", cpu: 85, memory: 82, disk: 50, network: 75 },
    { time: "12:00", cpu: 80, memory: 80, disk: 50, network: 70 }
  ],
  databasePerformance: [
    { name: "postgres-main", qps: 1200, latency: 15, connections: 85, load: 65, cacheHitRate: 92 },
    { name: "postgres-replica", qps: 800, latency: 8, connections: 45, load: 40, cacheHitRate: 95 },
    { name: "timeseries-01", qps: 3500, latency: 25, connections: 120, load: 75, cacheHitRate: 88 },
    { name: "vector-search", qps: 950, latency: 35, connections: 65, load: 55, cacheHitRate: 80 },
    { name: "geo-analytics", qps: 450, latency: 18, connections: 30, load: 35, cacheHitRate: 90 }
  ],
  queryPerformance: [
    { name: "SELECT", avg: 12, max: 85, count: 15000 },
    { name: "INSERT", avg: 8, max: 45, count: 8500 },
    { name: "UPDATE", avg: 15, max: 120, count: 3200 },
    { name: "DELETE", avg: 10, max: 65, count: 1500 },
    { name: "JOIN", avg: 45, max: 350, count: 2800 }
  ],
  slowQueries: [
    { type: "SELECT", executionTime: 1250, count: 12, database: "postgres-main", table: "orders" },
    { type: "JOIN", executionTime: 850, count: 45, database: "postgres-main", table: "users,orders" },
    { type: "SELECT", executionTime: 650, count: 78, database: "timeseries-01", table: "metrics" },
    { type: "UPDATE", executionTime: 450, count: 23, database: "postgres-main", table: "products" },
    { type: "SELECT", executionTime: 350, count: 156, database: "vector-search", table: "embeddings" }
  ]
}