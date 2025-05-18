"use client"

import { useState, useEffect } from "react"
import { Layers, Search, Filter, MoreHorizontal, Play, ArrowRightLeft, AlertTriangle, Plus, Trash2, RefreshCw, Save, Download, Server } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Checkbox } from "@/components/ui/checkbox"

// 导入 API
import { clusterApi } from "@/api"
import { Node, Shard } from "@/mock/dashboard/types"

export default function ClusterShardsPage() {
  const [activeTab, setActiveTab] = useState("shards")
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [rebalanceProgress, setRebalanceProgress] = useState(0)
  const [shards, setShards] = useState<Shard[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState({
    shards: true,
    nodes: false
  })
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterNode, setFilterNode] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateShardOpen, setIsCreateShardOpen] = useState(false)
  const [isMigrateShardOpen, setIsMigrateShardOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [shardToDelete, setShardToDelete] = useState<string | null>(null)
  const [shardToMigrate, setShardToMigrate] = useState<string | null>(null)
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null)
  const [isMigrating, setIsMigrating] = useState<string | null>(null)
  const [isRebuildingIndex, setIsRebuildingIndex] = useState<string | null>(null)
  const [newShardData, setNewShardData] = useState({
    range: "",
    nodeId: "",
    replicas: 2
  })
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  useEffect(() => {
    const fetchShards = async () => {
      try {
        setLoading(prev => ({ ...prev, shards: true }))
        const response = await clusterApi.getShards()
        if (response.success) {
          setShards(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取分片数据失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, shards: false }))
      }
    }

    fetchShards()
  }, [])

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        setLoading(prev => ({ ...prev, nodes: true }))
        const response = await clusterApi.getNodes()
        if (response.success) {
          setNodes(response.data)
          // 默认选择所有在线节点
          setSelectedNodes(response.data.filter(node => node.status === "在线").map(node => node.id))
          // 如果没有选择节点ID，默认选择第一个在线节点
          if (newShardData.nodeId === "" && response.data.some(node => node.status === "在线")) {
            const firstOnlineNode = response.data.find(node => node.status === "在线")
            if (firstOnlineNode) {
              setNewShardData(prev => ({ ...prev, nodeId: firstOnlineNode.id }))
            }
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取节点数据失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, nodes: false }))
      }
    }

    fetchNodes()
  }, [])

  const handleRebalance = () => {
    setIsRebalancing(true)
    setRebalanceProgress(0)

    // 模拟重分布进度
    const interval = setInterval(() => {
      setRebalanceProgress((prev) => {
        const next = prev + 10
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsRebalancing(false)
            setRebalanceProgress(0)
            // 模拟重分布后的分片分布变化
            const updatedShards = [...shards]
            // 随机调整一些分片的节点分配
            updatedShards.forEach((shard, index) => {
              if (index % 2 === 0) {
                const availableNodes = nodes.filter(node => node.status === "在线" && node.id !== shard.nodeId)
                if (availableNodes.length > 0) {
                  const randomNode = availableNodes[Math.floor(Math.random() * availableNodes.length)]
                  shard.nodeId = randomNode.id
                }
              }
            })
            setShards(updatedShards)
          }, 1000)
          return 100
        }
        return next
      })
    }, 1000)
  }

  const handleCreateShard = async () => {
    if (!newShardData.range || !newShardData.nodeId) {
      setError('分片范围和节点不能为空')
      return
    }

    try {
      setLoading(prev => ({ ...prev, shards: true }))
      setError(null)
      
      const response = await clusterApi.createShard({
        range: newShardData.range,
        nodeId: newShardData.nodeId,
        status: "活跃",
        size: "0 GB",
        usage: 0,
        replicas: newShardData.replicas
      })
      
      if (response.success) {
        setShards([...shards, response.data])
        setIsCreateShardOpen(false)
        setNewShardData({
          range: "",
          nodeId: "",
          replicas: 2
        })
      } else {
        setError(response.message || "创建分片失败")
      }
    } catch (err) {
      console.error("创建分片出错:", err)
      setError("创建分片失败")
    } finally {
      setLoading(prev => ({ ...prev, shards: false }))
    }
  }

  const handleDeleteShard = async () => {
    if (!shardToDelete) return

    try {
      setLoading(prev => ({ ...prev, shards: true }))
      setError(null)
      
      const response = await clusterApi.deleteShard(shardToDelete)
      
      if (response.success) {
        setShards(shards.filter(shard => shard.id !== shardToDelete))
        setIsConfirmDeleteOpen(false)
        setShardToDelete(null)
      } else {
        setError(response.message || "删除分片失败")
      }
    } catch (err) {
      console.error("删除分片出错:", err)
      setError("删除分片失败")
    } finally {
      setLoading(prev => ({ ...prev, shards: false }))
    }
  }

  const handleMigrateShard = async () => {
    if (!shardToMigrate || !targetNodeId) {
      setError('请选择目标节点')
      return
    }

    try {
      setIsMigrating(shardToMigrate)
      setError(null)
      
      // 模拟迁移过程
      setTimeout(async () => {
        try {
          const response = await clusterApi.updateShard(shardToMigrate, {
            nodeId: targetNodeId
          })
          
          if (response.success) {
            setShards(shards.map(shard => 
              shard.id === shardToMigrate ? response.data : shard
            ))
            setIsMigrateShardOpen(false)
            setShardToMigrate(null)
            setTargetNodeId(null)
          } else {
            setError(response.message || "迁移分片失败")
          }
        } catch (err) {
          console.error("迁移分片出错:", err)
          setError("迁移分片失败")
        } finally {
          setIsMigrating(null)
        }
      }, 3000)
    } catch (err) {
      console.error("迁移分片出错:", err)
      setError("迁移分片失败")
      setIsMigrating(null)
    }
  }

  const handleRebuildIndex = async (shardId: string) => {
    try {
      setIsRebuildingIndex(shardId)
      setError(null)
      
      // 模拟重建索引过程
      setTimeout(() => {
        setIsRebuildingIndex(null)
      }, 3000)
    } catch (err) {
      console.error("重建索引出错:", err)
      setError("重建索引失败")
      setIsRebuildingIndex(null)
    }
  }

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    )
  }

  // 过滤分片
  const filteredShards = shards.filter(shard => {
    const matchesSearch = 
      shard.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shard.range.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNode = filterNode === 'all' || shard.nodeId === filterNode;
    const matchesStatus = filterStatus === 'all' || shard.status === filterStatus;
    
    return matchesSearch && matchesNode && matchesStatus;
  });

  // 获取节点名称
  const getNodeName = (nodeId: string) => {
    const node = nodes.find(node => node.id === nodeId)
    return node ? node.name : nodeId
  }

  // 计算每个节点的分片数量和总大小
  const nodeShardStats = nodes.map(node => {
    const nodeShards = shards.filter(shard => shard.nodeId === node.id)
    const totalSize = nodeShards.reduce((sum, shard) => {
      const sizeInGB = parseFloat(shard.size.replace(' GB', ''))
      return sum + (isNaN(sizeInGB) ? 0 : sizeInGB)
    }, 0)
    
    return {
      ...node,
      shardCount: nodeShards.length,
      totalSize: `${totalSize.toFixed(1)} GB`
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分片管理</h1>
          <p className="text-muted-foreground">管理集群中的数据分片</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateShardOpen} onOpenChange={setIsCreateShardOpen}>
            <DialogTrigger asChild>
              <Button>
                <Layers className="mr-2 h-4 w-4" />
                创建分片
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新分片</DialogTitle>
                <DialogDescription>创建一个新的数据分片</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shard-range" className="text-right">
                    分片范围
                  </Label>
                  <Input
                    id="shard-range"
                    value={newShardData.range}
                    onChange={(e) => setNewShardData({...newShardData, range: e.target.value})}
                    placeholder="例如: 0-1023"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shard-node" className="text-right">
                    节点
                  </Label>
                  <Select
                    value={newShardData.nodeId}
                    onValueChange={(value) => setNewShardData({...newShardData, nodeId: value})}
                  >
                    <SelectTrigger id="shard-node" className="col-span-3">
                      <SelectValue placeholder="选择节点" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes
                        .filter(node => node.status === "在线")
                        .map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({node.id})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shard-replicas" className="text-right">
                    副本数
                  </Label>
                  <Select
                    value={newShardData.replicas.toString()}
                    onValueChange={(value) => setNewShardData({...newShardData, replicas: parseInt(value)})}
                  >
                    <SelectTrigger id="shard-replicas" className="col-span-3">
                      <SelectValue placeholder="选择副本数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 个副本</SelectItem>
                      <SelectItem value="2">2 个副本</SelectItem>
                      <SelectItem value="3">3 个副本</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateShardOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateShard}>创建分片</Button>
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
          <TabsTrigger value="shards">分片列表</TabsTrigger>
          <TabsTrigger value="distribution">分片分布</TabsTrigger>
          <TabsTrigger value="rebalance">重分布</TabsTrigger>
        </TabsList>

        <TabsContent value="shards" className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索分片..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterNode} onValueChange={setFilterNode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选节点" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有节点</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="活跃">活跃</SelectItem>
                  <SelectItem value="迁移中">迁移中</SelectItem>
                  <SelectItem value="同步中">同步中</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("")
                setFilterNode("all")
                setFilterStatus("all")
              }}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-7 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>范围</div>
              <div>节点</div>
              <div>状态</div>
              <div>大小</div>
              <div>使用率</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {loading.shards ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : filteredShards.length === 0 ? (
                <div className="py-8 text-center">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {shards.length === 0 ? "暂无分片数据" : "没有匹配的分片"}
                  </p>
                  {shards.length === 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateShardOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      创建第一个分片
                    </Button>
                  )}
                </div>
              ) : (
                filteredShards.map((shard) => (
                  <div key={shard.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{shard.id}</div>
                    <div>{shard.range}</div>
                    <div>{getNodeName(shard.nodeId)}</div>
                    <div>
                      <Badge variant={shard.status === "活跃" ? "success" : "warning"}>
                        {isMigrating === shard.id ? "迁移中" : shard.status}
                      </Badge>
                    </div>
                    <div>{shard.size}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={shard.usage}
                          className="h-2 flex-1"
                          indicatorClassName={
                            shard.usage > 80 ? "bg-red-500" : shard.usage > 60 ? "bg-amber-500" : "bg-green-500"
                          }
                        />
                        <span className="text-xs">{shard.usage}%</span>
                      </div>
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
                          <DropdownMenuLabel>分片操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setShardToMigrate(shard.id)
                              setIsMigrateShardOpen(true)
                            }}
                            disabled={isMigrating === shard.id}
                          >
                            {isMigrating === shard.id ? (
                              <>
                                <ArrowRightLeft className="mr-2 h-4 w-4 animate-pulse" />
                                迁移中...
                              </>
                            ) : (
                              <>
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                迁移分片
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRebuildIndex(shard.id)}
                            disabled={isRebuildingIndex === shard.id}
                          >
                            {isRebuildingIndex === shard.id ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                重建中...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                重建索引
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setShardToDelete(shard.id)
                              setIsConfirmDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除分片
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

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>分片分布</CardTitle>
              <CardDescription>集群中各节点的分片分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {loading.nodes || loading.shards ? (
                    <div className="col-span-full py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">加载中...</p>
                    </div>
                  ) : nodeShardStats.length === 0 ? (
                    <div className="col-span-full py-8 text-center">
                      <Server className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">暂无节点数据</p>
                    </div>
                  ) : (
                    nodeShardStats.map((node) => (
                      <div key={node.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{node.name} ({node.id})</h3>
                          <Badge variant="outline" className={node.status === "在线" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                            {node.shardCount} 个分片
                          </Badge>
                        </div>
                        {node.status === "在线" ? (
                          <>
                            <div className="space-y-2">
                              {shards
                                .filter(shard => shard.nodeId === node.id)
                                .map(shard => (
                                  <div key={shard.id} className="flex items-center justify-between text-sm">
                                    <span>{shard.id} ({shard.range})</span>
                                    <span>{shard.size}</span>
                                  </div>
                                ))}
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">总容量: {node.totalSize}</div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-20">
                            <p className="text-sm text-muted-foreground">节点离线</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={async () => {
                    try {
                      setLoading(prev => ({ ...prev, shards: true, nodes: true }))
                      setError(null)
                      
                      // 重新获取分片数据
                      const shardsResponse = await clusterApi.getShards()
                      if (shardsResponse.success) {
                        setShards(shardsResponse.data)
                      } else {
                        setError(shardsResponse.message)
                      }
                      
                      // 重新获取节点数据
                      const nodesResponse = await clusterApi.getNodes()
                      if (nodesResponse.success) {
                        setNodes(nodesResponse.data)
                      } else {
                        setError(nodesResponse.message)
                      }
                    } catch (err) {
                      setError('刷新数据失败')
                      console.error(err)
                    } finally {
                      setLoading(prev => ({ ...prev, shards: false, nodes: false }))
                    }
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>分片重分布</CardTitle>
              <CardDescription>重新平衡集群中的数据分片</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">重分布策略</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger>
                        <SelectValue placeholder="选择重分布策略" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">均衡分布</SelectItem>
                        <SelectItem value="capacity">容量优先</SelectItem>
                        <SelectItem value="performance">性能优先</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">并行度</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="选择并行度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低 (1 个任务)</SelectItem>
                        <SelectItem value="medium">中 (2 个任务)</SelectItem>
                        <SelectItem value="high">高 (4 个任务)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">目标节点</Label>
                  <div className="flex flex-wrap gap-2">
                    {nodes
                      .filter(node => node.status === "在线")
                      .map(node => (
                        <Badge 
                          key={node.id} 
                          variant="outline" 
                          className={`cursor-pointer ${selectedNodes.includes(node.id) ? "bg-primary/10" : ""}`}
                          onClick={() => toggleNodeSelection(node.id)}
                        >
                          {node.name}
                        </Badge>
                      ))}
                  </div>
                </div>

                {isRebalancing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">重分布进度</span>
                      <span className="text-sm">{rebalanceProgress}%</span>
                    </div>
                    <Progress value={rebalanceProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">正在重分布分片，请勿关闭页面...</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    disabled={isRebalancing || selectedNodes.length === 0}
                    onClick={() => {
                      // 模拟预览变更
                      setError(null)
                      if (selectedNodes.length === 0) {
                        setError("请至少选择一个目标节点")
                        return
                      }
                      
                      alert(`预览变更：将在 ${selectedNodes.length} 个节点之间重新分布 ${shards.length} 个分片`)
                    }}
                  >
                    预览变更
                  </Button>
                  <Button 
                    onClick={handleRebalance} 
                    disabled={isRebalancing || selectedNodes.length === 0}
                  >
                    {isRebalancing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        重分布中...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        开始重分布
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 迁移分片对话框 */}
      <Dialog open={isMigrateShardOpen} onOpenChange={setIsMigrateShardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>迁移分片</DialogTitle>
            <DialogDescription>将分片迁移到另一个节点</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-node" className="text-right">
                目标节点
              </Label>
              <Select
                value={targetNodeId || ""}
                onValueChange={setTargetNodeId}
              >
                <SelectTrigger id="target-node" className="col-span-3">
                  <SelectValue placeholder="选择目标节点" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter(node => node.status === "在线" && (shardToMigrate ? node.id !== shards.find(s => s.id === shardToMigrate)?.nodeId : true))
                    .map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name} ({node.id})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="py-2">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>迁移提示</AlertTitle>
                <AlertDescription>
                  分片迁移过程中可能会影响查询性能，建议在低峰期进行操作。
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMigrateShardOpen(false)} disabled={isMigrating !== null}>
              取消
            </Button>
            <Button onClick={handleMigrateShard} disabled={!targetNodeId || isMigrating !== null}>
              {isMigrating !== null ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  迁移中...
                </>
              ) : (
                "开始迁移"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除分片</DialogTitle>
            <DialogDescription>
              您确定要删除此分片吗？此操作不可撤销，可能会导致数据丢失。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除分片将永久移除其中的所有数据。请确保您已经备份了重要数据或确认此分片中的数据不再需要。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteShard}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}