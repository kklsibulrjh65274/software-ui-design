"use client"

import { useState, useEffect } from "react"
import { Server, Search, Filter, MoreHorizontal, Play, Pause, RefreshCw, AlertTriangle, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 导入 API
import { clusterApi } from "@/api"
import { Node } from "@/mock/dashboard/types"

export default function ClusterNodesPage() {
  const [activeTab, setActiveTab] = useState("nodes")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false)
  const [newNodeData, setNewNodeData] = useState({
    name: "",
    ip: "",
    role: "数据节点",
  })
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  const [isRestarting, setIsRestarting] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState<string | null>(null)
  const [isStopping, setIsStopping] = useState<string | null>(null)

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(true)
        const response = await clusterApi.getNodes()
        if (response.success) {
          setNodes(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取节点数据失败')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchNodes()
  }, [])

  const handleViewNode = (nodeId: string) => {
    setSelectedNode(nodeId)
    setActiveTab("details")
  }

  const handleAddNode = async () => {
    if (!newNodeData.name || !newNodeData.ip) {
      setError('节点名称和IP地址不能为空')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await clusterApi.createNode({
        name: newNodeData.name,
        ip: newNodeData.ip,
        role: newNodeData.role,
        status: "离线", // 新节点默认为离线状态
        cpu: 0,
        memory: 0,
        disk: 0
      })
      
      if (response.success) {
        setNodes([...nodes, response.data])
        setIsAddNodeOpen(false)
        setNewNodeData({
          name: "",
          ip: "",
          role: "数据节点"
        })
      } else {
        setError(response.message || "添加节点失败")
      }
    } catch (err) {
      console.error("添加节点出错:", err)
      setError("添加节点失败")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNode = async () => {
    if (!nodeToDelete) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await clusterApi.deleteNode(nodeToDelete)
      
      if (response.success) {
        setNodes(nodes.filter(node => node.id !== nodeToDelete))
        if (selectedNode === nodeToDelete) {
          setSelectedNode(null)
        }
        setIsConfirmDeleteOpen(false)
        setNodeToDelete(null)
      } else {
        setError(response.message || "删除节点失败")
      }
    } catch (err) {
      console.error("删除节点出错:", err)
      setError("删除节点失败")
    } finally {
      setLoading(false)
    }
  }

  const handleStartNode = async (nodeId: string) => {
    try {
      setIsStarting(nodeId)
      setError(null)
      
      // 模拟启动节点
      setTimeout(async () => {
        try {
          const response = await clusterApi.updateNode(nodeId, {
            status: "在线",
            cpu: Math.floor(Math.random() * 30) + 20, // 随机生成20-50之间的CPU使用率
            memory: Math.floor(Math.random() * 30) + 20, // 随机生成20-50之间的内存使用率
            disk: Math.floor(Math.random() * 30) + 20 // 随机生成20-50之间的磁盘使用率
          })
          
          if (response.success) {
            setNodes(nodes.map(node => 
              node.id === nodeId ? response.data : node
            ))
          } else {
            setError(response.message || "启动节点失败")
          }
        } catch (err) {
          console.error("启动节点出错:", err)
          setError("启动节点失败")
        } finally {
          setIsStarting(null)
        }
      }, 2000)
    } catch (err) {
      console.error("启动节点出错:", err)
      setError("启动节点失败")
      setIsStarting(null)
    }
  }

  const handleStopNode = async (nodeId: string) => {
    try {
      setIsStopping(nodeId)
      setError(null)
      
      // 模拟停止节点
      setTimeout(async () => {
        try {
          const response = await clusterApi.updateNode(nodeId, {
            status: "离线",
            cpu: 0,
            memory: 0,
            disk: 0
          })
          
          if (response.success) {
            setNodes(nodes.map(node => 
              node.id === nodeId ? response.data : node
            ))
          } else {
            setError(response.message || "停止节点失败")
          }
        } catch (err) {
          console.error("停止节点出错:", err)
          setError("停止节点失败")
        } finally {
          setIsStopping(null)
        }
      }, 2000)
    } catch (err) {
      console.error("停止节点出错:", err)
      setError("停止节点失败")
      setIsStopping(null)
    }
  }

  const handleRestartNode = async (nodeId: string) => {
    try {
      setIsRestarting(nodeId)
      setError(null)
      
      // 模拟重启节点
      setTimeout(async () => {
        try {
          // 先将节点设为离线
          await clusterApi.updateNode(nodeId, {
            status: "离线",
            cpu: 0,
            memory: 0,
            disk: 0
          })
          
          // 延迟后将节点设为在线
          setTimeout(async () => {
            try {
              const response = await clusterApi.updateNode(nodeId, {
                status: "在线",
                cpu: Math.floor(Math.random() * 30) + 20,
                memory: Math.floor(Math.random() * 30) + 20,
                disk: Math.floor(Math.random() * 30) + 20
              })
              
              if (response.success) {
                setNodes(nodes.map(node => 
                  node.id === nodeId ? response.data : node
                ))
              } else {
                setError(response.message || "重启节点失败")
              }
            } catch (err) {
              console.error("重启节点出错:", err)
              setError("重启节点失败")
            } finally {
              setIsRestarting(null)
            }
          }, 2000)
        } catch (err) {
          console.error("重启节点出错:", err)
          setError("重启节点失败")
          setIsRestarting(null)
        }
      }, 1000)
    } catch (err) {
      console.error("重启节点出错:", err)
      setError("重启节点失败")
      setIsRestarting(null)
    }
  }

  // 过滤节点
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.ip.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || node.role === filterRole;
    const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">节点管理</h1>
          <p className="text-muted-foreground">管理集群中的节点</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Server className="mr-2 h-4 w-4" />
                添加节点
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新节点</DialogTitle>
                <DialogDescription>将新节点添加到集群中</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="node-name" className="text-right">
                    节点名称
                  </Label>
                  <Input
                    id="node-name"
                    value={newNodeData.name}
                    onChange={(e) => setNewNodeData({...newNodeData, name: e.target.value})}
                    placeholder="输入节点名称"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="node-ip" className="text-right">
                    IP 地址
                  </Label>
                  <Input
                    id="node-ip"
                    value={newNodeData.ip}
                    onChange={(e) => setNewNodeData({...newNodeData, ip: e.target.value})}
                    placeholder="输入IP地址"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="node-role" className="text-right">
                    节点角色
                  </Label>
                  <Select
                    value={newNodeData.role}
                    onValueChange={(value) => setNewNodeData({...newNodeData, role: value})}
                  >
                    <SelectTrigger id="node-role" className="col-span-3">
                      <SelectValue placeholder="选择节点角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="主节点">主节点</SelectItem>
                      <SelectItem value="数据节点">数据节点</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNodeOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddNode}>添加节点</Button>
              </DialogFooter>
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
          <TabsTrigger value="nodes">节点列表</TabsTrigger>
          <TabsTrigger value="details">节点详情</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索节点..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  <SelectItem value="主节点">主节点</SelectItem>
                  <SelectItem value="数据节点">数据节点</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="在线">在线</SelectItem>
                  <SelectItem value="离线">离线</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("")
                setFilterRole("all")
                setFilterStatus("all")
              }}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-8 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>IP 地址</div>
              <div>角色</div>
              <div>状态</div>
              <div>CPU</div>
              <div>内存</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : filteredNodes.length === 0 ? (
                <div className="py-8 text-center">
                  <Server className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {nodes.length === 0 ? "暂无节点数据" : "没有匹配的节点"}
                  </p>
                  {nodes.length === 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsAddNodeOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个节点
                    </Button>
                  )}
                </div>
              ) : (
                filteredNodes.map((node) => (
                  <div key={node.id} className="grid grid-cols-8 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{node.id}</div>
                    <div>{node.name}</div>
                    <div>{node.ip}</div>
                    <div>{node.role}</div>
                    <div>
                      <Badge variant={node.status === "在线" ? "success" : "destructive"}>{node.status}</Badge>
                    </div>
                    <div>
                      {node.status === "在线" ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={node.cpu}
                            className="h-2 flex-1"
                            indicatorClassName={
                              node.cpu > 80 ? "bg-red-500" : node.cpu > 60 ? "bg-amber-500" : "bg-green-500"
                            }
                          />
                          <span className="text-xs">{node.cpu}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">不可用</span>
                      )}
                    </div>
                    <div>
                      {node.status === "在线" ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={node.memory}
                            className="h-2 flex-1"
                            indicatorClassName={
                              node.memory > 80 ? "bg-red-500" : node.memory > 60 ? "bg-amber-500" : "bg-green-500"
                            }
                          />
                          <span className="text-xs">{node.memory}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">不可用</span>
                      )}
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
                          <DropdownMenuLabel>节点操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewNode(node.id)}>查看详情</DropdownMenuItem>
                          {node.status === "在线" ? (
                            <DropdownMenuItem onClick={() => handleStopNode(node.id)} disabled={isStopping === node.id}>
                              {isStopping === node.id ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4 animate-pulse" />
                                  停止中...
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  停止节点
                                </>
                              )}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStartNode(node.id)} disabled={isStarting === node.id}>
                              {isStarting === node.id ? (
                                <>
                                  <Play className="mr-2 h-4 w-4 animate-pulse" />
                                  启动中...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  启动节点
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleRestartNode(node.id)} disabled={isRestarting === node.id}>
                            {isRestarting === node.id ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                重启中...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                重启节点
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setNodeToDelete(node.id)
                              setIsConfirmDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            移除节点
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedNode ? (
            (() => {
              const node = nodes.find((n) => n.id === selectedNode)
              if (!node) return null

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      <h2 className="text-xl font-semibold">{node.name}</h2>
                      <Badge variant={node.status === "在线" ? "success" : "destructive"}>{node.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {node.status === "在线" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStopNode(node.id)}
                          disabled={isStopping === node.id}
                        >
                          {isStopping === node.id ? (
                            <>
                              <Pause className="mr-2 h-4 w-4 animate-pulse" />
                              停止中...
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              停止节点
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStartNode(node.id)}
                          disabled={isStarting === node.id}
                        >
                          {isStarting === node.id ? (
                            <>
                              <Play className="mr-2 h-4 w-4 animate-pulse" />
                              启动中...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              启动节点
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestartNode(node.id)}
                        disabled={isRestarting === node.id}
                      >
                        {isRestarting === node.id ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            重启中...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            重启节点
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          setNodeToDelete(node.id)
                          setIsConfirmDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        移除节点
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>节点信息</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-4">
                          <div className="flex justify-between">
                            <dt className="font-medium">ID:</dt>
                            <dd>{node.id}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">IP 地址:</dt>
                            <dd>{node.ip}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">角色:</dt>
                            <dd>{node.role}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">状态:</dt>
                            <dd>{node.status}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">操作系统:</dt>
                            <dd>Linux 5.15.0</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">CPU 核心:</dt>
                            <dd>8</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">内存:</dt>
                            <dd>32 GB</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">磁盘:</dt>
                            <dd>2 TB</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>资源使用</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {node.status === "在线" ? (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">CPU 使用率</span>
                                <span className="text-sm">{node.cpu}%</span>
                              </div>
                              <Progress
                                value={node.cpu}
                                className="h-2"
                                indicatorClassName={
                                  node.cpu > 80 ? "bg-red-500" : node.cpu > 60 ? "bg-amber-500" : "bg-green-500"
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">内存使用率</span>
                                <span className="text-sm">{node.memory}%</span>
                              </div>
                              <Progress
                                value={node.memory}
                                className="h-2"
                                indicatorClassName={
                                  node.memory > 80 ? "bg-red-500" : node.memory > 60 ? "bg-amber-500" : "bg-green-500"
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">磁盘使用率</span>
                                <span className="text-sm">{node.disk}%</span>
                              </div>
                              <Progress
                                value={node.disk}
                                className="h-2"
                                indicatorClassName={
                                  node.disk > 80 ? "bg-red-500" : node.disk > 60 ? "bg-amber-500" : "bg-green-500"
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">网络 I/O</span>
                                <span className="text-sm">45 MB/s</span>
                              </div>
                              <Progress value={45} className="h-2" />
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                              <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
                              <p className="mt-2">节点当前离线，无法获取资源使用情况</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>节点日志</CardTitle>
                      <CardDescription>最近的节点日志记录</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {node.status === "在线" ? (
                        <div className="rounded-md border bg-muted/20 p-4 font-mono text-sm h-60 overflow-auto">
                          <div className="text-muted-foreground">[2023-05-10 08:12:34] INFO: 节点启动成功</div>
                          <div className="text-muted-foreground">
                            [2023-05-10 08:12:35] INFO: 连接到集群管理器 192.168.1.100
                          </div>
                          <div className="text-muted-foreground">[2023-05-10 08:12:36] INFO: 加入集群成功</div>
                          <div className="text-muted-foreground">
                            [2023-05-10 08:12:40] INFO: 数据同步开始，从节点 node-01 同步
                          </div>
                          <div className="text-muted-foreground">[2023-05-10 08:15:22] INFO: 数据同步完成</div>
                          <div className="text-muted-foreground">[2023-05-10 08:15:23] INFO: 节点状态变更为在线</div>
                          <div className="text-muted-foreground">
                            [2023-05-10 09:30:45] WARN: 内存使用率超过 80%，触发垃圾回收
                          </div>
                          <div className="text-muted-foreground">[2023-05-10 09:30:50] INFO: 垃圾回收完成</div>
                          <div className="text-muted-foreground">
                            [2023-05-10 10:45:12] INFO: 接收到分片重分布请求
                          </div>
                          <div className="text-muted-foreground">[2023-05-10 10:48:35] INFO: 分片重分布完成</div>
                        </div>
                      ) : (
                        <Alert variant="warning">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>节点离线</AlertTitle>
                          <AlertDescription>节点当前离线，无法获取日志信息</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </>
              )
            })()
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-60">
                <div className="text-center">
                  <Server className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">未选择节点</h3>
                  <p className="mt-1 text-sm text-muted-foreground">请从节点列表中选择一个节点查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 确认删除对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认移除节点</DialogTitle>
            <DialogDescription>
              您确定要移除此节点吗？此操作不可撤销，可能会导致数据丢失。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                移除节点前，请确保该节点上的数据已经迁移或备份，否则可能导致数据永久丢失。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteNode}>
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}