"use client"

import type React from "react"

import { useState } from "react"
import { Save, Lock, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SystemSettingsPage() {
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [systemSettingsSaved, setSystemSettingsSaved] = useState(false)
  const [backupSettingsSaved, setBackupSettingsSaved] = useState(false)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟密码修改
    setTimeout(() => {
      setPasswordChanged(true)
      setTimeout(() => setPasswordChanged(false), 3000)
    }, 500)
  }

  const handleSystemSettingsSave = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟系统设置保存
    setTimeout(() => {
      setSystemSettingsSaved(true)
      setTimeout(() => setSystemSettingsSaved(false), 3000)
    }, 500)
  }

  const handleBackupSettingsSave = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟备份设置保存
    setTimeout(() => {
      setBackupSettingsSaved(true)
      setTimeout(() => setBackupSettingsSaved(false), 3000)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">管理系统的基本设置和配置</p>
      </div>

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList>
          <TabsTrigger value="password">管理员密码</TabsTrigger>
          <TabsTrigger value="system">系统参数</TabsTrigger>
          <TabsTrigger value="backup">备份设置</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>修改管理员密码</CardTitle>
              <CardDescription>更新系统管理员账户的密码</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                {passwordChanged && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>密码已更新</AlertTitle>
                    <AlertDescription>管理员密码已成功修改</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <Input id="current-password" type="password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input id="new-password" type="password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input id="confirm-password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Lock className="mr-2 h-4 w-4" />
                  更新密码
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>系统参数配置</CardTitle>
              <CardDescription>配置系统的基本参数和行为</CardDescription>
            </CardHeader>
            <form onSubmit={handleSystemSettingsSave}>
              <CardContent className="space-y-4">
                {systemSettingsSaved && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Save className="h-4 w-4" />
                    <AlertTitle>设置已保存</AlertTitle>
                    <AlertDescription>系统参数配置已成功保存</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">性能设置</h3>
                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="max-connections">最大连接数</Label>
                      <Input id="max-connections" type="number" defaultValue="100" />
                      <p className="text-xs text-muted-foreground">系统允许的最大并发连接数</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="query-timeout">查询超时 (秒)</Label>
                      <Input id="query-timeout" type="number" defaultValue="30" />
                      <p className="text-xs text-muted-foreground">SQL 查询的最大执行时间</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buffer-size">缓冲区大小 (MB)</Label>
                      <Input id="buffer-size" type="number" defaultValue="1024" />
                      <p className="text-xs text-muted-foreground">系统缓冲区的大小</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="worker-threads">工作线程数</Label>
                      <Input id="worker-threads" type="number" defaultValue="8" />
                      <p className="text-xs text-muted-foreground">系统使用的工作线程数量</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">安全设置</h3>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ssl-enabled">启用 SSL</Label>
                      <p className="text-xs text-muted-foreground">为所有连接启用 SSL 加密</p>
                    </div>
                    <Switch id="ssl-enabled" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-logout">自动登出</Label>
                      <p className="text-xs text-muted-foreground">30 分钟不活动后自动登出</p>
                    </div>
                    <Switch id="auto-logout" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audit-logging">审计日志</Label>
                      <p className="text-xs text-muted-foreground">记录所有管理操作</p>
                    </div>
                    <Switch id="audit-logging" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  保存设置
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>备份路径设置</CardTitle>
              <CardDescription>配置系统备份的存储位置和策略</CardDescription>
            </CardHeader>
            <form onSubmit={handleBackupSettingsSave}>
              <CardContent className="space-y-4">
                {backupSettingsSaved && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Save className="h-4 w-4" />
                    <AlertTitle>设置已保存</AlertTitle>
                    <AlertDescription>备份设置已成功保存</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="backup-path">备份路径</Label>
                  <Input id="backup-path" defaultValue="/data/backups" />
                  <p className="text-xs text-muted-foreground">系统备份文件的存储路径</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-retention">备份保留策略</Label>
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compression-enabled">启用压缩</Label>
                    <p className="text-xs text-muted-foreground">压缩备份文件以节省空间</p>
                  </div>
                  <Switch id="compression-enabled" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="encryption-enabled">启用加密</Label>
                    <p className="text-xs text-muted-foreground">加密备份文件以提高安全性</p>
                  </div>
                  <Switch id="encryption-enabled" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  立即备份
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  保存设置
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
