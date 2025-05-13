"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Database, Table, Clock, VideoIcon as Vector, Map } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (pathname === "/dashboard/database") {
      setActiveTab("overview")
    } else if (pathname.includes("/relational")) {
      setActiveTab("relational")
    } else if (pathname.includes("/timeseries")) {
      setActiveTab("timeseries")
    } else if (pathname.includes("/vector")) {
      setActiveTab("vector")
    } else if (pathname.includes("/geospatial")) {
      setActiveTab("geospatial")
    }
  }, [pathname])

  return (
    <div className="space-y-6">
      <div className="flex overflow-auto pb-2">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            size="sm"
            className="flex items-center"
            asChild
          >
            <Link href="/dashboard/database">
              <Database className="mr-2 h-4 w-4" />
              总览
            </Link>
          </Button>
          <Button
            variant={activeTab === "relational" ? "default" : "outline"}
            size="sm"
            className="flex items-center"
            asChild
          >
            <Link href="/dashboard/database/relational">
              <Table className="mr-2 h-4 w-4" />
              关系型
            </Link>
          </Button>
          <Button
            variant={activeTab === "timeseries" ? "default" : "outline"}
            size="sm"
            className="flex items-center"
            asChild
          >
            <Link href="/dashboard/database/timeseries">
              <Clock className="mr-2 h-4 w-4" />
              时序型
            </Link>
          </Button>
          <Button
            variant={activeTab === "vector" ? "default" : "outline"}
            size="sm"
            className="flex items-center"
            asChild
          >
            <Link href="/dashboard/database/vector">
              <Vector className="mr-2 h-4 w-4" />
              向量型
            </Link>
          </Button>
          <Button
            variant={activeTab === "geospatial" ? "default" : "outline"}
            size="sm"
            className="flex items-center"
            asChild
          >
            <Link href="/dashboard/database/geospatial">
              <Map className="mr-2 h-4 w-4" />
              地理空间型
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}