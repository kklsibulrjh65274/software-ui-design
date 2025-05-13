// 数据库相关的 mock 数据
export const databases = [
  { id: "postgres-main", name: "主数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "1.2 TB", tables: 42 },
  {
    id: "postgres-replica",
    name: "副本数据库",
    charset: "UTF-8",
    collation: "en_US.UTF-8",
    size: "1.1 TB",
    tables: 42,
  },
  { id: "postgres-dev", name: "开发数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "800 GB", tables: 38 },
  { id: "postgres-test", name: "测试数据库", charset: "UTF-8", collation: "en_US.UTF-8", size: "750 GB", tables: 35 },
  {
    id: "postgres-analytics",
    name: "分析数据库",
    charset: "UTF-8",
    collation: "en_US.UTF-8",
    size: "2.1 TB",
    tables: 28,
  },
  { id: "timeseries-01", name: "监控数据库", retention: "30天", series: 156, points: "1.2B", status: "正常" },
  { id: "timeseries-02", name: "日志数据库", retention: "90天", series: 78, points: "3.5B", status: "警告" },
  { id: "timeseries-03", name: "传感器数据库", retention: "365天", series: 245, points: "5.7B", status: "正常" },
  { id: "timeseries-04", name: "指标数据库", retention: "180天", series: 124, points: "2.3B", status: "正常" },
]

export const tables = [
  {
    name: "users",
    database: "postgres-main",
    type: "关系型",
    fields: 12,
    rows: "1.2M",
    size: "245 MB",
    indexes: 3,
  },
  {
    name: "orders",
    database: "postgres-main",
    type: "关系型",
    fields: 15,
    rows: "5.8M",
    size: "1.2 GB",
    indexes: 4,
  },
  {
    name: "products",
    database: "postgres-main",
    type: "关系型",
    fields: 18,
    rows: "250K",
    size: "180 MB",
    indexes: 2,
  },
  {
    name: "metrics",
    database: "timeseries-01",
    type: "时序型",
    fields: 8,
    rows: "45M",
    size: "3.5 GB",
    indexes: 2,
  },
  {
    name: "embeddings",
    database: "vector-search",
    type: "向量型",
    fields: 5,
    rows: "1.5M",
    size: "2.8 GB",
    indexes: 1,
  },
]

export const timeseriesData = {
  series: [
    { name: "cpu_usage", tags: [{ key: "host", value: "server01" }, { key: "region", value: "cn-east" }], type: "float", points: "2.5M" },
    { name: "memory_usage", tags: [{ key: "host", value: "server01" }, { key: "region", value: "cn-east" }], type: "float", points: "2.5M" },
    { name: "disk_usage", tags: [{ key: "host", value: "server01" }, { key: "region", value: "cn-east" }], type: "float", points: "2.5M" },
    { name: "network_in", tags: [{ key: "host", value: "server01" }, { key: "region", value: "cn-east" }], type: "float", points: "2.5M" },
    { name: "network_out", tags: [{ key: "host", value: "server01" }, { key: "region", value: "cn-east" }], type: "float", points: "2.5M" },
  ],
  retentionPolicies: [
    { name: "autogen", duration: "30d", replication: 1, default: true },
    { name: "monthly", duration: "90d", replication: 1, default: false },
    { name: "yearly", duration: "365d", replication: 1, default: false },
  ],
  stats: {
    seriesCount: 156,
    totalPoints: "1.2B",
    diskSize: "45.8 GB",
    writeRate: "10K points/s",
    readRate: "25K points/s",
    uptime: "45d 12h 30m",
    lastBackup: "2023-05-09 01:00:00"
  },
  metrics: {
    writePerformance: [
      { time: "00:00", value: 8500 },
      { time: "04:00", value: 5200 },
      { time: "08:00", value: 12500 },
      { time: "12:00", value: 15800 },
      { time: "16:00", value: 14200 },
      { time: "20:00", value: 9800 },
    ],
    readPerformance: [
      { time: "00:00", value: 12000 },
      { time: "04:00", value: 8000 },
      { time: "08:00", value: 25000 },
      { time: "12:00", value: 32000 },
      { time: "16:00", value: 28000 },
      { time: "20:00", value: 18000 },
    ],
    queryLatency: [
      { time: "00:00", value: 15 },
      { time: "04:00", value: 12 },
      { time: "08:00", value: 25 },
      { time: "12:00", value: 35 },
      { time: "16:00", value: 30 },
      { time: "20:00", value: 20 },
    ],
    memoryUsage: [
      { time: "00:00", value: 45 },
      { time: "04:00", value: 42 },
      { time: "08:00", value: 65 },
      { time: "12:00", value: 78 },
      { time: "16:00", value: 72 },
      { time: "20:00", value: 55 },
    ],
  }
}

export const performanceData = [
  { name: "00:00", cpu: 65, memory: 55, disk: 40, network: 70 },
  { name: "01:00", cpu: 70, memory: 60, disk: 45, network: 65 },
  { name: "02:00", cpu: 60, memory: 65, disk: 50, network: 60 },
  { name: "03:00", cpu: 80, memory: 70, disk: 55, network: 75 },
  { name: "04:00", cpu: 75, memory: 75, disk: 60, network: 80 },
  { name: "05:00", cpu: 70, memory: 80, disk: 65, network: 85 },
  { name: "06:00", cpu: 65, memory: 75, disk: 70, network: 80 },
  { name: "07:00", cpu: 60, memory: 70, disk: 75, network: 75 },
  { name: "08:00", cpu: 55, memory: 65, disk: 70, network: 70 },
  { name: "09:00", cpu: 50, memory: 60, disk: 65, network: 65 },
  { name: "10:00", cpu: 55, memory: 55, disk: 60, network: 60 },
  { name: "11:00", cpu: 60, memory: 50, disk: 55, network: 55 },
  { name: "12:00", cpu: 65, memory: 55, disk: 50, network: 60 },
]