"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Plane, 
  FileText, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react"
import { DashboardService } from "@/lib/api/services/dashboard"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared"
import type { DashboardStats, RecentActivity } from "@/types/models"

export default function DashboardPage() {
  const { user, accessToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (accessToken && !hasLoaded) {
      loadDashboardData()
      setHasLoaded(true)
    }
  }, [accessToken, hasLoaded])

  const loadDashboardData = async () => {
    if (!accessToken) {
      console.log("⚠️ No access token available yet")
      console.log("User:", user)
      setLoading(false)
      setError("Please login to view dashboard")
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("✅ Loading dashboard with token:", accessToken.substring(0, 20) + "...")

      const [statsResponse, activityResponse] = await Promise.all([
        DashboardService.getStats(accessToken),
        DashboardService.getActivity(accessToken),
      ])

      console.log("Stats response:", statsResponse)
      console.log("Activity response:", activityResponse)

      if (statsResponse?.success && statsResponse.data) {
        setStats(statsResponse.data)
      }

      if (activityResponse?.success && activityResponse.data) {
        setActivity(activityResponse.data)
      }
    } catch (err) {
      console.error("❌ Dashboard error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data"
      setError(errorMessage)
      // Toast already shown by errorHandler
    } finally {
      setLoading(false)
    }
  }


  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <FileText className="h-4 w-4" />
      case "visa":
        return <AlertCircle className="h-4 w-4" />
      case "trip":
        return <Plane className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      case "visa":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
      case "trip":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user?.name || "Admin"}! Here&apos;s your overview for today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Trips Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.trips.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.trips.active || 0} active trips
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.bookings.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.bookings.eoi || 0} EOIs pending
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pilgrims Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pilgrims</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pilgrims.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered pilgrims
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Visas Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Visas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.visas.pending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.visas.approved || 0} approved
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bookings and updates from the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length > 0 ? (
              <div className="space-y-4">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getActivityColor(
                        item.type
                      )}`}
                    >
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        {item.status && <StatusBadge status={item.status} className="ml-2" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.timestamp), "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Navigate to key management pages</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/dashboard/trips">
              <Button variant="outline" className="w-full justify-between h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Trips</p>
                    <p className="text-xs text-muted-foreground">View and edit trip details</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/dashboard/bookings">
              <Button variant="outline" className="w-full justify-between h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Bookings</p>
                    <p className="text-xs text-muted-foreground">Manage pilgrim bookings</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/dashboard/pilgrims">
              <Button variant="outline" className="w-full justify-between h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Manage Pilgrims</p>
                    <p className="text-xs text-muted-foreground">View pilgrim profiles</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

