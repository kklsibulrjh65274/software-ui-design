"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, Upload, Download, Trash2, FileText, FolderIcon, FileIcon } from "lucide-react"

import { files } from "@/mock/dashboard"

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
import { Progress } from "@/components/ui/progress"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function FileStoragePage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPath, setCurrentPath] = useState("/")

  const handleUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setIsUploadOpen(false)
          }, 1000)
          return 100
        }
        return next
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">文件存储</h1>
          <p className="text-muted-foreground">管理文件存储系统</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                上传文件
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>上传文件</DialogTitle>
                <DialogDescription>将文件上传到当前目录</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">选择文件</Label>
                  <Input id="file-upload" type="file" multiple />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">上传进度</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">正在上传文件，请勿关闭窗口...</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                  取消
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      开始上传
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FolderIcon className="mr-2 h-4 w-4" />
            新建文件夹
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">浏览文件</TabsTrigger>
          <TabsTrigger value="recent">最近文件</TabsTrigger>
          <TabsTrigger value="shared">共享文件</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索文件和文件夹..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">筛选</span>
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>文件浏览器</CardTitle>
                <Badge variant="outline" className="ml-2">
                  已使用: 45.8 GB / 100 GB
                </Badge>
              </div>
              <CardDescription>当前位置</CardDescription>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#" onClick={() => setCurrentPath("/")}>
                      根目录
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentPath !== "/" && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">当前目录</BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>名称</div>
                  <div>类型</div>
                  <div>大小</div>
                  <div>项目数</div>
                  <div>修改时间</div>
                  <div className="text-right">操作</div>
                </div>
                <div className="divide-y">
                  {files.map((file) => (
                    <div key={file.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                      <div className="font-medium flex items-center">
                        {file.type === "folder" ? (
                          <FolderIcon className="mr-2 h-4 w-4 text-blue-500" />
                        ) : (
                          <FileIcon className="mr-2 h-4 w-4 text-gray-500" />
                        )}
                        {file.name}
                      </div>
                      <div>
                        <Badge variant="outline">
                          {file.type === "folder" ? "文件夹" : file.name.split(".").pop()?.toUpperCase()}
                        </Badge>
                      </div>
                      <div>{file.size}</div>
                      <div>{file.items}</div>
                      <div>{file.modified}</div>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>文件操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {file.type === "folder" ? (
                              <DropdownMenuItem>打开文件夹</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>预览文件</DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              下载
                            </DropdownMenuItem>
                            <DropdownMenuItem>重命名</DropdownMenuItem>
                            <DropdownMenuItem>移动</DropdownMenuItem>
                            <DropdownMenuItem>共享</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">显示 {files.length} 个项目</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  上一页
                </Button>
                <Button variant="outline" size="sm">
                  下一页
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近文件</CardTitle>
              <CardDescription>最近访问或修改的文件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                  <div>名称</div>
                  <div>类型</div>
                  <div>大小</div>
                  <div>修改时间</div>
                  <div className="text-right">操作</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium flex items-center">
                      <FileIcon className="mr-2 h-4 w-4 text-gray-500" />
                      系统架构.pdf
                    </div>
                    <div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <div>2.4 MB</div>
                    <div>2023-05-10 09:12:33</div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">下载</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        打开
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium flex items-center">
                      <FileIcon className="mr-2 h-4 w-4 text-gray-500" />
                      用户手册.docx
                    </div>
                    <div>
                      <Badge variant="outline">DOCX</Badge>
                    </div>
                    <div>1.8 MB</div>
                    <div>2023-05-09 11:30:15</div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">下载</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        打开
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 items-center px-4 py-3 text-sm">
                    <div className="font-medium flex items-center">
                      <FileIcon className="mr-2 h-4 w-4 text-gray-500" />
                      数据库设计.xlsx
                    </div>
                    <div>
                      <Badge variant="outline">XLSX</Badge>
                    </div>
                    <div>3.2 MB</div>
                    <div>2023-05-08 15:45:20</div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">下载</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        打开
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>共享文件</CardTitle>
              <CardDescription>与您共享的文件和文件夹</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-60">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">暂无共享文件</h3>
                <p className="mt-1 text-sm text-muted-foreground">当前没有与您共享的文件或文件夹</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}