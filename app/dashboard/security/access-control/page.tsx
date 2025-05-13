"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Shield, AlertTriangle, Plus, Trash2, RefreshCw, Edit, Save } from "lucide-react"

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
import { AccessPolicy } from "@/mock/dashboard/types"

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [isAddPolicyOpen, setIsAddPolicyOpen] = useState(false)
  const [isEditPolicyOpen, setIsEditPolicyOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [accessPolicies, setAccessPolicies] = useState<AccessPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all")
  const [policyToEdit, setPolicyToEdit] = useState<AccessPolicy | null>(null)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
  const [newPolicyData, setNewPolicyData] = useState({
    name: "",
    type: "数据库",
    target: "postgres-main",
    role: "管理员",
    access: "只读"
  })
  const [isEditingPermissions, setIsEditingPermissions] = useState(false)
  const [permissionsChanged, setPermissionsChanged] = useState(false)

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

  const handleAddPolicy = async () => {
    try {
      if (!newPolicyData.name || !newPolicyData.type || !newPolicyData.target || !newPolicyData.role || !newPolicyData.access) {
        setError('请填写所有必填字段')
        return
      }
      
      setLoading(true)
      setError(null)
      
      const response = await securityApi.createAccessPolicy(newPolicyData)
      if (response.success) {
        setAccessPolicies(prev => [...prev, response.data])
        setIsAddPolicyOpen(false)
        setNewPolicyData({
          name: "",
          type: "数据库",
          target: "postgres-main",
          role: "管理员",
          access: "只读"
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建访问策略失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPolicy = async () => {
    if (!policyToEdit) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await securityApi.updateAccessPolicy(policyToEdit.id, policyToEdit)
      if (response.success) {
        setAccessPolicies(prev => prev.map(policy => 
          policy.id === policyToEdit.id ? response.data : policy
        ))
        setIsEditPolicyOpen(false)
        setPolicyToEdit(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('更新访问策略失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePolicy = async () => {
    if (!policyToDelete) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await securityApi.deleteAccessPolicy(policyToDelete)
      if (response.success) {
        setAccessPolicies(prev => prev.filter(policy => policy.id !== policyToDelete))
        setIsConfirmDeleteOpen(false)
        setPolicyToDelete(null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('删除访问策略失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 过滤策略
  const filteredPolicies = accessPolicies.filter(policy => {
    const matchesSearch = 
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || policy.type === typeFilter
    const matchesAccess = accessFilter === 'all' || policy.access === accessFilter
    
    return matchesSearch && matchesType && matchesAccess
  })

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
                  <Input 
                    id="policy-name" 
                    value={newPolicyData.name}
                    onChange={(e) => setNewPolicyData({...newPolicyData, name: e.target.value})}
                    placeholder="输入策略名称" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-type">资源类型</Label>
                  <Select 
                    value={newPolicyData.type}
                    onValueChange={(value) => setNewPolicyData({...newPolicyData, type: value})}
                  >
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
                  <Select 
                    value={newPolicyData.target}
                    onValueChange={(value) => setNewPolicyData({...newPolicyData, target: value})}
                  >
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
                  <Select 
                    value={newPolicyData.role}
                    onValueChange={(value) => setNewPolicyData({...newPolicyData, role: value})}
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
                <div className="space-y-2">
                  <Label htmlFor="access-level">访问级别</Label>
                  <Select 
                    value={newPolicyData.access}
                    onValueChange={(value) => setNewPolicyData({...newPolicyData, access: value})}
                  >
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
                <Button variant="outline" onClick={() => setIsAddPolicyOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddPolicy}>创建策略</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={async () => {
            try {
              setLoading(true)
              setError(null)
              const response = await securityApi.getAccessPolicies()
              if (response.success) {
                setAccessPolicies(response.data)
              } else {
                setError(response.message)
              }
            } catch (err) {
              setError('刷新策略数据失败')
              console.error(err)
            } finally {
              setLoading(false)
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
          <TabsTrigger value="policies">访问策略</TabsTrigger>
          <TabsTrigger value="database">数据库权限</TabsTrigger>
          <TabsTrigger value="storage">存储权限</TabsTrigger>
          <TabsTrigger value="system">系统权限</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索策略..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="数据库">数据库</SelectItem>
                <SelectItem value="存储">存储</SelectItem>
                <SelectItem value="系统">系统</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选访问级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有级别</SelectItem>
                <SelectItem value="完全访问">完全访问</SelectItem>
                <SelectItem value="读写">读写</SelectItem>
                <SelectItem value="只读">只读</SelectItem>
                <SelectItem value="无访问">无访问</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery("")
              setTypeFilter("all")
              setAccessFilter("all")
            }}>
              <Filter className="h-4 w-4" />
              <span className="sr-only">重置筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>策略名称</TableHead>
                  <TableHead>资源类型</TableHead>
                  <TableHead>资源目标</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>访问级别</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-muted-foreground">加载中...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {accessPolicies.length === 0 
                            ? "暂无访问策略数据" 
                            : "没有符合筛选条件的策略"}
                        </p>
                        {accessPolicies.length === 0 && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setIsAddPolicyOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            创建第一个策略
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.type}</Badge>
                      </TableCell>
                      <TableCell>{policy.target}</TableCell>
                      <TableCell>{policy.role}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right">
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
                            <DropdownMenuItem onClick={() => {
                              setPolicyToEdit({...policy})
                              setIsEditPolicyOpen(true)
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑策略
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              复制策略
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setPolicyToDelete(policy.id)
                                setIsConfirmDeleteOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除策略
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

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>数据库访问权限</CardTitle>
                  <CardDescription>配置数据库资源的访问权限</CardDescription>
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

              {permissionsChanged && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>权限已更新</AlertTitle>
                  <AlertDescription>数据库访问权限已成功保存</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色</TableHead>
                      <TableHead>连接</TableHead>
                      <TableHead>读取</TableHead>
                      <TableHead>写入</TableHead>
                      <TableHead>管理</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">管理员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">操作员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">分析师</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">访客</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>存储访问权限</CardTitle>
                  <CardDescription>配置存储资源的访问权限</CardDescription>
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

              {permissionsChanged && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>权限已更新</AlertTitle>
                  <AlertDescription>存储访问权限已成功保存</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色</TableHead>
                      <TableHead>列出</TableHead>
                      <TableHead>读取</TableHead>
                      <TableHead>写入</TableHead>
                      <TableHead>删除</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">管理员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">操作员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">分析师</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">访客</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>系统访问权限</CardTitle>
                  <CardDescription>配置系统资源的访问权限</CardDescription>
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

              {permissionsChanged && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>权限已更新</AlertTitle>
                  <AlertDescription>系统访问权限已成功保存</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色</TableHead>
                      <TableHead>查看</TableHead>
                      <TableHead>使用</TableHead>
                      <TableHead>配置</TableHead>
                      <TableHead>管理</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">管理员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">操作员</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">分析师</TableCell>
                      <TableCell>
                        <Checkbox defaultChecked disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">访客</TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                      <TableCell>
                        <Checkbox disabled={!isEditingPermissions} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑策略对话框 */}
      <Dialog open={isEditPolicyOpen} onOpenChange={setIsEditPolicyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑访问策略</DialogTitle>
            <DialogDescription>修改现有的资源访问策略</DialogDescription>
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
              <Label htmlFor="edit-policy-name">策略名称</Label>
              <Input 
                id="edit-policy-name" 
                value={policyToEdit?.name || ""}
                onChange={(e) => setPolicyToEdit(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="输入策略名称" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-resource-type">资源类型</Label>
              <Select 
                value={policyToEdit?.type || ""}
                onValueChange={(value) => setPolicyToEdit(prev => prev ? {...prev, type: value} : null)}
              >
                <SelectTrigger id="edit-resource-type">
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
              <Label htmlFor="edit-resource-target">资源目标</Label>
              <Select 
                value={policyToEdit?.target || ""}
                onValueChange={(value) => setPolicyToEdit(prev => prev ? {...prev, target: value} : null)}
              >
                <SelectTrigger id="edit-resource-target">
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
              <Label htmlFor="edit-role">角色</Label>
              <Select 
                value={policyToEdit?.role || ""}
                onValueChange={(value) => setPolicyToEdit(prev => prev ? {...prev, role: value} : null)}
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
              <Label htmlFor="edit-access-level">访问级别</Label>
              <Select 
                value={policyToEdit?.access || ""}
                onValueChange={(value) => setPolicyToEdit(prev => prev ? {...prev, access: value} : null)}
              >
                <SelectTrigger id="edit-access-level">
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
            <Button variant="outline" onClick={() => setIsEditPolicyOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditPolicy}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除策略</DialogTitle>
            <DialogDescription>
              您确定要删除此访问策略吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除访问策略可能会导致相关用户失去对资源的访问权限。请确保您了解此操作的影响。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePolicy}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}