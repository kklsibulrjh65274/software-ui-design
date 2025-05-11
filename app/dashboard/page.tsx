"use client"

import { Activity, Database, HardDrive, AlertTriangle, Server, FileText } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

import { SystemHealthChart } from "@/components/dashboard/system-health-chart"
import { StatusCard } from "@/components/dashboard/status-card"
import { NavigationCard } from "@/components/dashboard/navigation-card"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard title="系统健康状态" value="良好" description="所有系统正常运行" icon={Activity} status="success" />
        <StatusCard
          title="存储使用量"
          value="42%"
          description="已使用 4.2TB / 10TB"
          icon={HardDrive}
          status="warning"
        />
        <StatusCard title="节点状态" value="18/20" description="18 个节点在线" icon={Server} status="success" />
        <StatusCard title="数据库实例" value="12/15" description="3 个实例需要注意" icon={Database} status="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>系统健康状态</CardTitle>
            <CardDescription>过去 30 天的系统健康状态趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>系统告警摘要</CardTitle>
            <CardDescription>最近 5 条重要告警</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>存储节点离线</AlertTitle>
              <AlertDescription>节点 ID: node-12 已离线超过 10 分钟</AlertDescription>
            </Alert>
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>存储空间不足</AlertTitle>
              <AlertDescription>数据库集群 DB-03 存储空间使用率超过 85%</AlertDescription>
            </Alert>
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>备份任务完成</AlertTitle>
              <AlertDescription>数据库 postgres-main 备份任务已完成</AlertDescription>
            </Alert>
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>性能异常</AlertTitle>
              <AlertDescription>数据库 timeseries-01 查询延迟增加</AlertDescription>
            </Alert>
            <Alert>
              <Server className="h-4 w-4" />
              <AlertTitle>节点已恢复</AlertTitle>
              <AlertDescription>节点 ID: node-08 已恢复在线状态</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NavigationCard
          title="数据库管理"
          description="管理关系型、时序、向量和地理空间数据库"
          icon={Database}
          href="/dashboard/database"
        />
        <NavigationCard
          title="存储管理"
          description="管理文件、对象和块存储"
          icon={HardDrive}
          href="/dashboard/storage"
        />
        <NavigationCard
          title="系统管理"
          description="系统设置、日志管理和扩容管理"
          icon={Server}
          href="/dashboard/system"
        />
      </div>
    </div>
  )
}
