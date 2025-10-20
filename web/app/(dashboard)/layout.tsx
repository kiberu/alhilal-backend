"use client"

import { useEffect } from "react"
import { useRequireAuth } from "@/hooks/useAuth"
import { AppShell } from "@/components/layout/AppShell"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AppShell>{children}</AppShell>
}

