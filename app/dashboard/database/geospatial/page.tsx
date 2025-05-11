"use client"

import { useState } from "react"
import { Map, Search, Filter, MoreHorizontal, Play, Layers } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const geospatialDatabases = [
  { id: "geo-analytics", name: "地理分析库", tables: 12, size: "320 GB", status: "正常" },
  { id: "geo-locations", name: "位置数据库", tables: 8, size: "180 GB", status: "正常" },
  { id: "geo-boundaries", name: "边界数据库", tables: 5, size: "420 GB", status: "警告" },
]

export default function GeospatialDatabasePage() {
  const [activeTab, setActiveTab] = useState("databases")
  const [geoQuery, setGeoQuery] = useState(
    "SELECT name, ST_AsText(geom) FROM cities WHERE ST_DWithin(geom, ST_MakePoint(116.4, 39.9), 50000);",
  )
  const [queryResult, setQueryResult] = useState<any>(null)

  const handleExecuteQuery = () => {
    // 模拟查询结果
    setQueryResult({
      columns: ["name", "type", "coordinates"],
      rows: [
        { name: "北京市", type: "POINT", coordinates: "116.4074, 39.9042" },
        { name: "昌平区", type: "POINT", coordinates: "116.2312, 40.2207" },
        { name: "海淀区", type: "POINT", coordinates: "116.2980, 39.9592" },
        { name: "朝阳区", type: "POINT", coordinates: "116.4845, 39.9484" },
        { name: "丰台区", type: "POINT", coordinates: "116.2871, 39.8585" },
      ],
      executionTime: "0.042 秒",
      rowCount: 5,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">地理空间数据库管理</h1>
          <p className="text-muted-foreground">管理和查询地理空间数据</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Map className="mr-2 h-4 w-4" />
            创建地理空间数据库
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="databases">数据库列表</TabsTrigger>
          <TabsTrigger value="tables">空间表</TabsTrigger>
          <TabsTrigger value="query">空间查询</TabsTrigger>
          <TabsTrigger value="visualization">地图可视化</TabsTrigger>
        </TabsList>

        <TabsContent value="databases" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索地理空间数据库..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>ID</div>
              <div>名称</div>
              <div>表数量</div>
              <div>大小</div>
              <div className="text-right">操作</div>
            </div>
            <div className="divide-y">
              {geospatialDatabases.map((db) => (
                <div key={db.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                  <div className="font-medium">{db.id}</div>
                  <div>{db.name}</div>
                  <div>{db.tables}</div>
                  <div>{db.size}</div>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>数据库操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>查看表</DropdownMenuItem>
                        <DropdownMenuItem>备份</DropdownMenuItem>
                        <DropdownMenuItem>复制</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">删除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="搜索空间表..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">筛选</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="geo-analytics">
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="选择数据库" />
                </SelectTrigger>
                <SelectContent>
                  {geospatialDatabases.map((db) => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} ({db.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>
                <Layers className="mr-2 h-4 w-4" />
                创建空间表
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>空间表列表</CardTitle>
              <CardDescription>地理分析库 (geo-analytics) 中的空间表</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>表名</div>
                  <div>几何类型</div>
                  <div>空间参考</div>
                  <div>记录数</div>
                  <div>索引</div>
                  <div className="text-right">操作</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">cities</div>
                    <div>POINT</div>
                    <div>EPSG:4326</div>
                    <div>1,245</div>
                    <div>
                      <Badge variant="outline">GIST</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">roads</div>
                    <div>LINESTRING</div>
                    <div>EPSG:4326</div>
                    <div>3,782</div>
                    <div>
                      <Badge variant="outline">GIST</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">districts</div>
                    <div>POLYGON</div>
                    <div>EPSG:4326</div>
                    <div>142</div>
                    <div>
                      <Badge variant="outline">GIST</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">poi</div>
                    <div>POINT</div>
                    <div>EPSG:4326</div>
                    <div>8,954</div>
                    <div>
                      <Badge variant="outline">GIST</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                    <div className="font-medium">rivers</div>
                    <div>LINESTRING</div>
                    <div>EPSG:4326</div>
                    <div>567</div>
                    <div>
                      <Badge variant="outline">GIST</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>空间查询工具</CardTitle>
              <CardDescription>执行空间 SQL 查询</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select defaultValue="geo-analytics">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择数据库" />
                  </SelectTrigger>
                  <SelectContent>
                    {geospatialDatabases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name} ({db.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geo-query">查询语句</Label>
                <Textarea
                  id="geo-query"
                  value={geoQuery}
                  onChange={(e) => setGeoQuery(e.target.value)}
                  className="font-mono min-h-[120px]"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleExecuteQuery}>
                  <Play className="mr-2 h-4 w-4" />
                  执行查询
                </Button>
              </div>

              {queryResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      查询结果: <span className="font-medium">{queryResult.rowCount} 行</span>
                    </div>
                    <div>
                      执行时间: <span className="font-medium">{queryResult.executionTime}</span>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                      {queryResult.columns.map((column: string) => (
                        <div key={column}>{column}</div>
                      ))}
                    </div>
                    <div className="divide-y">
                      {queryResult.rows.map((row: any, index: number) => (
                        <div key={index} className="grid grid-cols-3 items-center px-4 py-3 text-sm">
                          <div className="font-medium">{row.name}</div>
                          <div>{row.type}</div>
                          <div>{row.coordinates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>地图可视化</CardTitle>
              <CardDescription>在地图上可视化空间数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Select defaultValue="geo-analytics">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择数据库" />
                  </SelectTrigger>
                  <SelectContent>
                    {geospatialDatabases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name} ({db.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue="cities">
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="选择表" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cities">城市 (cities)</SelectItem>
                    <SelectItem value="roads">道路 (roads)</SelectItem>
                    <SelectItem value="districts">行政区 (districts)</SelectItem>
                    <SelectItem value="poi">兴趣点 (poi)</SelectItem>
                    <SelectItem value="rivers">河流 (rivers)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">加载数据</Button>
              </div>

              <div className="border rounded-md h-[500px] flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <Map className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">地图可视化</h3>
                  <p className="mt-1 text-sm text-muted-foreground">选择数据库和表，然后点击"加载数据"按钮</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
