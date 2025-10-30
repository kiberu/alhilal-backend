"use client"

import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-200",
            sidebarCollapsed ? "ml-16" : "ml-64"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

