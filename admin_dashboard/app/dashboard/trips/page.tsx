"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plane, Plus, Filter, Download } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, DateRangePicker, type Column } from "@/components/shared"
import { TripService } from "@/lib/api/services/trips"
import { useAuth } from "@/hooks/useAuth"
import type { Trip } from "@/types/models"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

export default function TripsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadTrips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, visibilityFilter, dateRange])

  const loadTrips = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: Record<string, string | number> = {
        page,
        page_size: pageSize,
      }

      if (searchQuery) {
        filters.search = searchQuery
      }

      if (visibilityFilter && visibilityFilter !== "all") {
        filters.visibility = visibilityFilter
      }

      if (dateRange?.from) {
        filters.start_date_after = format(dateRange.from, "yyyy-MM-dd")
      }

      if (dateRange?.to) {
        filters.start_date_before = format(dateRange.to, "yyyy-MM-dd")
      }

      const response = await TripService.list(filters, accessToken)

      if (response.success && response.data) {
        setTrips(response.data.results || response.data)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || response.data.length || 0)
      } else {
        setError(response.error || "Failed to load trips")
      }
    } catch (err) {
      console.error("Error loading trips:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load trips"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setVisibilityFilter("all")
    setDateRange(undefined)
    setPage(1)
  }

  const columns: Column<Trip>[] = [
    {
      key: "code",
      header: "Code",
      className: "font-mono text-sm",
    },
    {
      key: "name",
      header: "Trip Name",
      className: "font-medium",
    },
    {
      key: "cities",
      header: "Cities",
      render: (trip) => (
        <span className="text-sm text-muted-foreground">
          {trip.cities.join(", ")}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      render: (trip) => {
        try {
          const date = new Date(trip.startDate)
          return (
            <span className="text-sm">
              {isNaN(date.getTime()) ? 'N/A' : format(date, "MMM dd, yyyy")}
            </span>
          )
        } catch {
          return <span className="text-sm text-muted-foreground">N/A</span>
        }
      },
    },
    {
      key: "endDate",
      header: "End Date",
      render: (trip) => {
        try {
          const date = new Date(trip.endDate)
          return (
            <span className="text-sm">
              {isNaN(date.getTime()) ? 'N/A' : format(date, "MMM dd, yyyy")}
            </span>
          )
        } catch {
          return <span className="text-sm text-muted-foreground">N/A</span>
        }
      },
    },
    {
      key: "visibility",
      header: "Status",
      render: (trip) => <StatusBadge status={trip.visibility} />,
    },
    {
      key: "actions",
      header: "",
      render: (trip) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
        >
          View Details
        </Button>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all trips, packages, and itineraries
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/trips/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Trip
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search by name or code..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Visibility</label>
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trips</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">Date Range</label>
              <DateRangePicker
                date={dateRange}
                onSelect={setDateRange}
                placeholder="Filter by start date..."
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Public Trips</p>
                <p className="text-2xl font-bold">
                  {trips.filter((t) => t.visibility === "PUBLIC").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">
                  {trips.filter((t) => t.visibility === "ARCHIVED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={trips}
            loading={loading}
            emptyMessage="No trips found"
            emptyDescription="Create your first trip to get started"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(trip) => router.push(`/dashboard/trips/${trip.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
