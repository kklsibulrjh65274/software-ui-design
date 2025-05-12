"use client"

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'typescript', filename, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-md border">
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{filename}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2 text-xs">{copied ? '已复制' : '复制'}</span>
          </Button>
        </div>
      )}
      <div className="relative">
        {!filename && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 top-2 z-10"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
        <pre className={`overflow-x-auto p-4 text-sm ${showLineNumbers ? 'line-numbers' : ''}`}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}