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
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Filter, AlertTriangle, CheckCircle } from "lucide-react"
import { DataTable, SearchBar, type Column } from "@/components/shared"
import { PassportService } from "@/lib/api/services/passports"
import { useAuth } from "@/hooks/useAuth"
import type { Passport } from "@/types/models"
import { differenceInDays } from "date-fns"
import { formatDate } from "@/lib/utils"

export default function PassportsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [passports, setPassports] = useState<Passport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [expiryFilter, setExpiryFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadPassports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, expiryFilter])

  const loadPassports = async () => {
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

      if (expiryFilter && expiryFilter !== "all") {
        if (expiryFilter === "expired") {
          filters.expired = "true"
        } else if (expiryFilter === "expiring_soon") {
          filters.expiring_within_days = 90
        } else if (expiryFilter === "valid") {
          filters.valid = "true"
        }
      }

      const response = await PassportService.list(filters, accessToken)

      if (response.success && response.data) {
        setPassports(response.data.results || response.data)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || response.data.length || 0)
      } else {
        setError(response.error || "Failed to load passports")
      }
    } catch (err) {
      console.error("Error loading passports:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load passports"
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
    setExpiryFilter("all")
    setPage(1)
  }

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date())
    
    if (daysUntilExpiry < 0) {
      return { label: "Expired", variant: "destructive" as const, days: daysUntilExpiry }
    } else if (daysUntilExpiry <= 90) {
      return { label: "Expiring Soon", variant: "outline" as const, days: daysUntilExpiry }
    } else if (daysUntilExpiry <= 180) {
      return { label: "Warning", variant: "secondary" as const, days: daysUntilExpiry }
    } else {
      return { label: "Valid", variant: "default" as const, days: daysUntilExpiry }
    }
  }

  const columns: Column<Passport>[] = [
    {
      key: "pilgrim",
      header: "Pilgrim",
      render: (passport) => (
        <div>
          <p className="font-medium">
            Passport #{passport.number}
          </p>
          <p className="text-xs text-muted-foreground">
            {passport.country}
          </p>
        </div>
      ),
    },
    {
      key: "passportNumber",
      header: "Passport Number",
      render: (passport) => (
        <span className="font-mono text-sm">{passport.number}</span>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (passport) => (
        <span className="text-sm">{passport.country || "N/A"}</span>
      ),
    },
    {
      key: "expiryDate",
      header: "Expiry Date",
      render: (passport) => {
        if (!passport.expiryDate) return <span className="text-sm text-muted-foreground">N/A</span>
        const status = getExpiryStatus(passport.expiryDate)
        return (
          <div className="space-y-1">
            <p className="text-sm">{formatDate(passport.expiryDate)}</p>
            <p className="text-xs text-muted-foreground">
              {status.days > 0 ? `${status.days} days` : `${Math.abs(status.days)} days ago`}
            </p>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (passport) => {
        if (!passport.expiryDate) return null
        const status = getExpiryStatus(passport.expiryDate)
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      key: "actions",
      header: "",
      render: (passport) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/pilgrims/${passport.pilgrim}`)}
        >
          View Pilgrim
        </Button>
      ),
      className: "text-right",
    },
  ]

  const statusCounts = {
    total: passports.length,
    valid: passports.filter(p => p.expiryDate && getExpiryStatus(p.expiryDate).label === "Valid").length,
    expiringSoon: passports.filter(p => p.expiryDate && getExpiryStatus(p.expiryDate).label === "Expiring Soon").length,
    expired: passports.filter(p => p.expiryDate && getExpiryStatus(p.expiryDate).label === "Expired").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passport Management</h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage pilgrim passports and expiry dates
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search by name or passport number..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Expiry Status</label>
              <Select value={expiryFilter} onValueChange={setExpiryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All passports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Passports</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon (90 days)</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid</p>
                <p className="text-2xl font-bold">{statusCounts.valid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{statusCounts.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{statusCounts.expired}</p>
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

      {/* Passports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Passports</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={passports}
            loading={loading}
            emptyMessage="No passports found"
            emptyDescription="Passports will appear here once added to pilgrim profiles"
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

