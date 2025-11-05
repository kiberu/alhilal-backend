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
import { FileText, Filter, CheckSquare } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, type Column } from "@/components/shared"
import { VisaService } from "@/lib/api/services/visas"
import { useAuth } from "@/hooks/useAuth"
import type { VisaWithDetails } from "@/types/models"
import { formatDate } from "@/lib/utils"

export default function VisasPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [visas, setVisas] = useState<VisaWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>("")
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadVisas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, statusFilter, typeFilter])

  const loadVisas = async () => {
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

      if (typeFilter && typeFilter !== "all") {
        filters.visa_type = typeFilter
      }

      const response = await VisaService.list(filters, accessToken)

      if (response.success && response.data) {
        setVisas(response.data.results || response.data)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || response.data.length || 0)
      } else {
        setError(response.error || "Failed to load visas")
      }
    } catch (err) {
      console.error("Error loading visas:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load visas"
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
    setTypeFilter("all")
    setPage(1)
  }

  const handleSelectAll = () => {
    if (selectedIds.length === visas.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(visas.map(v => v.id))
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
      if (bulkAction === "approve") {
        await VisaService.bulkApprove(selectedIds, accessToken)
        setSelectedIds([])
        loadVisas()
      } else if (bulkAction === "reject") {
        if (!confirm(`Are you sure you want to reject ${selectedIds.length} visa(s)?`)) return
        await VisaService.bulkReject(selectedIds, accessToken)
        setSelectedIds([])
        loadVisas()
      } else if (bulkAction.startsWith("status:")) {
        const newStatus = bulkAction.split(":")[1] as "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED"
        await Promise.all(
          selectedIds.map(id => VisaService.update(id, { status: newStatus }, accessToken))
        )
        setSelectedIds([])
        loadVisas()
      }
    } catch (err) {
      console.error("Bulk action error:", err)
      alert("Failed to perform bulk action")
    } finally {
      setBulkAction("")
    }
  }

  const columns: Column<VisaWithDetails>[] = [
    {
      key: "select",
      header: () => (
        <Checkbox
          checked={selectedIds.length === visas.length && visas.length > 0}
          onCheckedChange={handleSelectAll}
        />
      ),
      render: (visa) => (
        <Checkbox
          checked={selectedIds.includes(visa.id)}
          onCheckedChange={() => handleSelectOne(visa.id)}
        />
      ),
      className: "w-12",
    },
    {
      key: "pilgrim",
      header: "Pilgrim",
      render: (visa) => (
        <div>
          <p className="font-medium">
            Visa #{visa.number || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">
            Type: {visa.visaType}
          </p>
        </div>
      ),
    },
    {
      key: "visaNumber",
      header: "Visa Number",
      render: (visa) => (
        <span className="font-mono text-sm">{visa.number || "N/A"}</span>
      ),
    },
    {
      key: "visaType",
      header: "Type",
      render: (visa) => <span className="text-sm capitalize">{visa.visaType || "N/A"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (visa) => <StatusBadge status={visa.status} />,
    },
    {
      key: "applicationDate",
      header: "Applied",
      render: (visa) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(visa.applicationDate)}
        </span>
      ),
    },
    {
      key: "approvalDate",
      header: "Approved",
      render: (visa) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(visa.approvalDate, "MMM dd, yyyy", "-")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (visa) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (visa.bookingDetails?.pilgrimDetails?.user?.id) {
              router.push(`/dashboard/pilgrims/${visa.bookingDetails.pilgrim}`)
            }
          }}
        >
          View Pilgrim
        </Button>
      ),
      className: "text-right",
    },
  ]

  const statusCounts = {
    pending: visas.filter(v => v.status === "PENDING").length,
    approved: visas.filter(v => v.status === "APPROVED").length,
    rejected: visas.filter(v => v.status === "REJECTED").length,
    total: visas.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visa Management</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage pilgrim visa applications
          </p>
        </div>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search by name or visa number..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Visa Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HAJJ">Hajj</SelectItem>
                  <SelectItem value="UMRAH">Umrah</SelectItem>
                  <SelectItem value="TOURIST">Tourist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
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
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{statusCounts.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
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
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
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
                  {selectedIds.length} visa(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Bulk Approve</SelectItem>
                    <SelectItem value="reject">Bulk Reject</SelectItem>
                    <SelectItem value="status:PENDING">Set Status: Pending</SelectItem>
                    <SelectItem value="status:APPROVED">Set Status: Approved</SelectItem>
                    <SelectItem value="status:REJECTED">Set Status: Rejected</SelectItem>
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

      {/* Visas Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={visas}
            loading={loading}
            emptyMessage="No visas found"
            emptyDescription="Visas will appear here once applications are submitted"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

