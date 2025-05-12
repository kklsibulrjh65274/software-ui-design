"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, MoreHorizontal, Plus, UserPlus, Key, Shield, AlertTriangle } from "lucide-react"

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
import { User, Role } from "@/mock/dashboard/types"

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState({
    users: true,
    roles: true
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取用户数据
        setLoading(prev => ({ ...prev, users: true }))
        const usersResponse = await securityApi.getUsers()
        if (usersResponse.success) {
          setUsers(usersResponse.data)
        } else {
          setError(usersResponse.message)
        }
        
        // 获取角色数据
        setLoading(prev => ({ ...prev, roles: true }))
        const rolesResponse = await securityApi.getRoles()
        if (rolesResponse.success) {
          setRoles(rolesResponse.data)
        } else {
          setError(rolesResponse.message)
        }
      } catch (err) {
        setError('获取用户和角色数据失败')
        console.error(err)
      } finally {
        setLoading({
          users: false,
          roles: false
        })
      }
    }

    fetchData()
  }, [])

  const handleAddUser = async (formData: FormData) => {
    try {
      const username = formData.get('username') as string
      const email = formData.get('email') as string
      const role = formData.get('role') as string
      
      if (!username || !email || !role) {
        setError('请填写所有必填字段')
        return
      }
      
      const newUser: Omit<User, 'id'> = {
        username,
        email,
        role,
        status: '活跃',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
      
      const response = await securityApi.createUser(newUser)
      if (response.success) {
        setUsers(prev => [...prev, response.data])
        setIsAddUserOpen(false)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建用户失败')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户权限管理</h1>
          <p className="text-muted-foreground">管理系统用户和角色</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新用户</DialogTitle>
                <DialogDescription>创建新用户并分配角色和权限</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleAddUser(new FormData(e.currentTarget))
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
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" name="username" placeholder="输入用户名" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">电子邮箱</Label>
                    <Input id="email" name="email" type="email" placeholder="输入电子邮箱" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input id="password" name="password" type="password" placeholder="输入密码" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <Input id="confirm-password" name="confirmPassword" type="password" placeholder="再次输入密码" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">角色</Label>
                    <Select name="role" defaultValue="guest">
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
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddUserOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">创建用户</Button>
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
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="permissions">权限设置</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索用户..." className="pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="operator">操作员</SelectItem>
                <SelectItem value="analyst">分析师</SelectItem>
                <SelectItem value="guest">访客</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>用户名</div>
              <div>电子邮箱</div>
              <div>角色</div>
              <div>状态</div>
              <div>最后登录</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading.users ? (
                <div className="py-8 text-center">加载中...</div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center">暂无用户数据</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{user.username}</div>
                    <div>{user.email}</div>
                    <div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <div>
                      <Badge variant={user.status === "活跃" ? "success" : "secondary"}>{user.status}</Badge>
                    </div>
                    <div>{user.lastLogin}</div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>用户操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            编辑权限
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="mr-2 h-4 w-4" />
                            重置密码
                          </DropdownMenuItem>
                          {user.status === "活跃" ? (
                            <DropdownMenuItem>锁定用户</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>解锁用户</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除用户</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="搜索角色..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建角色
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>角色名称</div>
              <div>描述</div>
              <div>用户数</div>
              <div>权限</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading.roles ? (
                <div className="py-8 text-center">加载中...</div>
              ) : roles.length === 0 ? (
                <div className="py-8 text-center">暂无角色数据</div>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{role.name}</div>
                    <div>{role.description}</div>
                    <div>{role.users}</div>
                    <div>{role.permissions}</div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>角色操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>编辑角色</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            管理权限
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            查看用户
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除角色</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>权限设置</CardTitle>
              <CardDescription>配置角色的权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="role-001">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role-001">管理员</SelectItem>
                    <SelectItem value="role-002">操作员</SelectItem>
                    <SelectItem value="role-003">分析师</SelectItem>
                    <SelectItem value="role-004">访客</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">数据库管理权限</h3>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-view" defaultChecked />
                      <label
                        htmlFor="perm-db-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-create" defaultChecked />
                      <label
                        htmlFor="perm-db-create"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        创建数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-modify" defaultChecked />
                      <label
                        htmlFor="perm-db-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-delete" defaultChecked />
                      <label
                        htmlFor="perm-db-delete"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        删除数据库
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">存储管理权限</h3>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-view" defaultChecked />
                      <label
                        htmlFor="perm-storage-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-create" defaultChecked />
                      <label
                        htmlFor="perm-storage-create"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        创建存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-modify" defaultChecked />
                      <label
                        htmlFor="perm-storage-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-delete" defaultChecked />
                      <label
                        htmlFor="perm-storage-delete"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        删除存储
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">系统管理权限</h3>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-system-view" defaultChecked />
                      <label
                        htmlFor="perm-system-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看系统设置
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-system-modify" defaultChecked />
                      <label
                        htmlFor="perm-system-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改系统设置
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-user-manage" defaultChecked />
                      <label
                        htmlFor="perm-user-manage"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        用户管理
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-role-manage" defaultChecked />
                      <label
                        htmlFor="perm-role-manage"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        角色管理
                      </label>
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