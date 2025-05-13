// 类型定义
export interface Volume {
  id: string
  name: string
  size: number
  type: string
  status: string
  attachedTo: string | null
  createdAt: Date
  iops: number
  throughput: string
  usedSpace: number
}

export interface Snapshot {
  id: string
  volumeId: string
  volumeName: string
  description: string
  size: number
  status: string
  createdAt: Date
}

export interface Node {
  id: string
  name: string
  ip: string
  role: string
  status: string
  cpu: number
  memory: number
  disk: number
}

export interface Shard {
  id: string
  range: string
  nodeId: string
  status: string
  size: string
  usage: number
  replicas: number
}

export interface Database {
  id: string
  name: string
  charset?: string
  collation?: string
  size: string
  tables?: number
  retention?: string
  series?: number
  points?: string
  status?: string
}

export interface Table {
  name: string
  database: string
  type: string
  fields: number
  rows: string
  size: string
  indexes: number
}

export interface TimeSeries {
  name: string
  tags: Array<{key: string, value: string}>
  type: string
  points: string
}

export interface RetentionPolicy {
  name: string
  duration: string
  replication: number
  default: boolean
}

export interface BackupHistory {
  id: string
  name: string
  type: string
  status: string
  size: string
  startTime: string
  endTime: string
  duration: string
}

export interface BackupSchedule {
  id: string
  name: string
  type: string
  schedule: string
  target: string
  retention: string
  status: string
  lastRun: string
  nextRun: string
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  status: string
  lastLogin: string
}

export interface Role {
  id: string
  name: string
  description: string
  users: number
  permissions: string
}

export interface AccessPolicy {
  id: string
  name: string
  type: string
  target: string
  role: string
  access: string
}