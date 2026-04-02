"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, RefreshCw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable, SearchBar, type Column } from "@/components/shared"
import { useAuth } from "@/hooks/useAuth"
import { ReadinessService } from "@/lib/api/services/readiness"
import type { PilgrimReadiness, ReadinessStatus } from "@/types/models"

const STATUS_OPTIONS: Array<{ value: ReadinessStatus; label: string }> = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "READY_FOR_REVIEW", label: "Ready for review" },
  { value: "READY_FOR_TRAVEL", label: "Ready for travel" },
  { value: "BLOCKED", label: "Blocked" },
]

export default function ReadinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken } = useAuth()

  const [rows, setRows] = useState<PilgrimReadiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [readyFilter, setReadyFilter] = useState<string>("all")
  const [followUpFilter, setFollowUpFilter] = useState<string>("all")
  const [tripFilter, setTripFilter] = useState(searchParams.get("trip") || "")
  const [pilgrimFilter, setPilgrimFilter] = useState(searchParams.get("pilgrim") || "")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    void loadReadiness()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, page, search, statusFilter, readyFilter, followUpFilter, tripFilter, pilgrimFilter])

  async function loadReadiness() {
    try {
      setLoading(true)
      setError(null)

      const response = await ReadinessService.list(
        {
          page,
          page_size: pageSize,
          search: search || undefined,
          trip: tripFilter || undefined,
          pilgrim: pilgrimFilter || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          ready_for_travel: readyFilter === "all" ? undefined : readyFilter === "true",
          requires_follow_up: followUpFilter === "all" ? undefined : followUpFilter === "true",
        },
        accessToken
      )

      if (response.success && response.data) {
        setRows(response.data.results || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || 0)
      } else {
        setError(response.error || "Failed to load readiness workflow")
      }
    } catch (err) {
      console.error("Error loading readiness:", err)
      setError(err instanceof Error ? err.message : "Failed to load readiness workflow")
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setSearch("")
    setStatusFilter("all")
    setReadyFilter("all")
    setFollowUpFilter("all")
    setTripFilter("")
    setPilgrimFilter("")
    setPage(1)
  }

  const columns: Column<PilgrimReadiness>[] = [
    {
      key: "pilgrim_name",
      header: "Pilgrim",
      render: (row) => (
        <div>
          <p className="font-medium">{row.pilgrim_name || "Unnamed pilgrim"}</p>
          <p className="text-xs text-muted-foreground">{row.booking_reference}</p>
        </div>
      ),
    },
    {
      key: "trip",
      header: "Trip",
      render: (row) => (
        <div>
          <p className="text-sm">{row.trip_name || row.trip_code}</p>
          <p className="text-xs text-muted-foreground">{row.package_name}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <span className="text-sm">{row.status}</span> },
    { key: "payment", header: "Payment", render: (row) => <span className="text-sm">{row.payment_progress_percent}%</span> },
    { key: "ready", header: "Travel Ready", render: (row) => <span className="text-sm">{row.ready_for_travel ? "Yes" : "No"}</span> },
    { key: "follow_up", header: "Follow-up", render: (row) => <span className="text-sm">{row.requires_follow_up ? "Required" : "Clear"}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Travel Readiness</h1>
          <p className="mt-2 text-muted-foreground">
            Manage the canonical readiness pass across pilgrim, booking, and trip workflows.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadReadiness()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          <CardDescription>Search pilgrims, bookings, or trip codes and narrow the review queue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SearchBar
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              onClear={() => {
                setSearch("")
                setPage(1)
              }}
              placeholder="Search readiness..."
            />
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={readyFilter} onValueChange={(value) => {
              setReadyFilter(value)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Travel ready" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All readiness</SelectItem>
                <SelectItem value="true">Ready for travel</SelectItem>
                <SelectItem value="false">Not yet ready</SelectItem>
              </SelectContent>
            </Select>
            <Select value={followUpFilter} onValueChange={(value) => {
              setFollowUpFilter(value)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Follow-up" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All follow-up states</SelectItem>
                <SelectItem value="true">Requires follow-up</SelectItem>
                <SelectItem value="false">No follow-up needed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={clearFilters}>Clear filters</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Trip ID filter"
              value={tripFilter}
              onChange={(event) => {
                setTripFilter(event.target.value)
                setPage(1)
              }}
            />
            <Input
              placeholder="Pilgrim ID filter"
              value={pilgrimFilter}
              onChange={(event) => {
                setPilgrimFilter(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Records in Scope</p>
            <p className="text-2xl font-semibold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ready for Travel</p>
            <p className="text-2xl font-semibold">{rows.filter((row) => row.ready_for_travel).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Needs Follow-up</p>
            <p className="text-2xl font-semibold">{rows.filter((row) => row.requires_follow_up).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Readiness Queue</CardTitle>
          </div>
          <CardDescription>Open a record to review blockers, update manual checks, or validate travel readiness.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            emptyMessage={error || "No readiness records found"}
            emptyDescription={error ? "Refresh the page after checking API access." : "Try widening the filters or open a pilgrim booking to generate readiness state."}
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(row) => router.push(`/dashboard/readiness/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
