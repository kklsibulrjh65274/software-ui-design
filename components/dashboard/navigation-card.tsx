import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NavigationCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export function NavigationCard({ title, description, icon: Icon, href }: NavigationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-[40px]">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full justify-between">
          <Link href={href}>
            <span>进入管理</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
