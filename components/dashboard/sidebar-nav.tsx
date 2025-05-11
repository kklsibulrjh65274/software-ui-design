"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
  exact?: boolean
}

interface SidebarNavProps {
  items: NavItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]))
  }

  return (
    <div className="space-y-1 p-2 overflow-y-auto h-[calc(100vh-4rem)]">
      {items.map((item, index) => {
        if (item.items) {
          const isOpen = openItems.includes(index)
          const isActive = item.items.some((subItem) =>
            subItem.exact ? pathname === subItem.href : pathname.startsWith(subItem.href || ""),
          )

          return (
            <div key={index} className="w-full">
              <Button
                variant="ghost"
                className={cn("w-full justify-between font-normal", isActive && "bg-gray-100 text-gray-900")}
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center">
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
              </Button>
              {isOpen && (
                <div className="pl-4 space-y-1 mt-1">
                  {item.items.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href || "#"}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === subItem.href
                          ? "bg-gray-100 font-medium text-gray-900"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      {subItem.icon && <subItem.icon className="h-4 w-4" />}
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <Link
            key={index}
            href={item.href || "#"}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              (item.exact ? pathname === item.href : pathname.startsWith(item.href || ""))
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
