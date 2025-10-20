"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/uiStore"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Plane,
  Users,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trips", href: "/trips", icon: Plane },
  { name: "Bookings", href: "/bookings", icon: FileText },
  { name: "Pilgrims", href: "/pilgrims", icon: Users },
  { name: "Duas", href: "/duas", icon: BookOpen },
]

const adminNavigation = [
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Audit Log", href: "/audit", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore()
  const { isAdmin, logout } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          {!sidebarCollapsed && (
            <Link href="/" className="text-xl font-bold text-gray-900">
              Alhilal
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarCollapsed}
            className="ml-auto"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-gray-200" />
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            title={sidebarCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>
          
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
