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
import { BookOpen, Plus, Filter } from "lucide-react"
import { DataTable, SearchBar, type Column } from "@/components/shared"
import { DuaService } from "@/lib/api/services/duas"
import { useAuth } from "@/hooks/useAuth"
import type { Dua } from "@/types/models"

export default function DuasPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadDuas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, categoryFilter])

  const loadDuas = async () => {
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

      if (categoryFilter && categoryFilter !== "all") {
        filters.category = categoryFilter
      }

      const response = await DuaService.list(filters, accessToken)

      if (response.success && response.data) {
        setDuas(response.data.results || response.data)
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || response.data.length || 0)
      } else {
        setError(response.error || "Failed to load duas")
      }
    } catch (err) {
      console.error("Error loading duas:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load duas"
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
    setCategoryFilter("all")
    setPage(1)
  }

  const columns: Column<Dua>[] = [
    {
      key: "title",
      header: "Title",
      render: (dua) => <span className="font-medium">{dua.title}</span>,
    },
    {
      key: "titleArabic",
      header: "Arabic Title",
      render: (dua) => (
        <span className="font-arabic text-lg" dir="rtl">
          {dua.titleArabic || ""}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (dua) => <span className="text-sm capitalize">{dua.category?.toLowerCase()}</span>,
    },
    {
      key: "orderIndex",
      header: "Order",
      render: (dua) => <span className="text-sm">{dua.orderIndex}</span>,
      className: "text-center",
    },
    {
      key: "actions",
      header: "",
      render: (dua) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/duas/${dua.id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/duas/${dua.id}/edit`)}
          >
            Edit
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ]

  const categoryCounts = {
    travel: duas.filter(d => d.category === "TRAVEL").length,
    prayer: duas.filter(d => d.category === "PRAYER").length,
    general: duas.filter(d => d.category === "GENERAL").length,
    total: duas.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dua Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage prayers and supplications for pilgrims
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/duas/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Dua
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search by title..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="TRAVEL">Travel</SelectItem>
                  <SelectItem value="PRAYER">Prayer</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
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
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{categoryCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Travel</p>
                <p className="text-2xl font-bold">{categoryCounts.travel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prayer</p>
                <p className="text-2xl font-bold">{categoryCounts.prayer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">General</p>
                <p className="text-2xl font-bold">{categoryCounts.general}</p>
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

      {/* Duas Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Duas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={duas}
            loading={loading}
            emptyMessage="No duas found"
            emptyDescription="Add your first dua to get started"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(dua) => router.push(`/dashboard/duas/${dua.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
