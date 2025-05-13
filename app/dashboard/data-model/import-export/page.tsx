"use client"

import { useState, useEffect } from "react"
import { Upload, Download, CheckCircle, XCircle, Clock, FileText, Database, Filter, Search, Trash2, AlertTriangle, Eye, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

// 导入 API
import { dataModelApi, databaseApi } from "@/api"

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState("import")
  const [importProgress, setImportProgress] = useState(0)
  const [exportProgress, setExportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [databases, setDatabases] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState({
    tasks: true,
    databases: true,
    tables: false
  })
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  
  // 导入表单数据
  const [importFormData, setImportFormData] = useState({
    name: "",
    database: "",
    table: "",
    format: "csv",
    file: null as File | null,
    hasHeader: true,
    truncateTable: false,
    ignoreErrors: false
  })
  
  // 导出表单数据
  const [exportFormData, setExportFormData] = useState({
    name: "",
    database: "",
    source: "table", // table 或 query
    table: "",
    query: "",
    format: "csv",
    filename: "export.csv",
    includeHeader: true,
    compress: false
  })

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(prev => ({ ...prev, tasks: true }))
        const response = await dataModelApi.getImportExportTasks()
        if (response.success) {
          setTasks(response.data)
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取任务数据失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, tasks: false }))
      }
    }

    fetchTasks()
  }, [])
  
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(prev => ({ ...prev, databases: true }))
        const response = await databaseApi.getDatabases()
        if (response.success) {
          setDatabases(response.data)
          if (response.data.length > 0) {
            const firstDb = response.data[0].id
            setImportFormData(prev => ({ ...prev, database: firstDb }))
            setExportFormData(prev => ({ ...prev, database: firstDb }))
            fetchTables(firstDb)
          }
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError('获取数据库列表失败')
        console.error(err)
      } finally {
        setLoading(prev => ({ ...prev, databases: false }))
      }
    }

    fetchDatabases()
  }, [])
  
  const fetchTables = async (databaseId: string) => {
    if (!databaseId) return
    
    try {
      setLoading(prev => ({ ...prev, tables: true }))
      const response = await databaseApi.getTables({ database: databaseId })
      if (response.success) {
        const filteredTables = response.data.filter((table: any) => table.database === databaseId)
        setTables(filteredTables)
        if (filteredTables.length > 0) {
          setImportFormData(prev => ({ ...prev, table: filteredTables[0].name }))
          setExportFormData(prev => ({ ...prev, table: filteredTables[0].name }))
        } else {
          setImportFormData(prev => ({ ...prev, table: "" }))
          setExportFormData(prev => ({ ...prev, table: "" }))
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('获取表列表失败')
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, tables: false }))
    }
  }

  const handleDatabaseChange = (databaseId: string) => {
    setImportFormData(prev => ({ ...prev, database: databaseId, table: "" }))
    setExportFormData(prev => ({ ...prev, database: databaseId, table: "" }))
    fetchTables(databaseId)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImportFormData(prev => ({ 
      ...prev, 
      file,
      name: file ? `导入 ${file.name}` : prev.name
    }))
  }

  const handleStartImport = async () => {
    if (!importFormData.database || !importFormData.table || !importFormData.file) {
      setError('请选择数据库、表和文件')
      return
    }

    try {
      setIsImporting(true)
      setImportProgress(0)
      setError(null)
      
      // 模拟导入进度
      const interval = setInterval(() => {
        setImportProgress((prev) => {
          const next = prev + 5
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsImporting(false)
              // 创建导入任务
              createImportTask()
            }, 1000)
            return 100
          }
          return next
        })
      }, 500)
    } catch (err) {
      setError('启动导入失败')
      console.error(err)
      setIsImporting(false)
    }
  }
  
  const createImportTask = async () => {
    try {
      const response = await dataModelApi.importData(importFormData.database, importFormData.table, {
        name: importFormData.name || `导入 ${importFormData.file?.name || "数据"}`,
        file: importFormData.file,
        hasHeader: importFormData.hasHeader,
        truncateTable: importFormData.truncateTable,
        ignoreErrors: importFormData.ignoreErrors
      })
      
      if (response.success) {
        // 添加新任务到列表
        setTasks(prev => [response.data, ...prev])
        // 重置表单
        setImportFormData({
          name: "",
          database: importFormData.database,
          table: importFormData.table,
          format: "csv",
          file: null,
          hasHeader: true,
          truncateTable: false,
          ignoreErrors: false
        })
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建导入任务失败')
      console.error(err)
    }
  }

  const handleStartExport = async () => {
    if (!exportFormData.database || 
        (exportFormData.source === "table" && !exportFormData.table) || 
        (exportFormData.source === "query" && !exportFormData.query)) {
      setError('请填写所有必要信息')
      return
    }

    try {
      setIsExporting(true)
      setExportProgress(0)
      setError(null)
      
      // 模拟导出进度
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          const next = prev + 5
          if (next >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsExporting(false)
              // 创建导出任务
              createExportTask()
            }, 1000)
            return 100
          }
          return next
        })
      }, 500)
    } catch (err) {
      setError('启动导出失败')
      console.error(err)
      setIsExporting(false)
    }
  }
  
  const createExportTask = async () => {
    try {
      const response = await dataModelApi.exportData(exportFormData.database, {
        name: exportFormData.name || `导出 ${exportFormData.source === "table" ? exportFormData.table : "查询结果"}`,
        source: exportFormData.source === "table" ? exportFormData.table : "query",
        query: exportFormData.query,
        filename: exportFormData.filename,
        format: exportFormData.format,
        includeHeader: exportFormData.includeHeader,
        compress: exportFormData.compress
      })
      
      if (response.success) {
        // 添加新任务到列表
        setTasks(prev => [response.data, ...prev])
        // 重置部分表单
        setExportFormData(prev => ({
          ...prev,
          name: "",
          query: "",
          filename: `export.${prev.format}`
        }))
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('创建导出任务失败')
      console.error(err)
    }
  }
  
  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    
    try {
      setLoading(prev => ({ ...prev, tasks: true }))
      // 模拟删除任务
      setTimeout(() => {
        setTasks(prev => prev.filter(task => task.id !== taskToDelete))
        setIsConfirmDeleteOpen(false)
        setTaskToDelete(null)
        setLoading(prev => ({ ...prev, tasks: false }))
      }, 500)
    } catch (err) {
      setError('删除任务失败')
      console.error(err)
      setLoading(prev => ({ ...prev, tasks: false }))
    }
  }
  
  const handleViewTaskDetails = (task: any) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  // 更新导出文件名后缀
  useEffect(() => {
    if (exportFormData.format && !exportFormData.filename.endsWith(`.${exportFormData.format}`)) {
      const baseName = exportFormData.filename.split('.')[0] || 'export'
      setExportFormData(prev => ({
        ...prev,
        filename: `${baseName}.${exportFormData.format}`
      }))
    }
  }, [exportFormData.format])
  
  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.target.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'import' && task.id.startsWith('import')) ||
      (typeFilter === 'export' && task.id.startsWith('export'))
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  // 分离导入和导出任务
  const importTasks = tasks.filter(task => task.id.startsWith('import'))
  const exportTasks = tasks.filter(task => task.id.startsWith('export'))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据导入导出</h1>
          <p className="text-muted-foreground">导入和导出数据库数据</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              setLoading(prev => ({ ...prev, tasks: true }))
              const response = await dataModelApi.getImportExportTasks()
              if (response.success) {
                setTasks(response.data)
              } else {
                setError(response.message)
              }
            } catch (err) {
              setError('刷新任务列表失败')
              console.error(err)
            } finally {
              setLoading(prev => ({ ...prev, tasks: false }))
            }
          }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新任务
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
          <TabsTrigger value="import">数据导入</TabsTrigger>
          <TabsTrigger value="export">数据导出</TabsTrigger>
          <TabsTrigger value="tasks">任务状态</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导入数据</CardTitle>
              <CardDescription>将外部数据导入到数据库中</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="import-name">任务名称</Label>
                  <Input 
                    id="import-name" 
                    placeholder="输入导入任务名称" 
                    value={importFormData.name}
                    onChange={(e) => setImportFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-database">目标数据库</Label>
                  <Select 
                    value={importFormData.database} 
                    onValueChange={handleDatabaseChange}
                    disabled={loading.databases}
                  >
                    <SelectTrigger id="import-database">
                      <SelectValue placeholder={loading.databases ? "加载中..." : "选择数据库"} />
                    </SelectTrigger>
                    <SelectContent>
                      {databases.map(db => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name} ({db.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="import-table">目标表</Label>
                  <Select 
                    value={importFormData.table} 
                    onValueChange={(value) => setImportFormData(prev => ({ ...prev, table: value }))}
                    disabled={loading.tables || !importFormData.database || tables.length === 0}
                  >
                    <SelectTrigger id="import-table">
                      <SelectValue placeholder={
                        loading.tables 
                          ? "加载中..." 
                          : !importFormData.database 
                            ? "请先选择数据库" 
                            : tables.length === 0 
                              ? "无可用表" 
                              : "选择表"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map(table => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="import-format">文件格式</Label>
                  <Select 
                    value={importFormData.format}
                    onValueChange={(value) => setImportFormData(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger id="import-format">
                      <SelectValue placeholder="选择格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-file">选择文件</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="import-file" 
                    type="file" 
                    className="flex-1" 
                    onChange={handleFileChange}
                    accept={
                      importFormData.format === "csv" ? ".csv" :
                      importFormData.format === "json" ? ".json" :
                      importFormData.format === "excel" ? ".xlsx,.xls" :
                      importFormData.format === "sql" ? ".sql" : 
                      undefined
                    }
                  />
                </div>
                {importFormData.file && (
                  <p className="text-xs text-muted-foreground">
                    已选择: {importFormData.file.name} ({(importFormData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>导入选项</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-header" 
                      checked={importFormData.hasHeader}
                      onCheckedChange={(checked) => 
                        setImportFormData(prev => ({ ...prev, hasHeader: checked === true }))
                      }
                    />
                    <label
                      htmlFor="import-header"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      文件包含标题行
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-truncate" 
                      checked={importFormData.truncateTable}
                      onCheckedChange={(checked) => 
                        setImportFormData(prev => ({ ...prev, truncateTable: checked === true }))
                      }
                    />
                    <label
                      htmlFor="import-truncate"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      导入前清空表
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="import-ignore-errors" 
                      checked={importFormData.ignoreErrors}
                      onCheckedChange={(checked) => 
                        setImportFormData(prev => ({ ...prev, ignoreErrors: checked === true }))
                      }
                    />
                    <label
                      htmlFor="import-ignore-errors"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      忽略错误并继续
                    </label>
                  </div>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">导入进度</span>
                    <span className="text-sm">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">正在导入数据，请勿关闭页面...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                disabled={isImporting}
                onClick={() => {
                  setImportFormData({
                    name: "",
                    database: importFormData.database,
                    table: importFormData.table,
                    format: "csv",
                    file: null,
                    hasHeader: true,
                    truncateTable: false,
                    ignoreErrors: false
                  })
                }}
              >
                重置
              </Button>
              <Button 
                onClick={handleStartImport} 
                disabled={isImporting || !importFormData.database || !importFormData.table || !importFormData.file}
              >
                {isImporting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    开始导入
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>导出数据</CardTitle>
              <CardDescription>将数据库数据导出到文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="export-name">任务名称</Label>
                  <Input 
                    id="export-name" 
                    placeholder="输入导出任务名称" 
                    value={exportFormData.name}
                    onChange={(e) => setExportFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-database">源数据库</Label>
                  <Select 
                    value={exportFormData.database} 
                    onValueChange={handleDatabaseChange}
                    disabled={loading.databases}
                  >
                    <SelectTrigger id="export-database">
                      <SelectValue placeholder={loading.databases ? "加载中..." : "选择数据库"} />
                    </SelectTrigger>
                    <SelectContent>
                      {databases.map(db => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.name} ({db.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-source">数据源</Label>
                <Select 
                  value={exportFormData.source}
                  onValueChange={(value) => setExportFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger id="export-source">
                    <SelectValue placeholder="选择数据源" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">表</SelectItem>
                    <SelectItem value="query">SQL 查询</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {exportFormData.source === "table" ? (
                <div className="space-y-2">
                  <Label htmlFor="export-table">选择表</Label>
                  <Select 
                    value={exportFormData.table} 
                    onValueChange={(value) => setExportFormData(prev => ({ ...prev, table: value }))}
                    disabled={loading.tables || !exportFormData.database || tables.length === 0}
                  >
                    <SelectTrigger id="export-table">
                      <SelectValue placeholder={
                        loading.tables 
                          ? "加载中..." 
                          : !exportFormData.database 
                            ? "请先选择数据库" 
                            : tables.length === 0 
                              ? "无可用表" 
                              : "选择表"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map(table => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="export-query">SQL 查询</Label>
                  <Textarea 
                    id="export-query" 
                    placeholder="输入 SQL 查询语句" 
                    value={exportFormData.query}
                    onChange={(e) => setExportFormData(prev => ({ ...prev, query: e.target.value }))}
                    className="min-h-[100px] font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    输入 SQL 查询语句，查询结果将被导出。例如：SELECT * FROM users LIMIT 1000
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="export-format">文件格式</Label>
                  <Select 
                    value={exportFormData.format}
                    onValueChange={(value) => setExportFormData(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="选择格式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-filename">文件名</Label>
                  <Input 
                    id="export-filename" 
                    placeholder="输入导出文件名" 
                    value={exportFormData.filename}
                    onChange={(e) => setExportFormData(prev => ({ ...prev, filename: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>导出选项</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="export-header" 
                      checked={exportFormData.includeHeader}
                      onCheckedChange={(checked) => 
                        setExportFormData(prev => ({ ...prev, includeHeader: checked === true }))
                      }
                    />
                    <label
                      htmlFor="export-header"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      包含标题行
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="export-compress" 
                      checked={exportFormData.compress}
                      onCheckedChange={(checked) => 
                        setExportFormData(prev => ({ ...prev, compress: checked === true }))
                      }
                    />
                    <label
                      htmlFor="export-compress"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      压缩文件
                    </label>
                  </div>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">导出进度</span>
                    <span className="text-sm">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">正在导出数据，请勿关闭页面...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                disabled={isExporting}
                onClick={() => {
                  setExportFormData(prev => ({
                    ...prev,
                    name: "",
                    source: "table",
                    query: "",
                    filename: `export.${prev.format}`,
                    includeHeader: true,
                    compress: false
                  }))
                }}
              >
                重置
              </Button>
              <Button 
                onClick={handleStartExport} 
                disabled={
                  isExporting || 
                  !exportFormData.database || 
                  (exportFormData.source === "table" && !exportFormData.table) || 
                  (exportFormData.source === "query" && !exportFormData.query)
                }
              >
                {isExporting ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    导出中...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    开始导出
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="搜索任务..." 
                className="pl-8" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="import">导入任务</SelectItem>
                  <SelectItem value="export">导出任务</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="完成">已完成</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="失败">失败</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
                setStatusFilter("all")
              }}>
                <Filter className="h-4 w-4" />
                <span className="sr-only">重置筛选</span>
              </Button>
            </div>
          </div>

          {loading.tasks ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">暂无任务数据</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tasks.length === 0 
                    ? "尚未创建任何导入或导出任务" 
                    : "没有符合筛选条件的任务"}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setActiveTab("import")}>
                    <Upload className="mr-2 h-4 w-4" />
                    创建导入任务
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("export")}>
                    <Download className="mr-2 h-4 w-4" />
                    创建导出任务
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>源/目标</TableHead>
                    <TableHead>数据库</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {task.id.startsWith('import') ? '导入' : '导出'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.id.startsWith('import') ? task.source : task.target}
                      </TableCell>
                      <TableCell>{task.database}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.status === "完成" ? "success" : task.status === "进行中" ? "default" : "destructive"
                          }
                        >
                          {task.status === "完成" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {task.status === "进行中" && <Clock className="mr-1 h-3 w-3" />}
                          {task.status === "失败" && <XCircle className="mr-1 h-3 w-3" />}
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="h-2 flex-1" />
                          <span className="text-xs">{task.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.created}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>任务操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewTaskDetails(task)}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            {task.status === "完成" && task.id.startsWith('export') && (
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                下载文件
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setTaskToDelete(task.id)
                                setIsConfirmDeleteOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除任务
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 任务详情对话框 */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
            <DialogDescription>
              查看导入/导出任务的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">任务ID</Label>
                  <div className="font-mono text-sm">{selectedTask.id}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">任务类型</Label>
                  <div>
                    <Badge variant="outline">
                      {selectedTask.id.startsWith('import') ? '导入任务' : '导出任务'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">任务名称</Label>
                  <div>{selectedTask.name}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">创建时间</Label>
                  <div>{selectedTask.created}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">数据库</Label>
                  <div>{selectedTask.database}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">状态</Label>
                  <div>
                    <Badge
                      variant={
                        selectedTask.status === "完成" ? "success" : selectedTask.status === "进行中" ? "default" : "destructive"
                      }
                    >
                      {selectedTask.status === "完成" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {selectedTask.status === "进行中" && <Clock className="mr-1 h-3 w-3" />}
                      {selectedTask.status === "失败" && <XCircle className="mr-1 h-3 w-3" />}
                      {selectedTask.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {selectedTask.id.startsWith('import') ? '源文件' : '源表/查询'}
                </Label>
                <div className="font-mono text-sm bg-muted p-2 rounded-md">
                  {selectedTask.source}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {selectedTask.id.startsWith('import') ? '目标表' : '目标文件'}
                </Label>
                <div className="font-mono text-sm bg-muted p-2 rounded-md">
                  {selectedTask.target}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">进度</Label>
                  <span className="text-sm">{selectedTask.progress}%</span>
                </div>
                <Progress value={selectedTask.progress} className="h-2" />
              </div>

              {selectedTask.rows > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">处理行数</Label>
                  <div>{selectedTask.rows.toLocaleString()} 行</div>
                </div>
              )}

              {selectedTask.status === "失败" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>任务失败</AlertTitle>
                  <AlertDescription>
                    任务执行过程中发生错误。请检查数据格式和权限设置，然后重试。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailsOpen(false)}>
              关闭
            </Button>
            {selectedTask && selectedTask.status === "完成" && selectedTask.id.startsWith('export') && (
              <Button>
                <Download className="mr-2 h-4 w-4" />
                下载文件
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认删除对话框 */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除任务</DialogTitle>
            <DialogDescription>
              您确定要删除此任务吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>警告</AlertTitle>
              <AlertDescription>
                删除任务将从列表中移除此任务记录，但不会影响已导入或导出的数据。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}