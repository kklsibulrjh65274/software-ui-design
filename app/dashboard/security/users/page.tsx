"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, MoreHorizontal, Plus, UserPlus, Key, Shield, AlertTriangle, Trash2, RefreshCw, Edit, Save, Lock, Unlock } from "lucide-react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 导入 API
import { securityApi } from "@/api"
import { User, Role } from "@/mock/dashboard/types"

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isConfirmDeleteUserOpen, setIsConfirmDeleteUserOpen] = useState(false)
  const [isConfirmDeleteRoleOpen, setIsConfirmDeleteRoleOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState({
    users: true,
    roles: true
  })
  const [error, setError] = useState<string | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [roleSearchQuery, setRoleSearchQuery] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)
  const [isEditingPermissions, setIsEditingPermissions] = useState(false)
  const [permissionsChanged, setPermissionsChanged] = useState(false)
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "访客"
  })
  const [newRoleData, setNewRoleData] = useState({
    name: "",
    description: "",
    permissions: "有限的只读权限"
  })
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: ""
  })

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

  const handleAddUser = async () => {
    try {
      if (!newUserData.username || !newUserData.email || !newUserData.password) {
        setError('请填写所有必填字段')
        return
      }
      
      if (newUserData.password !== newUserData.confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
      
      setLoading(prev => ({ ...prev, users: true }))
      setError(null)
      
      const response = await securityApi.createUser({
        username: newUserData.username,
        email: newUserData.email,
        role: newUserData.role,
        status: '活跃',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
      
      if (response.success) {
        setUsers(prev => [...prev, response.data])
        setIsAddUserOpen(false)
        setNewUserData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "访客"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建用户失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const handleAddRole = async () => {
    try {
      if (!newRoleData.name || !newRoleData.description) {
        setError('请填写所有必填字段')
        return
      }
      
      setLoading(prev => ({ ...prev, roles: true }))
      setError(null)
      
      const response = await securityApi.createRole({
        name: newRoleData.name,
        description: newRoleData.description,
        permissions: newRoleData.permissions,
        users: 0
      })
      
      if (response.success) {
        setRoles(prev => [...prev, response.data])
        setIsAddRoleOpen(false)
        setNewRoleData({
          name: "",
          description: "",
          permissions: "有限的只读权限"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建角色失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, roles: false }))
    }
  }

  const handleEditUser = async () => {
    if (!userToEdit) return
    
    try {
      setLoading(prev => ({ ...prev, users: true }))
      setError(null)
      
      const response = await securityApi.updateUser(userToEdit.id, userToEdit)
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userToEdit.id ? response.data : user
        ))
        setIsEditUserOpen(false)
        setUserToEdit(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('更新用户失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const handleEditRole = async () => {
    if (!roleToEdit) return
    
    try {
      setLoading(prev => ({ ...prev, roles: true }))
      setError(null)
      
      const response = await securityApi.updateRole(roleToEdit.id, roleToEdit)
      if (response.success) {
        setRoles(prev => prev.map(role => 
          role.id === roleToEdit.id ? response.data : role
        ))
        setIsEditRoleOpen(false)
        setRoleToEdit(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('更新角色失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, roles: false }))
    }
  }

  const handleResetPassword = async () => {
    if (!userToResetPassword) return
    
    try {
      if (!newPassword.password) {
        setError('请输入新密码')
        return
      }
      
      if (newPassword.password !== newPassword.confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
      
      setLoading(prev => ({ ...prev, users: true }))
      setError(null)
      
      // 模拟重置密码
      setTimeout(() => {
        setIsResetPasswordOpen(false)
        setUserToResetPassword(null)
        setNewPassword({
          password: "",
          confirmPassword: ""
        })
        setLoading(prev => ({ ...prev, users: false }))
        alert(`已成功重置用户 ${userToResetPassword.username} 的密码`)
      }, 1000)
    } catch (err) {
      setError('重置密码失败')
      console.error(err)
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, users: true }))
      setError(null)
      
      const response = await securityApi.deleteUser(userToDelete)
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userToDelete))
        setIsConfirmDeleteUserOpen(false)
        setUserToDelete(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除用户失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, roles: true }))
      setError(null)
      
      const response = await securityApi.deleteRole(roleToDelete)
      if (response.success) {
        setRoles(prev => prev.filter(role => role.id !== roleToDelete))
        setIsConfirmDeleteRoleOpen(false)
        setRoleToDelete(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除角色失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, roles: false }))
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      setError(null)
      
      const newStatus = currentStatus === "活跃" ? "锁定" : "活跃"
      
      const response = await securityApi.updateUser(userId, { status: newStatus })
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? response.data : user
        ))
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(`${currentStatus === "活跃" ? "锁定" : "解锁"}用户失败`)
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(userSearchQuery.toLowerCase())
    
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter
    const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // 过滤角色
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.id.toLowerCase().includes(roleSearchQuery.toLowerCase())
  )

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
                  <Input 
                    id="username" 
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                    placeholder="输入用户名" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    placeholder="输入电子邮箱" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    placeholder="输入密码" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={newUserData.confirmPassword}
                    onChange={(e) => setNewUserData({...newUserData, confirmPassword: e.target.value})}
                    placeholder="再次输入密码" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <Select 
                    value={newUserData.role}
                    onValueChange={(value) => setNewUserData({...newUserData, role: value})}
                  >
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
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddUser}>创建用户</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={async () => {
            try {
              setLoading({
                users: true,
                roles: true
              })
              setError(null)
              
              // 获取用户数据
              const usersResponse = await securityApi.getUsers()
              if (usersResponse.success) {
                setUsers(usersResponse.data)
              } else {
                setError(usersResponse.message)
              }
              
              // 获取角色数据
              const rolesResponse = await securityApi.getRoles()
              if (rolesResponse.success) {
                setRoles(rolesResponse.data)
              } else {
                setError(rolesResponse.message)
              }
            } catch (err) {
              setError('刷新数据失败')
              console.error(err)
            } finally {
              setLoading({
                users: false,
                roles: false
              })
            }
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
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
              <Input 
                type="search" 
                placeholder="搜索用户..." 
                className="pl-8" 
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="管理员">管理员</SelectItem>
                <SelectItem value="操作员">操作员</SelectItem>
                <SelectItem value="分析师">分析师</SelectItem>
                <SelectItem value="访客">访客</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="活跃">活跃</SelectItem>
                <SelectItem value="锁定">锁定</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              setUserSearchQuery("")
              setUserRoleFilter("all")
              setUserStatusFilter("all")
            }}>
              <Filter className="h-4 w-4" />
              <span className="sr-only">重置筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>电子邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.users ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-muted-foreground">加载中...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {users.length === 0 
                            ? "暂无用户数据" 
                            : "没有符合筛选条件的用户"}
                        </p>
                        {users.length === 0 && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setIsAddUserOpen(true)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            创建第一个用户
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "活跃" ? "success" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
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
                            <DropdownMenuItem onClick={() => {
                              setUserToEdit({...user})
                              setIsEditUserOpen(true)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑用户
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setUserToResetPassword(user)
                              setIsResetPasswordOpen(true)
                            }}>
                              <Key className="mr-2 h-4 w-4" />
                              重置密码
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.status)}>
                              {user.status === "活跃" ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  锁定用户
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  解锁用户
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setUserToDelete(user.id)
                                setIsConfirmDeleteUserOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除用户
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="搜索角色..." 
                  className="pl-8" 
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setRoleSearchQuery("")}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    创建角色
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新角色</DialogTitle>
                    <DialogDescription>创建新角色并定义其权限</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>错误</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="role-name">角色名称</Label>
                      <Input 
                        id="role-name" 
                        value={newRoleData.name}
                        onChange={(e) => setNewRoleData({...newRoleData, name: e.target.value})}
                        placeholder="输入角色名称" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-description">角色描述</Label>
                      <Input 
                        id="role-description" 
                        value={newRoleData.description}
                        onChange={(e) => setNewRoleData({...newRoleData, description: e.target.value})}
                        placeholder="输入角色描述" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-permissions">权限级别</Label>
                      <Select 
                        value={newRoleData.permissions}
                        onValueChange={(value) => setNewRoleData({...newRoleData, permissions: value})}
                      >
                        <SelectTrigger id="role-permissions">
                          <SelectValue placeholder="选择权限级别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="所有权限">所有权限</SelectItem>
                          <SelectItem value="读写权限，无管理权限">读写权限，无管理权限</SelectItem>
                          <SelectItem value="只读权限，可执行查询">只读权限，可执行查询</SelectItem>
                          <SelectItem value="有限的只读权限">有限的只读权限</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddRole}>创建角色</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>用户数</TableHead>
                  <TableHead>权限</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.roles ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-muted-foreground">加载中...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {roles.length === 0 
                            ? "暂无角色数据" 
                            : "没有符合筛选条件的角色"}
                        </p>
                        {roles.length === 0 && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setIsAddRoleOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            创建第一个角色
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.users}</TableCell>
                      <TableCell>{role.permissions}</TableCell>
                      <TableCell className="text-right">
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
                            <DropdownMenuItem onClick={() => {
                              setRoleToEdit({...role})
                              setIsEditRoleOpen(true)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑角色
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setActiveTab("permissions")
                              setIsEditingPermissions(true)
                            }}>
                              <Shield className="mr-2 h-4 w-4" />
                              管理权限
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              查看用户
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setRoleToDelete(role.id)
                                setIsConfirmDeleteRoleOpen(true)
                              }}
                              disabled={role.users > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除角色
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>权限设置</CardTitle>
                  <CardDescription>配置角色的权限</CardDescription>
                </div>
                {isEditingPermissions ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditingPermissions(false)}>
                      取消
                    </Button>
                    <Button onClick={() => {
                      setPermissionsChanged(true)
                      setTimeout(() => setPermissionsChanged(false), 2000)
                      setIsEditingPermissions(false)
                    }}>
                      <Save className="mr-2 h-4 w-4" />
                      保存权限
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditingPermissions(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑权限
                  </Button>
                )}
              </div>
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

              {permissionsChanged && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>权限已更新</AlertTitle>
                  <AlertDescription>角色权限已成功保存</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">数据库管理权限</h3>
                  <div className="space-y-2 border rounded-md p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-view" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-db-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-create" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-db-create"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        创建数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-modify" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-db-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改数据库
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-db-delete" defaultChecked disabled={!isEditingPermissions} />
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
                      <Checkbox id="perm-storage-view" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-storage-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-create" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-storage-create"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        创建存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-modify" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-storage-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改存储
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-storage-delete" defaultChecked disabled={!isEditingPermissions} />
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
                      <Checkbox id="perm-system-view" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-system-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        查看系统设置
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-system-modify" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-system-modify"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        修改系统设置
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-user-manage" defaultChecked disabled={!isEditingPermissions} />
                      <label
                        htmlFor="perm-user-manage"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        用户管理
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="perm-role-manage" defaultChecked disabled={!isEditingPermissions} />
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
              <Button variant="outline" onClick={() => setIsEditingPermissions(false)}>
                取消
              </Button>
              <Button onClick={() => {
                setPermissionsChanged(true)
                setTimeout(() => setPermissionsChanged(false), 2000)
                setIsEditingPermissions(false)
              }}>
                保存权限
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户信息和角色</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-username">用户名</Label>
              <Input 
                id="edit-username" 
                value={userToEdit?.username || ""}
                onChange={(e) => setUserToEdit(prev => prev ? {...prev, username: e.target.value} : null)}
                placeholder="输入用户名" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">电子邮箱</Label>
              <Input 
                id="edit-email" 
                type="email" 
                value={userToEdit?.email || ""}
                onChange={(e) => setUserToEdit(prev => prev ? {...prev, email: e.target.value} : null)}
                placeholder="输入电子邮箱" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">角色</Label>
              <Select 
                value={userToEdit?.role || ""}
                onValueChange={(value) => setUserToEdit(prev => prev ? {...prev, role: value} : null)}
              >
                <SelectTrigger id="edit-role">
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
              <Label htmlFor="edit-status">状态</Label>
              <Select 
                value={userToEdit?.status || ""}
                onValueChange={(value) => setUserToEdit(prev => prev ? {...prev, status: value} : null)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="活跃">活跃</SelectItem>
                  <SelectItem value="锁定">锁定</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditUser}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>修改角色信息和权限</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">角色名称</Label>
              <Input 
                id="edit-role-name" 
                value={roleToEdit?.name || ""}
                onChange={(e) => setRoleToEdit(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="输入角色名称" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">角色描述</Label>
              <Input 
                id="edit-role-description" 
                value={roleToEdit?.description || ""}
                onChange={(e) => setRoleToEdit(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="输入角色描述" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-permissions">权限级别</Label>
              <Select 
                value={roleToEdit?.permissions || ""}
                onValueChange={(value) => setRoleToEdit(prev => prev ? {...prev, permissions: value} : null)}
              >
                <SelectTrigger id="edit-role-permissions">
                  <SelectValue placeholder="选择权限级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="所有权限">所有权限</SelectItem>
                  <SelectItem value="读写权限，无管理权限">读写权限，无管理权限</SelectItem>
                  <SelectItem value="只读权限，可执行查询">只读权限，可执行查询</SelectItem>
                  <SelectItem value="有限的只读权限">有限的只读权限</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditRole}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为用户 {userToResetPassword?.username} 重置密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword.password}
                onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                placeholder="输入新密码" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">确认新密码</Label>
              <Input 
                id="confirm-new-password" 
                type="password" 
                value={newPassword.confirmPassword}
                onChange={(e) => setNewPassword({...newPassword, confirmPassword: e.target.value})}
                placeholder="再次输入新密码" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              取消
            </Button>
            <Button onClick={handleResetPassword}>重置密码</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除用户对话框 */}
      <Dialog open={isConfirmDeleteUserOpen} onOpenChange={setIsConfirmDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              您确定要删除此用户吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除用户将永久移除该用户的所有信息和访问权限。此操作无法恢复。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteUserOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除角色对话框 */}
      <Dialog open={isConfirmDeleteRoleOpen} onOpenChange={setIsConfirmDeleteRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除角色</DialogTitle>
            <DialogDescription>
              您确定要删除此角色吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除角色将永久移除该角色的所有信息和权限设置。此操作无法恢复。
                {roles.find(r => r.id === roleToDelete)?.users && roles.find(r => r.id === roleToDelete)?.users > 0 && (
                  <div className="mt-2 font-bold">
                    此角色当前有用户使用，无法删除。请先将用户分配到其他角色。
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteRoleOpen(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteRole}
              disabled={roles.find(r => r.id === roleToDelete)?.users > 0}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}