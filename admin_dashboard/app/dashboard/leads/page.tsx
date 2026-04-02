"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Filter, MessageSquare, RefreshCw, UserRoundSearch } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable, SearchBar, type Column } from "@/components/shared"
import { useAuth } from "@/hooks/useAuth"
import { LeadService } from "@/lib/api/services/leads"
import type { Lead, LeadInterestType, LeadStatus } from "@/types/models"
import { formatDate } from "@/lib/utils"

const STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLOSED", label: "Closed" },
]

const INTEREST_OPTIONS: Array<{ value: LeadInterestType; label: string }> = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "GUIDE_REQUEST", label: "Guide request" },
]

export default function LeadsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [interestFilter, setInterestFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState("")
  const [createdAfter, setCreatedAfter] = useState("")
  const [createdBefore, setCreatedBefore] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    void loadLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, statusFilter, interestFilter, sourceFilter, createdAfter, createdBefore, accessToken])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: Record<string, string | number> = {
        page,
        page_size: pageSize,
      }

      if (searchQuery) filters.search = searchQuery
      if (statusFilter !== "all") filters.status = statusFilter
      if (interestFilter !== "all") filters.interest_type = interestFilter
      if (sourceFilter) filters.source = sourceFilter
      if (createdAfter) filters.created_after = createdAfter
      if (createdBefore) filters.created_before = createdBefore

      const response = await LeadService.list(filters, accessToken)
      if (response.success && response.data) {
        setLeads(response.data.results || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || 0)
      } else {
        setError(response.error || "Failed to load leads")
      }
    } catch (err) {
      console.error("Error loading leads:", err)
      setError(err instanceof Error ? err.message : "Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setInterestFilter("all")
    setSourceFilter("")
    setCreatedAfter("")
    setCreatedBefore("")
    setPage(1)
  }

  const columns: Column<Lead>[] = [
    {
      key: "name",
      header: "Lead",
      render: (lead) => (
        <div>
          <p className="font-medium">{lead.name}</p>
          <p className="text-xs text-muted-foreground">{lead.phone}</p>
        </div>
      ),
    },
    {
      key: "interestType",
      header: "Intent",
      render: (lead) => (
        <span className="text-sm">{lead.interestType === "GUIDE_REQUEST" ? "Guide request" : "Consultation"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => (
        <span className="text-sm">{STATUS_OPTIONS.find((option) => option.value === lead.status)?.label || lead.status}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (lead) => (
        <div>
          <p className="text-sm">{lead.source}</p>
          <p className="text-xs text-muted-foreground">{lead.pagePath}</p>
        </div>
      ),
    },
    {
      key: "tripName",
      header: "Trip",
      render: (lead) => (
        <span className="text-sm">{lead.tripName || "General enquiry"}</span>
      ),
    },
    {
      key: "assignedToName",
      header: "Assigned",
      render: (lead) => (
        <span className="text-sm">{lead.assignedToName || "Unassigned"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (lead) => (
        <span className="text-sm">{formatDate(lead.createdAt, "MMM dd, yyyy HH:mm")}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Leads</h1>
          <p className="mt-2 text-muted-foreground">
            Review consultation and planning-guide requests captured from the public website.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadLeads()} disabled={loading}>
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
          <CardDescription>Search by person, context, trip, or follow-up note.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value)
                setPage(1)
              }}
              placeholder="Search leads..."
              onClear={() => {
                setSearchQuery("")
                setPage(1)
              }}
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
            <Select value={interestFilter} onValueChange={(value) => {
              setInterestFilter(value)
              setPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All intents</SelectItem>
                {INTEREST_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Source (e.g. homepage)"
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value)
                setPage(1)
              }}
            />
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="date"
              value={createdAfter}
              onChange={(event) => {
                setCreatedAfter(event.target.value)
                setPage(1)
              }}
            />
            <Input
              type="date"
              value={createdBefore}
              onChange={(event) => {
                setCreatedBefore(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRoundSearch className="h-5 w-5" />
            <CardTitle>Lead Queue</CardTitle>
          </div>
          <CardDescription>
            {totalItems} captured lead{totalItems === 1 ? "" : "s"} across consultation and guide-request flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={leads}
            loading={loading}
            emptyMessage={error || "No website leads yet"}
            emptyDescription={error ? "Check API access or refresh the page." : "New public website submissions will appear here."}
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(lead) => router.push(`/dashboard/leads/${lead.id}`)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <MessageSquare className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Phase 2 stores the lead in-system and leaves all guide sending and human follow-up to staff. No automated email or WhatsApp handoff happens from this queue.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
