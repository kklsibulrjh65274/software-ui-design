"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Shield, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 导入 API
import { securityApi } from "@/api"
import { AccessPolicy } from "@/mock/dashboard/types"

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false)
  const [accessPolicies, setAccessPolicies] = useState<AccessPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true)
        const response = await securityApi.getAccessPolicies()
        if (response.success) {
          setAccessPolicies(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取访问策略数据失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  const handleAddPolicy = async (formData: FormData) => {
    try {
      const name = formData.get('policy-name') as string
      const type = formData.get('resource-type') as string
      const target = formData.get('resource-target') as string
      const role = formData.get('role') as string
      const access = formData.get('access-level') as string
      
      if (!name || !type || !target || !role || !access) {
        setError('请填写所有必填字段')
        return
      }
      
      const newPolicy: Omit<AccessPolicy, 'id'> = {
        name,
        type,
        target,
        role,
        access
      }
      
      const response = await securityApi.createAccessPolicy(newPolicy)
      if (response.success) {
        setAccessPolicies(prev => [...prev, response.data])
        setIsAddPolicyOpen(false)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建访问策略失败')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">访问控制</h1>
          <p className="text-muted-foreground">管理系统资源的访问策略</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddPolicyOpen} onOpenChange={setIsAddPolicyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                添加访问策略
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加访问策略</DialogTitle>
                <DialogDescription>创建新的资源访问策略</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleAddPolicy(new FormData(e.currentTarget))
              }}>
                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>错误</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="policy-name">策略名称</Label>
                    <Input id="policy-name" name="policy-name" placeholder="输入策略名称" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-type">资源类型</Label>
                    <Select name="resource-type" defaultValue="database">
                      <SelectTrigger id="resource-type">
                        <SelectValue placeholder="选择资源类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="数据库">数据库</SelectItem>
                        <SelectItem value="存储">存储</SelectItem>
                        <SelectItem value="系统">系统</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-target">资源目标</Label>
                    <Select name="resource-target" defaultValue="postgres-main">
                      <SelectTrigger id="resource-target">
                        <SelectValue placeholder="选择资源目标" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="postgres-main">主数据库 (postgres-main)</SelectItem>
                        <SelectItem value="文件存储">文件存储</SelectItem>
                        <SelectItem value="监控面板">监控面板</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select name="role" defaultValue="管理员">
                      <SelectTrigger id="role">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="管理员">管理员</SelectItem>
                        <SelectItem value="操作员">操作员</SelectItem>
                        <SelectItem value="分析师">分析师</SelectItem>
                        <SelectItem value="访客">访客</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="access-level">访问级别</Label>
                    <Select name="access-level" defaultValue="只读">
                      <SelectTrigger id="access-level">
                        <SelectValue placeholder="选择访问级别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="完全访问">完全访问</SelectItem>
                        <SelectItem value="读写">读写</SelectItem>
                        <SelectItem value="只读">只读</SelectItem>
                        <SelectItem value="无访问">无访问</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddPolicyOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">创建策略</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">访问策略</TabsTrigger>
          <TabsTrigger value="database">数据库权限</TabsTrigger>
          <TabsTrigger value="storage">存储权限</TabsTrigger>
          <TabsTrigger value="system">系统权限</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索策略..." className="pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="database">数据库</SelectItem>
                <SelectItem value="storage">存储</SelectItem>
                <SelectItem value="system">系统</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>策略名称</div>
              <div>资源类型</div>
              <div>资源目标</div>
              <div>角色</div>
              <div>访问级别</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-8 text-center">加载中...</div>
              ) : accessPolicies.length === 0 ? (
                <div className="py-8 text-center">暂无访问策略数据</div>
              ) : (
                accessPolicies.map((policy) => (
                  <div key={policy.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{policy.name}</div>
                    <div>
                      <Badge variant="outline">{policy.type}</Badge>
                    </div>
                    <div>{policy.target}</div>
                    <div>{policy.role}</div>
                    <div>
                      <Badge
                        variant={
                          policy.access === "完全访问"
                            ? "destructive"
                            : policy.access === "读写"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {policy.access}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>策略操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>编辑策略</DropdownMenuItem>
                          <DropdownMenuItem>复制策略</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除策略</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据库访问权限</CardTitle>
              <CardDescription>配置数据库资源的访问权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="postgres-main">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择数据库" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgres-main">主数据库 (postgres-main)</SelectItem>
                    <SelectItem value="postgres-replica">副本数据库 (postgres-replica)</SelectItem>
                    <SelectItem value="timeseries-01">监控数据库 (timeseries-01)</SelectItem>
                    <SelectItem value="vector-search">搜索引擎 (vector-search)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>角色</div>
                  <div>连接</div>
                  <div>读取</div>
                  <div>写入</div>
                  <div>管理</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">管理员</div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">操作员</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">分析师</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">访客</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">重置</Button>
              <Button>保存权限</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>存储访问权限</CardTitle>
              <CardDescription>配置存储资源的访问权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="file-storage">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择存储" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file-storage">文件存储</SelectItem>
                    <SelectItem value="object-storage">对象存储</SelectItem>
                    <SelectItem value="block-storage">块存储</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>角色</div>
                  <div>列出</div>
                  <div>读取</div>
                  <div>写入</div>
                  <div>删除</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">管理员</div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">操作员</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">分析师</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">访客</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">重置</Button>
              <Button>保存权限</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统访问权限</CardTitle>
              <CardDescription>配置系统资源的访问权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="monitoring">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择系统资源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitoring">监控面板</SelectItem>
                    <SelectItem value="logs">日志系统</SelectItem>
                    <SelectItem value="settings">系统设置</SelectItem>
                    <SelectItem value="backup">备份系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>角色</div>
                  <div>查看</div>
                  <div>使用</div>
                  <div>配置</div>
                  <div>管理</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">管理员</div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                    <div>
                      <Checkbox defaultChecked disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">操作员</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">分析师</div>
                    <div>
                      <Checkbox defaultChecked />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">访客</div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                    <div>
                      <Checkbox />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">重置</Button>
              <Button>保存权限</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}