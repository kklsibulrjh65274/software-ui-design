"use client"

import { useState, useEffect } from "react"
import { Layers, Search, Filter, MoreHorizontal, RefreshCw, ArrowRightLeft } from "lucide-react"

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

// 导入 API
import { clusterApi } from "@/api"
import { Shard } from "@/mock/dashboard/types"

export default function ClusterShardsPage() {
  const [activeTab, setActiveTab] = useState("shards")
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [rebalanceProgress, setRebalanceProgress] = useState(0)
  const [shards, setShards] = useState<Shard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShards = async () => {
      try {
        setLoading(true)
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
        setLoading(false)
      }
    }

    fetchShards()
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
          }, 1000)
          return 100
        }
        return next
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分片管理</h1>
          <p className="text-muted-foreground">管理集群中的数据分片</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Layers className="mr-2 h-4 w-4" />
            创建分片
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
          <TabsTrigger value="shards">分片列表</TabsTrigger>
          <TabsTrigger value="distribution">分片分布</TabsTrigger>
          <TabsTrigger value="rebalance">重分布</TabsTrigger>
        </TabsList>

        <TabsContent value="shards" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索分片..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
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
              {loading ? (
                <div className="py-8 text-center">加载中...</div>
              ) : shards.length === 0 ? (
                <div className="py-8 text-center">暂无分片数据</div>
              ) : (
                shards.map((shard) => (
                  <div key={shard.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                    <div className="font-medium">{shard.id}</div>
                    <div>{shard.range}</div>
                    <div>{shard.nodeId}</div>
                    <div>
                      <Badge variant="success">{shard.status}</Badge>
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
                          <DropdownMenuItem>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            迁移分片
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            重建索引
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">删除分片</DropdownMenuItem>
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
                <div className="grid grid-cols-4 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">节点 1 (node-01)</h3>
                      <Badge variant="outline">2 个分片</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>shard-01</span>
                        <span>245 GB</span>
                      </div>
                      <Progress value={62} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span>shard-05</span>
                        <span>267 GB</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">总容量: 512 GB</div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">节点 2 (node-02)</h3>
                      <Badge variant="outline">1 个分片</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>shard-02</span>
                        <span>312 GB</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">总容量: 312 GB</div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">节点 3 (node-03)</h3>
                      <Badge variant="outline">1 个分片</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>shard-03</span>
                        <span>178 GB</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">总容量: 178 GB</div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">节点 4 (node-04)</h3>
                      <Badge variant="outline">1 个分片</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>shard-04</span>
                        <span>203 GB</span>
                      </div>
                      <Progress value={51} className="h-2" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">总容量: 203 GB</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
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
                    <label className="text-sm font-medium">重分布策略</label>
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
                    <label className="text-sm font-medium">并行度</label>
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
                  <label className="text-sm font-medium">目标节点</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer bg-primary/10">
                      node-01
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer bg-primary/10">
                      node-02
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                      node-03
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                      node-04
                    </Badge>
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
                  <Button variant="outline" disabled={isRebalancing}>
                    预览变更
                  </Button>
                  <Button onClick={handleRebalance} disabled={isRebalancing}>
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
    </div>
  )
}