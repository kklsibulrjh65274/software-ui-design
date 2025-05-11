"use client"

import { useState } from "react"
import { Server, Search, Filter, MoreHorizontal, Play, Pause, RefreshCw, AlertTriangle } from "lucide-react"

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

const nodes = [
  {
    id: "node-01",
    name: "节点 1",
    ip: "192.168.1.101",
    role: "主节点",
    status: "在线",
    cpu: 45,
    memory: 62,
    disk: 38,
  },
  {
    id: "node-02",
    name: "节点 2",
    ip: "192.168.1.102",
    role: "主节点",
    status: "在线",
    cpu: 32,
    memory: 48,
    disk: 55,
  },
  {
    id: "node-03",
    name: "节点 3",
    ip: "192.168.1.103",
    role: "数据节点",
    status: "在线",
    cpu: 78,
    memory: 85,
    disk: 72,
  },
  {
    id: "node-04",
    name: "节点 4",
    ip: "192.168.1.104",
    role: "数据节点",
    status: "在线",
    cpu: 25,
    memory: 42,
    disk: 30,
  },
  {
    id: "node-05",
    name: "节点 5",
    ip: "192.168.1.105",
    role: "数据节点",
    status: "离线",
    cpu: 0,
    memory: 0,
    disk: 0,
  },
]

export default function ClusterNodesPage() {
  const [activeTab, setActiveTab] = useState("nodes")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const handleViewNode = (nodeId: string) => {
    setSelectedNode(nodeId)
    setActiveTab("details")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">节点管理</h1>
          <p className="text-muted-foreground">管理集群中的节点</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Server className="mr-2 h-4 w-4" />
            添加节点
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes">节点列表</TabsTrigger>
          <TabsTrigger value="details">节点详情</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索节点..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
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
              {nodes.map((node) => (
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
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            停止节点
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            启动节点
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          重启节点
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">移除节点</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedNode ? (
            <>
              {(() => {
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
                          <Button variant="outline" size="sm">
                            <Pause className="mr-2 h-4 w-4" />
                            停止节点
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            启动节点
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          重启节点
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
              })()}
            </>
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
    </div>
  )
}
