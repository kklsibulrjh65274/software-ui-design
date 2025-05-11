import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatusCardProps {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "success" | "warning" | "error" | "default"
}

export function StatusCard({ title, value, description, icon: Icon, status }: StatusCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            status === "success" && "text-green-500",
            status === "warning" && "text-amber-500",
            status === "error" && "text-red-500",
            status === "default" && "text-muted-foreground",
          )}
        />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            status === "success" && "text-green-600",
            status === "warning" && "text-amber-600",
            status === "error" && "text-red-600",
          )}
        >
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
