"use client"

import { useEffect, useState, useRef } from "react"
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
import { Users, Plus, Filter, Download, FileText, Plane, Upload, FileSpreadsheet } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, type Column } from "@/components/shared"
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import type { PilgrimWithDetails } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { ImportPreviewDialog } from "@/components/pilgrims/ImportPreviewDialog"

export default function PilgrimsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pilgrims, setPilgrims] = useState<PilgrimWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
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

  const handleDownloadTemplate = async () => {
    try {
      await PilgrimService.downloadTemplate(accessToken)
      toast.success("Template Downloaded", {
        description: "The import template has been downloaded successfully.",
      })
    } catch (err) {
      console.error("Error downloading template:", err)
      toast.error("Download Failed", {
        description: "Failed to download the template. Please try again.",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      toast.error("Invalid File", {
        description: "Please upload an Excel file (.xlsx)",
      })
      return
    }

    // Phase 1: Validate the file
    try {
      setValidating(true)
      const response = await PilgrimService.validateImport(file, accessToken)

      if (response.success) {
        // Store the file and validation results
        setSelectedFile(file)
        setValidationResult(response)
        setShowPreview(true)
      } else {
        toast.error("Validation Failed", {
          description: response.error || "Failed to validate file. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error validating file:", err)
      toast.error("Validation Failed", {
        description: err instanceof Error ? err.message : "Failed to validate file. Please try again.",
      })
    } finally {
      setValidating(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const confirmImport = async () => {
    if (!selectedFile) return

    // Phase 2: Actually import the pilgrims
    try {
      setImporting(true)
      const response = await PilgrimService.importPilgrims(selectedFile, accessToken)

      if (response.success) {
        const imported = (response as any).imported || 0
        const errors = (response as any).errors || []
        const message = (response as any).message || ''

        if (errors && errors.length > 0) {
          const errorMessage = `${message}\n\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''}`
          
          if (imported > 0) {
            toast.warning("Import Completed with Errors", {
              description: errorMessage,
            })
          } else {
            toast.error("Import Failed", {
              description: errorMessage,
            })
          }
        } else {
          toast.success("Import Successful", {
            description: message || `Successfully imported ${imported} pilgrim(s)`,
          })
        }

        // Close preview and reload pilgrims list
        setShowPreview(false)
        setValidationResult(null)
        setSelectedFile(null)
        await loadPilgrims()
      } else {
        toast.error("Import Failed", {
          description: response.error || "Failed to import pilgrims. Please try again.",
        })
      }
    } catch (err) {
      console.error("Error importing pilgrims:", err)
      toast.error("Import Failed", {
        description: err instanceof Error ? err.message : "Failed to import pilgrims. Please try again.",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setValidationResult(null)
    setSelectedFile(null)
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
          {formatDate(pilgrim.created_at, "MMM yyyy")}
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
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleImportClick}
              disabled={validating || importing}
            >
              {validating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  Validating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Excel
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
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

      {/* Import Preview Dialog */}
      {validationResult && (
        <ImportPreviewDialog
          open={showPreview}
          onClose={handleClosePreview}
          onConfirm={confirmImport}
          summary={validationResult.summary}
          validRows={validationResult.valid_rows || []}
          duplicateRows={validationResult.duplicate_rows || []}
          errorRows={validationResult.error_rows || []}
          loading={importing}
        />
      )}
    </div>
  )
}
