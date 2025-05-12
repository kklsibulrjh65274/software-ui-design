"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Battery,
  Clock,
  Download,
  HardDrive,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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

// 导入 API 和常量
import { storageApi } from "@/api"
import { statusColors } from "@/mock/dashboard/constants"
import { Volume, Snapshot } from "@/mock/dashboard/types"

export default function BlockStoragePage() {
  const [searchVolume, setSearchVolume] = useState("")
  const [searchSnapshot, setSearchSnapshot] = useState("")
  const [selectedVolumeType, setSelectedVolumeType] = useState("all")
  const [selectedSnapshotStatus, setSelectedSnapshotStatus] = useState("all")
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState({
    volumes: true,
    snapshots: true
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取卷数据
        setLoading(prev => ({ ...prev, volumes: true }))
        const volumesResponse = await storageApi.getVolumes()
        if (volumesResponse.success) {
          setVolumes(volumesResponse.data)
        } else {
          setError(volumesResponse.message)
        }
        
        // 获取快照数据
        setLoading(prev => ({ ...prev, snapshots: true }))
        const snapshotsResponse = await storageApi.getSnapshots()
        if (snapshotsResponse.success) {
          setSnapshots(snapshotsResponse.data)
        } else {
          setError(snapshotsResponse.message)
        }
      } catch (err) {
        setError('获取存储数据失败')
        console.error(err)
      } finally {
        setLoading({
          volumes: false,
          snapshots: false
        })
      }
    }

    fetchData()
  }, [])

  // 过滤卷
  const filteredVolumes = volumes.filter((volume) => {
    const matchesSearch =
      volume.name.toLowerCase().includes(searchVolume.toLowerCase()) ||
      volume.id.toLowerCase().includes(searchVolume.toLowerCase())
    const matchesType = selectedVolumeType === "all" || volume.type.toLowerCase() === selectedVolumeType.toLowerCase()
    return matchesSearch && matchesType
  })

  // 过滤快照
  const filteredSnapshots = snapshots.filter((snapshot) => {
    const matchesSearch =
      snapshot.volumeName.toLowerCase().includes(searchSnapshot.toLowerCase()) ||
      snapshot.id.toLowerCase().includes(searchSnapshot.toLowerCase())
    const matchesStatus =
      selectedSnapshotStatus === "all" || snapshot.status.toLowerCase() === selectedSnapshotStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // 计算总存储容量和使用量
  const totalCapacity = volumes.reduce((sum, volume) => sum + volume.size, 0)
  const usedCapacity = volumes.reduce((sum, volume) => sum + volume.usedSpace, 0)
  const usagePercentage = Math.round((usedCapacity / totalCapacity) * 100) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">块存储管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            创建卷
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

      {/* 存储概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总存储容量</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity} GB</div>
            <p className="text-xs text-muted-foreground">{volumes.length} 个卷</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已使用容量</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedCapacity} GB</div>
            <div className="mt-2">
              <Progress value={usagePercentage} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{usagePercentage}% 已使用</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SSD 卷</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volumes.filter((v) => v.type === "SSD").length}</div>
            <p className="text-xs text-muted-foreground">
              {volumes.filter((v) => v.type === "SSD").reduce((sum, v) => sum + v.size, 0)} GB 总容量
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">快照总数</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snapshots.length}</div>
            <p className="text-xs text-muted-foreground">{snapshots.reduce((sum, s) => sum + s.size, 0)} GB 总大小</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容标签页 */}
      <Tabs defaultValue="volumes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="volumes">卷管理</TabsTrigger>
          <TabsTrigger value="snapshots">快照管理</TabsTrigger>
          <TabsTrigger value="performance">性能监控</TabsTrigger>
        </TabsList>

        {/* 卷管理标签内容 */}
        <TabsContent value="volumes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索卷..."
                value={searchVolume}
                onChange={(e) => setSearchVolume(e.target.value)}
                className="w-[250px]"
              />
              <Select value={selectedVolumeType} onValueChange={setSelectedVolumeType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="卷类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="SSD">SSD</SelectItem>
                  <SelectItem value="HDD">HDD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建卷
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>创建新卷</DialogTitle>
                  <DialogDescription>配置新块存储卷的详细信息。创建后，可以将卷挂载到节点上。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      名称
                    </Label>
                    <Input id="name" placeholder="卷名称" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">
                      大小 (GB)
                    </Label>
                    <Input id="size" type="number" min="1" defaultValue="100" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      类型
                    </Label>
                    <Select defaultValue="SSD">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择卷类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SSD">SSD</SelectItem>
                        <SelectItem value="HDD">HDD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="iops" className="text-right">
                      IOPS
                    </Label>
                    <Select defaultValue="3000">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择IOPS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3000">3000 (SSD默认)</SelectItem>
                        <SelectItem value="5000">5000 (高性能)</SelectItem>
                        <SelectItem value="500">500 (HDD默认)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">创建卷</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>挂载节点</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.volumes ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredVolumes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      暂无卷数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVolumes.map((volume) => (
                    <TableRow key={volume.id}>
                      <TableCell className="font-medium">{volume.name}</TableCell>
                      <TableCell className="font-mono text-xs">{volume.id}</TableCell>
                      <TableCell>{volume.size} GB</TableCell>
                      <TableCell>{volume.type}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[volume.status] as any}>{volume.status}</Badge>
                      </TableCell>
                      <TableCell>{volume.attachedTo || "-"}</TableCell>
                      <TableCell>{format(volume.createdAt, "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">打开菜单</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>详情</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Server className="mr-2 h-4 w-4" />
                              <span>{volume.status === "attached" ? "卸载" : "挂载"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="mr-2 h-4 w-4" />
                              <span>创建快照</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>删除</span>
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

        {/* 快照管理标签内容 */}
        <TabsContent value="snapshots" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索快照..."
                value={searchSnapshot}
                onChange={(e) => setSearchSnapshot(e.target.value)}
                className="w-[250px]"
              />
              <Select value={selectedSnapshotStatus} onValueChange={setSelectedSnapshotStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="快照状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建快照
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>卷名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.snapshots ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredSnapshots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      暂无快照数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSnapshots.map((snapshot) => (
                    <TableRow key={snapshot.id}>
                      <TableCell className="font-mono text-xs">{snapshot.id}</TableCell>
                      <TableCell>{snapshot.volumeName}</TableCell>
                      <TableCell>{snapshot.description}</TableCell>
                      <TableCell>{snapshot.size} GB</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[snapshot.status] as any}>{snapshot.status}</Badge>
                      </TableCell>
                      <TableCell>{format(snapshot.createdAt, "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">打开菜单</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>详情</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <HardDrive className="mr-2 h-4 w-4" />
                              <span>从快照创建卷</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              <span>导出</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>删除</span>
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

        {/* 性能监控标签内容 */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>IOPS 性能</CardTitle>
                <CardDescription>每个卷的每秒输入/输出操作数</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">IOPS 性能图表</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>吞吐量</CardTitle>
                <CardDescription>每个卷的数据传输速率</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">吞吐量性能图表</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>延迟</CardTitle>
                <CardDescription>每个卷的操作延迟</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">延迟性能图表</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>容量使用趋势</CardTitle>
                <CardDescription>卷容量使用随时间的变化</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">容量使用趋势图表</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}