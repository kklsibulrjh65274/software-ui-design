"use client"

import { useState } from "react"
import { VideoIcon as Vector, Search, Filter, MoreHorizontal, Layers, Save } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const vectorCollections = [
  { id: "product-embeddings", name: "产品向量", dimensions: 1536, vectors: 125000, indexType: "HNSW" },
  { id: "document-embeddings", name: "文档向量", dimensions: 768, vectors: 85000, indexType: "HNSW" },
  { id: "image-embeddings", name: "图像向量", dimensions: 512, vectors: 250000, indexType: "IVF" },
  { id: "user-embeddings", name: "用户向量", dimensions: 384, vectors: 50000, indexType: "HNSW" },
]

export default function VectorDatabasePage() {
  const [activeTab, setActiveTab] = useState("collections")
  const [similarity, setSimilarity] = useState(0.75)
  const [searchQuery, setSearchQuery] = useState("一款高性能的笔记本电脑，适合开发和游戏")
  const [searchResults, setSearchResults] = useState<any>(null)

  const handleSearch = () => {
    // 模拟搜索结果
    setSearchResults({
      results: [
        {
          id: "prod-1234",
          name: "超能开发者笔记本 Pro",
          score: 0.92,
          description: "高性能开发者笔记本，搭载最新处理器和独立显卡，适合编程和游戏",
        },
        {
          id: "prod-2345",
          name: "游戏战神笔记本 X1",
          score: 0.87,
          description: "专业游戏笔记本，高刷新率屏幕，强劲散热系统，畅玩各类大型游戏",
        },
        {
          id: "prod-3456",
          name: "轻薄商务本 Air",
          score: 0.76,
          description: "轻薄商务笔记本，长续航，适合商务办公和轻度开发",
        },
        {
          id: "prod-4567",
          name: "全能创作者本 Creator",
          score: 0.72,
          description: "面向创意工作者的笔记本，色彩准确的屏幕，适合设计和开发",
        },
      ],
      executionTime: "0.045 秒",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">向量数据库管理</h1>
          <p className="text-muted-foreground">管理和查询向量数据库</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Vector className="mr-2 h-4 w-4" />
            创建向量集合
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="collections">向量集合</TabsTrigger>
          <TabsTrigger value="indexes">索引管理</TabsTrigger>
          <TabsTrigger value="search">向量搜索</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索向量集合..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>维度</div>
              <div>向量数量</div>
              <div>索引类型</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {vectorCollections.map((collection) => (
                <div key={collection.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                  <div className="font-medium">{collection.id}</div>
                  <div>{collection.name}</div>
                  <div>{collection.dimensions}</div>
                  <div>{collection.vectors.toLocaleString()}</div>
                  <div>
                    <Badge variant="outline">{collection.indexType}</Badge>
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
                        <DropdownMenuLabel>集合操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>查看详情</DropdownMenuItem>
                        <DropdownMenuItem>添加向量</DropdownMenuItem>
                        <DropdownMenuItem>重建索引</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">删除集合</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="indexes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>索引管理</CardTitle>
              <CardDescription>管理向量集合的索引</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">选择向量集合</option>
                  {vectorCollections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({collection.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">索引配置</h3>
                  <Badge>HNSW</Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>M 参数 (邻居数量)</Label>
                      <span className="text-sm font-medium">16</span>
                    </div>
                    <Slider defaultValue={[16]} min={4} max={64} step={4} />
                    <p className="text-xs text-muted-foreground">每个节点的最大连接数，影响查询精度和内存使用</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>ef_construction 参数</Label>
                      <span className="text-sm font-medium">128</span>
                    </div>
                    <Slider defaultValue={[128]} min={64} max={512} step={64} />
                    <p className="text-xs text-muted-foreground">
                      构建索引时的动态候选列表大小，影响索引质量和构建时间
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>ef_search 参数</Label>
                      <span className="text-sm font-medium">64</span>
                    </div>
                    <Slider defaultValue={[64]} min={16} max={256} step={16} />
                    <p className="text-xs text-muted-foreground">搜索时的动态候选列表大小，影响查询精度和速度</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline">重置为默认值</Button>
                  <Button>应用配置</Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline">
                  <Layers className="mr-2 h-4 w-4" />
                  重建索引
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  保存配置
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>向量搜索</CardTitle>
              <CardDescription>使用文本查询相似的向量</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="product-embeddings">产品向量 (product-embeddings)</option>
                  <option value="document-embeddings">文档向量 (document-embeddings)</option>
                  <option value="image-embeddings">图像向量 (image-embeddings)</option>
                  <option value="user-embeddings">用户向量 (user-embeddings)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-query">搜索查询</Label>
                <Textarea
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入搜索文本..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>相似度阈值</Label>
                  <span className="text-sm font-medium">{similarity.toFixed(2)}</span>
                </div>
                <Slider
                  value={[similarity]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => setSimilarity(value[0])}
                />
                <p className="text-xs text-muted-foreground">设置最小相似度阈值，只返回相似度高于此值的结果</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  搜索
                </Button>
              </div>

              {searchResults && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      搜索结果: <span className="font-medium">{searchResults.results.length} 个</span>
                    </div>
                    <div>
                      执行时间: <span className="font-medium">{searchResults.executionTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {searchResults.results.map((result: any) => (
                      <div key={result.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{result.name}</div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            相似度: {result.score.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                        <div className="text-xs text-muted-foreground mt-2">ID: {result.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
