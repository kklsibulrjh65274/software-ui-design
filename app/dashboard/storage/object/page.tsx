"use client"

import { useState } from "react"
import {
  Check,
  Download,
  FileText,
  Globe,
  Link,
  Lock,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Upload,
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

// 模拟数据 - 存储桶
const buckets = [
  {
    id: "bucket-1234567890abcdef0",
    name: "app-assets",
    region: "cn-east-1",
    access: "public",
    objectCount: 1245,
    size: 2.5,
    createdAt: new Date(2023, 5, 15),
  },
  {
    id: "bucket-1234567890abcdef1",
    name: "user-uploads",
    region: "cn-east-1",
    access: "private",
    objectCount: 8721,
    size: 15.8,
    createdAt: new Date(2023, 6, 20),
  },
  {
    id: "bucket-1234567890abcdef2",
    name: "system-backups",
    region: "cn-north-1",
    access: "private",
    objectCount: 342,
    size: 120.3,
    createdAt: new Date(2023, 7, 5),
  },
  {
    id: "bucket-1234567890abcdef3",
    name: "logs-archive",
    region: "cn-east-1",
    access: "private",
    objectCount: 12543,
    size: 45.2,
    createdAt: new Date(2023, 8, 10),
  },
  {
    id: "bucket-1234567890abcdef4",
    name: "public-content",
    region: "cn-north-1",
    access: "public",
    objectCount: 532,
    size: 8.7,
    createdAt: new Date(2023, 4, 1),
  },
]

// 模拟数据 - 对象
const objects = [
  {
    key: "images/logo.png",
    bucketName: "app-assets",
    size: 0.25,
    type: "image/png",
    lastModified: new Date(2023, 9, 1),
    access: "public",
  },
  {
    key: "documents/report-q3.pdf",
    bucketName: "user-uploads",
    size: 1.8,
    type: "application/pdf",
    lastModified: new Date(2023, 9, 2),
    access: "private",
  },
  {
    key: "backup/database-2023-09-30.sql",
    bucketName: "system-backups",
    size: 45.2,
    type: "application/sql",
    lastModified: new Date(2023, 8, 30),
    access: "private",
  },
  {
    key: "logs/app-logs-2023-09-25.log",
    bucketName: "logs-archive",
    size: 2.3,
    type: "text/plain",
    lastModified: new Date(2023, 8, 25),
    access: "private",
  },
  {
    key: "public/landing-page.html",
    bucketName: "public-content",
    size: 0.05,
    type: "text/html",
    lastModified: new Date(2023, 9, 3),
    access: "public",
  },
]

// 访问权限标签颜色映射
const accessColors = {
  public: "yellow",
  private: "green",
}

export default function ObjectStoragePage() {
  const [searchBucket, setSearchBucket] = useState("")
  const [searchObject, setSearchObject] = useState("")
  const [selectedBucketAccess, setSelectedBucketAccess] = useState("all")
  const [selectedBucket, setSelectedBucket] = useState("all")

  // 过滤存储桶
  const filteredBuckets = buckets.filter((bucket) => {
    const matchesSearch =
      bucket.name.toLowerCase().includes(searchBucket.toLowerCase()) ||
      bucket.id.toLowerCase().includes(searchBucket.toLowerCase())
    const matchesAccess =
      selectedBucketAccess === "all" || bucket.access.toLowerCase() === selectedBucketAccess.toLowerCase()
    return matchesSearch && matchesAccess
  })

  // 过滤对象
  const filteredObjects = objects.filter((object) => {
    const matchesSearch = object.key.toLowerCase().includes(searchObject.toLowerCase())
    const matchesBucket = selectedBucket === "all" || object.bucketName === selectedBucket
    return matchesSearch && matchesBucket
  })

  // 计算总存储容量和对象数量
  const totalSize = buckets.reduce((sum, bucket) => sum + bucket.size, 0)
  const totalObjects = buckets.reduce((sum, bucket) => sum + bucket.objectCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">对象存储管理</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            创建存储桶
          </Button>
        </div>
      </div>

      {/* 存储概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储桶数量</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buckets.length}</div>
            <p className="text-xs text-muted-foreground">
              {buckets.filter((b) => b.access === "public").length} 个公开,{" "}
              {buckets.filter((b) => b.access === "private").length} 个私有
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总存储容量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} GB</div>
            <p className="text-xs text-muted-foreground">{totalObjects} 个对象</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公开存储</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buckets
                .filter((b) => b.access === "public")
                .reduce((sum, b) => sum + b.size, 0)
                .toFixed(1)}{" "}
              GB
            </div>
            <p className="text-xs text-muted-foreground">
              {buckets.filter((b) => b.access === "public").reduce((sum, b) => sum + b.objectCount, 0)} 个对象
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">私有存储</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buckets
                .filter((b) => b.access === "private")
                .reduce((sum, b) => sum + b.size, 0)
                .toFixed(1)}{" "}
              GB
            </div>
            <p className="text-xs text-muted-foreground">
              {buckets.filter((b) => b.access === "private").reduce((sum, b) => sum + b.objectCount, 0)} 个对象
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容标签页 */}
      <Tabs defaultValue="buckets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buckets">存储桶管理</TabsTrigger>
          <TabsTrigger value="objects">对象管理</TabsTrigger>
          <TabsTrigger value="lifecycle">生命周期策略</TabsTrigger>
        </TabsList>

        {/* 存储桶管理标签内容 */}
        <TabsContent value="buckets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索存储桶..."
                value={searchBucket}
                onChange={(e) => setSearchBucket(e.target.value)}
                className="w-[250px]"
              />
              <Select value={selectedBucketAccess} onValueChange={setSelectedBucketAccess}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="访问权限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有权限</SelectItem>
                  <SelectItem value="public">公开</SelectItem>
                  <SelectItem value="private">私有</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建存储桶
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>创建新存储桶</DialogTitle>
                  <DialogDescription>配置新对象存储桶的详细信息。创建后，您可以上传对象到此存储桶。</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      名称
                    </Label>
                    <Input id="name" placeholder="存储桶名称" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="region" className="text-right">
                      区域
                    </Label>
                    <Select defaultValue="cn-east-1">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择区域" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cn-east-1">华东 1 (杭州)</SelectItem>
                        <SelectItem value="cn-north-1">华北 1 (北京)</SelectItem>
                        <SelectItem value="cn-south-1">华南 1 (广州)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="access" className="text-right">
                      访问权限
                    </Label>
                    <Select defaultValue="private">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="选择访问权限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">私有</SelectItem>
                        <SelectItem value="public">公开读取</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">创建存储桶</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>区域</TableHead>
                  <TableHead>访问权限</TableHead>
                  <TableHead>对象数量</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuckets.map((bucket) => (
                  <TableRow key={bucket.id}>
                    <TableCell className="font-medium">{bucket.name}</TableCell>
                    <TableCell>{bucket.region}</TableCell>
                    <TableCell>
                      <Badge variant={accessColors[bucket.access] as any}>{bucket.access}</Badge>
                    </TableCell>
                    <TableCell>{bucket.objectCount}</TableCell>
                    <TableCell>{bucket.size.toFixed(1)} GB</TableCell>
                    <TableCell>{format(bucket.createdAt, "yyyy-MM-dd")}</TableCell>
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
                            <Upload className="mr-2 h-4 w-4" />
                            <span>上传对象</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link className="mr-2 h-4 w-4" />
                            <span>生成访问链接</span>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 对象管理标签内容 */}
        <TabsContent value="objects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索对象..."
                value={searchObject}
                onChange={(e) => setSearchObject(e.target.value)}
                className="w-[250px]"
              />
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择存储桶" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有存储桶</SelectItem>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.name}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              上传对象
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>键</TableHead>
                  <TableHead>存储桶</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>访问权限</TableHead>
                  <TableHead>最后修改</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObjects.map((object) => (
                  <TableRow key={object.key}>
                    <TableCell className="font-medium">{object.key}</TableCell>
                    <TableCell>{object.bucketName}</TableCell>
                    <TableCell>{object.type}</TableCell>
                    <TableCell>{object.size.toFixed(2)} GB</TableCell>
                    <TableCell>
                      <Badge variant={accessColors[object.access] as any}>{object.access}</Badge>
                    </TableCell>
                    <TableCell>{format(object.lastModified, "yyyy-MM-dd")}</TableCell>
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
                            <Download className="mr-2 h-4 w-4" />
                            <span>下载</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link className="mr-2 h-4 w-4" />
                            <span>生成访问链接</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>属性</span>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 生命周期策略标签内容 */}
        <TabsContent value="lifecycle" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">生命周期策略</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建策略
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>自动归档策略</CardTitle>
                <CardDescription>30天后自动将对象转移到低频访问存储</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">应用存储桶:</span>
                    <span className="text-sm font-medium">logs-archive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">对象前缀:</span>
                    <span className="text-sm font-medium">logs/</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">转换天数:</span>
                    <span className="text-sm font-medium">30天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">目标存储类型:</span>
                    <span className="text-sm font-medium">低频访问</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">状态:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> 已启用
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  编辑
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>过期删除策略</CardTitle>
                <CardDescription>365天后自动删除临时对象</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">应用存储桶:</span>
                    <span className="text-sm font-medium">user-uploads</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">对象前缀:</span>
                    <span className="text-sm font-medium">temp/</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">过期天数:</span>
                    <span className="text-sm font-medium">365天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">操作:</span>
                    <span className="text-sm font-medium">删除</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">状态:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> 已启用
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  编辑
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
