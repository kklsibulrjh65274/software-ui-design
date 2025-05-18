"use client"

import { useState, useEffect } from "react"
import { Activity, Database, HardDrive, AlertTriangle, Server, FileText } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

import { SystemHealthChart } from "@/components/dashboard/system-health-chart"
import { StatusCard } from "@/components/dashboard/status-card"
import { NavigationCard } from "@/components/dashboard/navigation-card"

// Import API
import { systemApi } from "@/api"

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState({
    health: { value: "良好", description: "所有系统正常运行", status: "success" },
    storage: { value: "42%", description: "已使用 4.2TB / 10TB", status: "warning" },
    nodes: { value: "18/20", description: "18 个节点在线", status: "success" },
    databases: { value: "12/15", description: "3 个实例需要注意", status: "warning" }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const response = await systemApi.getSystemAlerts()
        if (response.success) {
          setAlerts(response.data)
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

  // Get the 5 most recent alerts
  const recentAlerts = alerts.slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="系统健康状态" 
          value={systemStatus.health.value} 
          description={systemStatus.health.description} 
          icon={Activity} 
          status={systemStatus.health.status as "success" | "warning" | "error" | "default"} 
        />
        <StatusCard
          title="存储使用量"
          value={systemStatus.storage.value}
          description={systemStatus.storage.description}
          icon={HardDrive}
          status={systemStatus.storage.status as "success" | "warning" | "error" | "default"}
        />
        <StatusCard 
          title="节点状态" 
          value={systemStatus.nodes.value} 
          description={systemStatus.nodes.description} 
          icon={Server} 
          status={systemStatus.nodes.status as "success" | "warning" | "error" | "default"} 
        />
        <StatusCard 
          title="数据库实例" 
          value={systemStatus.databases.value} 
          description={systemStatus.databases.description} 
          icon={Database} 
          status={systemStatus.databases.status as "success" | "warning" | "error" | "default"} 
        />
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
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : recentAlerts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">暂无告警</p>
              </div>
            ) : (
              recentAlerts.map((alert) => {
                let IconComponent = FileText;
                let variant: "default" | "destructive" | undefined = "default";
                
                if (alert.severity === "critical") {
                  IconComponent = AlertTriangle;
                  variant = "destructive";
                } else if (alert.severity === "high") {
                  IconComponent = AlertTriangle;
                  variant = "destructive";
                } else if (alert.severity === "medium") {
                  IconComponent = Activity;
                }
                
                return (
                  <Alert key={alert.id} variant={variant}>
                    <IconComponent className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                );
              })
            )}
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