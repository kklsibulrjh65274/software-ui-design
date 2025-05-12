"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Play, Download, Copy, Check } from 'lucide-react'

interface ApiExplorerProps {
  endpoints?: {
    name: string
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    description?: string
  }[]
}

export function ApiExplorer({ endpoints = [] }: ApiExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]?.url || '')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>(endpoints[0]?.method || 'GET')
  const [url, setUrl] = useState(endpoints[0]?.url || '')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [body, setBody] = useState('{\n\n}')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showHeaders, setShowHeaders] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleEndpointChange = (value: string) => {
    setSelectedEndpoint(value)
    const endpoint = endpoints.find(e => e.url === value)
    if (endpoint) {
      setUrl(endpoint.url)
      setMethod(endpoint.method)
    }
  }

  const handleSendRequest = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      const options: RequestInit = {
        method,
        headers: JSON.parse(headers),
      }
      
      if (method !== 'GET' && method !== 'HEAD') {
        options.body = body
      }
      
      const res = await fetch(url, options)
      const contentType = res.headers.get('content-type')
      
      let data
      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers.entries()]),
        data
      })
    } catch (error) {
      setResponse({
        error: true,
        message: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadResponse = () => {
    if (response) {
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `response-${new Date().toISOString()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API 测试工具</CardTitle>
        <CardDescription>测试和探索 API 接口</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="request">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request">请求</TabsTrigger>
            <TabsTrigger value="response">响应</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="space-y-4">
            <div className="grid gap-4 py-4">
              {endpoints.length > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endpoint" className="text-right">
                    接口
                  </Label>
                  <Select value={selectedEndpoint} onValueChange={handleEndpointChange}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择接口" />
                    </SelectTrigger>
                    <SelectContent>
                      {endpoints.map((endpoint) => (
                        <SelectItem key={endpoint.url} value={endpoint.url}>
                          {endpoint.name || endpoint.url}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  方法
                </Label>
                <Select value={method} onValueChange={(value) => setMethod(value as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择方法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-headers"
                  checked={showHeaders}
                  onCheckedChange={(checked) => setShowHeaders(checked as boolean)}
                />
                <label
                  htmlFor="show-headers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  显示请求头
                </label>
              </div>
              
              {showHeaders && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="headers" className="text-right">
                    请求头
                  </Label>
                  <Textarea
                    id="headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="col-span-3 font-mono"
                    rows={5}
                  />
                </div>
              )}
              
              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="body" className="text-right">
                    请求体
                  </Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="col-span-3 font-mono"
                    rows={10}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="response">
            <div className="space-y-4">
              {response ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 text-xs font-medium rounded-md ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-100 text-green-800'
                          : response.status >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {response.status} {response.statusText}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopyResponse}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{copied ? '已复制' : '复制'}</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadResponse}>
                        <Download className="h-4 w-4" />
                        <span className="ml-2">下载</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    value={JSON.stringify(response, null, 2)}
                    readOnly
                    className="font-mono h-[400px] overflow-auto"
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] border rounded-md border-dashed">
                  <p className="text-muted-foreground">发送请求后查看响应</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSendRequest} disabled={loading}>
          {loading ? (
            <>
              <Play className="mr-2 h-4 w-4 animate-spin" />
              发送中...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              发送请求
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}