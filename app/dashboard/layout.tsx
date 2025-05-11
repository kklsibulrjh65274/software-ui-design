"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  Database,
  HardDrive,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  VideoIcon as Vector,
  Map,
  Server,
  Layers,
  Table,
  Upload,
  Users,
  Shield,
  BarChart,
  Save,
  FolderTree,
  Package,
  HardDriveIcon as HardDisk,
  FileText,
  Bell,
  Key,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  // 完全重写侧边栏导航的实现，修复点击问题
  // 1. 在 DashboardLayout 组件中添加状态来跟踪展开的菜单项:
  const [openItems, setOpenItems] = useState<number[]>([])

  // 2. 添加一个切换菜单展开状态的函数:
  const toggleItem = (index: number) => {
    setOpenItems((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]))
  }

  const navItems = [
    {
      title: "总览",
      href: "/dashboard",
      icon: Activity,
      exact: true,
    },
    {
      title: "数据库管理",
      icon: Database,
      items: [
        {
          title: "数据库总览",
          href: "/dashboard/database",
          icon: Database,
          exact: true,
        },
        {
          title: "关系型数据库",
          href: "/dashboard/database/relational",
          icon: Table,
        },
        {
          title: "时序数据库",
          href: "/dashboard/database/timeseries",
          icon: Clock,
        },
        {
          title: "向量数据库",
          href: "/dashboard/database/vector",
          icon: Vector,
        },
        {
          title: "地理空间数据库",
          href: "/dashboard/database/geospatial",
          icon: Map,
        },
      ],
    },
    {
      title: "集群管理",
      icon: Server,
      items: [
        {
          title: "节点管理",
          href: "/dashboard/cluster/nodes",
          icon: Server,
        },
        {
          title: "分片管理",
          href: "/dashboard/cluster/shards",
          icon: Layers,
        },
      ],
    },
    {
      title: "数据模型管理",
      icon: Table,
      items: [
        {
          title: "表结构管理",
          href: "/dashboard/data-model/tables",
          icon: Table,
        },
        {
          title: "数据导入导出",
          href: "/dashboard/data-model/import-export",
          icon: Upload,
        },
      ],
    },
    {
      title: "安全管理",
      icon: Shield,
      items: [
        {
          title: "用户权限管理",
          href: "/dashboard/security/users",
          icon: Users,
        },
        {
          title: "访问控制",
          href: "/dashboard/security/access-control",
          icon: Key,
        },
      ],
    },
    {
      title: "监控与维护",
      icon: BarChart,
      items: [
        {
          title: "性能监控",
          href: "/dashboard/monitoring/performance",
          icon: BarChart,
        },
        {
          title: "备份管理",
          href: "/dashboard/monitoring/backup",
          icon: Save,
        },
      ],
    },
    {
      title: "存储管理",
      icon: HardDrive,
      items: [
        {
          title: "存储总览",
          href: "/dashboard/storage",
          icon: HardDrive,
          exact: true,
        },
        {
          title: "文件存储",
          href: "/dashboard/storage/file",
          icon: FolderTree,
        },
        {
          title: "对象存储",
          href: "/dashboard/storage/object",
          icon: Package,
        },
        {
          title: "块存储",
          href: "/dashboard/storage/block",
          icon: HardDisk,
        },
      ],
    },
    {
      title: "系统管理",
      icon: Settings,
      items: [
        {
          title: "系统设置",
          href: "/dashboard/system/settings",
          icon: Settings,
        },
        {
          title: "日志管理",
          href: "/dashboard/system/logs",
          icon: FileText,
        },
        {
          title: "告警管理",
          href: "/dashboard/system/alerts",
          icon: Bell,
        },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Database className="h-6 w-6" />
            <span>分布式融合管理系统</span>
          </Link>
        </div>
        <div className="space-y-1 p-2 overflow-y-auto h-[calc(100vh-4rem)]">
          <SidebarNav items={navItems} />
        </div>
        <div className="absolute bottom-0 w-full border-t p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium">管理</span>
                  </div>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">系统管理员</span>
                    <span className="text-xs text-gray-500">admin@example.com</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>账户设置</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          <div className="flex-1 font-semibold">
            {navItems.find((item) =>
              item.exact ? pathname === item.href : item.href && pathname.startsWith(item.href),
            )?.title ||
              navItems
                .flatMap((item) => item.items || [])
                .find((item) => (item.exact ? pathname === item.href : item.href && pathname.startsWith(item.href)))
                ?.title ||
              "仪表板"}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              通知
              <Badge className="ml-2" variant="secondary">
                5
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
