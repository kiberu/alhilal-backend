"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Plus, Filter, Download, Users, CheckSquare, Trash2 } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, DateRangePicker, type Column } from "@/components/shared"
import { BookingService } from "@/lib/api/services/bookings"
import { useAuth } from "@/hooks/useAuth"
import type { BookingWithDetails } from "@/types/models"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

export default function BookingsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>("")
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, statusFilter, paymentStatusFilter, dateRange])

  const loadBookings = async () => {
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

      if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter
      }

      if (paymentStatusFilter && paymentStatusFilter !== "all") {
        filters.payment_status = paymentStatusFilter
      }

      if (dateRange?.from) {
        filters.created_after = format(dateRange.from, "yyyy-MM-dd")
      }

      if (dateRange?.to) {
        filters.created_before = format(dateRange.to, "yyyy-MM-dd")
      }

      const response = await BookingService.list(filters, accessToken)

      if (response.success && response.data) {
        setBookings(response.data.results || response.data)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || response.data.length || 0)
      } else {
        setError(response.error || "Failed to load bookings")
      }
    } catch (err) {
      console.error("Error loading bookings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load bookings"
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
    setStatusFilter("all")
    setPaymentStatusFilter("all")
    setDateRange(undefined)
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(bookings.map(b => b.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return

    try {
      if (bulkAction === "delete") {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} booking(s)?`)) return
        
        await Promise.all(
          selectedIds.map(id => BookingService.delete(id, accessToken))
        )
        setSelectedIds([])
        loadBookings()
      } else if (bulkAction.startsWith("status:")) {
        const newStatus = bulkAction.split(":")[1] as "EOI" | "BOOKED" | "CONFIRMED" | "CANCELLED"
        await Promise.all(
          selectedIds.map(id => BookingService.update(id, { status: newStatus }, accessToken))
        )
        setSelectedIds([])
        loadBookings()
      } else if (bulkAction.startsWith("payment:")) {
        const newPaymentStatus = bulkAction.split(":")[1] as "PENDING" | "PARTIAL" | "PAID" | "REFUNDED"
        await Promise.all(
          selectedIds.map(id => BookingService.update(id, { payment_status: newPaymentStatus }, accessToken))
        )
        setSelectedIds([])
        loadBookings()
      }
    } catch (err) {
      console.error("Bulk action error:", err)
      alert("Failed to perform bulk action")
    } finally {
      setBulkAction("")
    }
  }

  const formatCurrency = (minorUnits: number, currency: string = "USD") => {
    const amount = minorUnits / 100
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const columns: Column<BookingWithDetails>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={selectedIds.length === bookings.length && bookings.length > 0}
          onCheckedChange={handleSelectAll}
        />
      ),
      render: (booking) => (
        <Checkbox
          checked={selectedIds.includes(booking.id)}
          onCheckedChange={() => handleSelectOne(booking.id)}
        />
      ),
      className: "w-12",
    },
    {
      key: "reference_number",
      header: "Reference",
      className: "font-mono text-sm",
    },
    {
      key: "pilgrim",
      header: "Pilgrim",
      render: (booking) => (
        <div>
          <p className="font-medium">
            {booking.pilgrimDetails?.user?.name || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.pilgrimDetails?.user?.phone || ""}
          </p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Trip/Package",
      render: (booking) => (
        <div>
          <p className="text-sm font-medium">
            {booking.packageDetails?.trip?.name || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.packageDetails?.name || ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (booking) => <StatusBadge status={booking.payment_status} />,
    },
    {
      key: "amountPaid",
      header: "Amount",
      render: (booking) => (
        <span className="text-sm font-medium">
          {formatCurrency(booking.amount_paid_minor_units, booking.currency?.code || "USD")}
        </span>
      ),
      className: "text-right",
    },
    {
      key: "created_at",
      header: "Created",
      render: (booking) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(booking.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (booking) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
        >
          View
        </Button>
      ),
      className: "text-right",
    },
  ]

  const statusCounts = {
    eoi: bookings.filter(b => b.status === "EOI").length,
    booked: bookings.filter(b => b.status === "BOOKED").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    cancelled: bookings.filter(b => b.status === "CANCELLED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all pilgrim bookings and payments
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/bookings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
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
                placeholder="Search by name, phone, or reference..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Booking Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="EOI">EOI</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Payment Status</label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Date Range</label>
              <DateRangePicker
                date={dateRange}
                onSelect={setDateRange}
                placeholder="Filter by booking date..."
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">EOI</p>
                <p className="text-2xl font-bold">{statusCounts.eoi}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked</p>
                <p className="text-2xl font-bold">{statusCounts.booked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedIds.length} booking(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status:EOI">Set Status: EOI</SelectItem>
                    <SelectItem value="status:BOOKED">Set Status: Booked</SelectItem>
                    <SelectItem value="status:CONFIRMED">Set Status: Confirmed</SelectItem>
                    <SelectItem value="status:CANCELLED">Set Status: Cancelled</SelectItem>
                    <SelectItem value="payment:PENDING">Payment: Pending</SelectItem>
                    <SelectItem value="payment:PARTIAL">Payment: Partial</SelectItem>
                    <SelectItem value="payment:PAID">Payment: Paid</SelectItem>
                    <SelectItem value="payment:REFUNDED">Payment: Refunded</SelectItem>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAction} disabled={!bulkAction}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={() => setSelectedIds([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={bookings}
            loading={loading}
            emptyMessage="No bookings found"
            emptyDescription="Create your first booking to get started"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(booking) => router.push(`/dashboard/bookings/${booking.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
