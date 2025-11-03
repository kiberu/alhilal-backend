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
import { Users, Plus, Filter, Download, FileText, Plane } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, type Column } from "@/components/shared"
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { useAuth } from "@/hooks/useAuth"
import type { PilgrimWithDetails } from "@/types/models"
import { format } from "date-fns"

export default function PilgrimsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [pilgrims, setPilgrims] = useState<PilgrimWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [nationalityFilter, setNationalityFilter] = useState<string>("all")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadPilgrims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, nationalityFilter, genderFilter])

  const loadPilgrims = async () => {
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

      if (nationalityFilter && nationalityFilter !== "all") {
        filters.nationality = nationalityFilter
      }

      if (genderFilter && genderFilter !== "all") {
        filters.gender = genderFilter
      }

            const response = await PilgrimService.list(filters, accessToken)

            if (response.success && response.data) {
                const data = response.data as unknown as { results?: PilgrimWithDetails[], count?: number, totalPages?: number } | PilgrimWithDetails[]
                const pilgrims = Array.isArray(data) ? data : (data.results || [])
                setPilgrims(pilgrims)
                const pages = Array.isArray(data) ? 1 : (data.totalPages || 1)
                const count = Array.isArray(data) ? data.length : (data.count || 0)
        setTotalPages(pages)
        setTotalItems(count)
      } else {
        setError(response.error || "Failed to load pilgrims")
      }
    } catch (err) {
      console.error("Error loading pilgrims:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load pilgrims"
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
    setNationalityFilter("all")
    setGenderFilter("all")
    setPage(1)
  }

  const columns: Column<PilgrimWithDetails>[] = [
    {
      key: "fullName",
      header: "Name",
      render: (pilgrim) => (
        <div>
          <p className="font-medium">{pilgrim.fullName || pilgrim.user?.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">
            {pilgrim.passportNumber || "No passport"}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (pilgrim) => (
        <span className="text-sm">{pilgrim.phone || "N/A"}</span>
      ),
    },
    {
      key: "nationality",
      header: "Nationality",
      className: "text-sm uppercase",
    },
    {
      key: "gender",
      header: "Gender",
      render: (pilgrim) => (
        <span className="text-sm capitalize">{pilgrim.gender?.toLowerCase() || "N/A"}</span>
      ),
    },
    {
      key: "dateOfBirth",
      header: "Age",
      render: (pilgrim) => {
        if (!pilgrim.dateOfBirth) return <span className="text-sm text-muted-foreground">N/A</span>
        const age = new Date().getFullYear() - new Date(pilgrim.dateOfBirth).getFullYear()
        return <span className="text-sm">{age} years</span>
      },
    },
    {
      key: "bookingsCount",
      header: "Bookings",
      render: (pilgrim) => (
        <span className="text-sm">{pilgrim.bookingsCount || 0}</span>
      ),
      className: "text-center",
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (pilgrim) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(pilgrim.created_at), "MMM yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (pilgrim) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/pilgrims/${pilgrim.id}`)}
        >
          View
        </Button>
      ),
      className: "text-right",
    },
  ]

  const genderCounts = {
    male: pilgrims.filter(p => p.gender === "MALE").length,
    female: pilgrims.filter(p => p.gender === "FEMALE").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pilgrims</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all registered pilgrims
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/pilgrims/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Pilgrim
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
                placeholder="Search by name, phone, or email..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Nationality</label>
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All nationalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  <SelectItem value="UG">Uganda</SelectItem>
                  <SelectItem value="KE">Kenya</SelectItem>
                  <SelectItem value="TZ">Tanzania</SelectItem>
                  <SelectItem value="RW">Rwanda</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                  <SelectItem value="GH">Ghana</SelectItem>
                  <SelectItem value="ZA">South Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender</label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pilgrims</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Male</p>
                <p className="text-2xl font-bold">{genderCounts.male}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Female</p>
                <p className="text-2xl font-bold">{genderCounts.female}</p>
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
                <p className="text-sm text-muted-foreground">Active Trips</p>
                <p className="text-2xl font-bold">
                  {pilgrims.reduce((acc, p) => acc + (p.bookings?.filter(b => b.status !== "CANCELLED").length || 0), 0)}
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

      {/* Pilgrims Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pilgrims</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={pilgrims}
            loading={loading}
            emptyMessage="No pilgrims found"
            emptyDescription="Add your first pilgrim to get started"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(pilgrim) => router.push(`/dashboard/pilgrims/${pilgrim.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
