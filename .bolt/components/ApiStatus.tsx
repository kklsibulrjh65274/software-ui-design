import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ApiStatusProps {
  endpoint: string
  label?: string
}

type StatusType = 'online' | 'offline' | 'warning' | 'checking'

export function ApiStatus({ endpoint, label }: ApiStatusProps) {
  const [status, setStatus] = useState<StatusType>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('checking')
      
      try {
        const startTime = performance.now()
        const response = await fetch(endpoint, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        const endTime = performance.now()
        
        setLatency(Math.round(endTime - startTime))
        setLastChecked(new Date())
        
        if (response.ok) {
          setStatus('online')
        } else if (response.status >= 400 && response.status < 500) {
          setStatus('warning')
        } else {
          setStatus('offline')
        }
      } catch (error) {
        setStatus('offline')
        setLastChecked(new Date())
        console.error(`API status check failed for ${endpoint}:`, error)
      }
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 60000) // 每分钟检查一次
    
    return () => clearInterval(interval)
  }, [endpoint])
  
  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'checking':
        return <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'online':
        return '在线'
      case 'offline':
        return '离线'
      case 'warning':
        return '警告'
      case 'checking':
        return '检查中'
    }
  }
  
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'offline':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'warning':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      case 'checking':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    }
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            {label || getStatusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p>状态: {getStatusText()}</p>
            {latency !== null && <p>延迟: {latency}ms</p>}
            {lastChecked && <p>最后检查: {lastChecked.toLocaleTimeString()}</p>}
            <p className="text-xs text-muted-foreground mt-1">{endpoint}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}