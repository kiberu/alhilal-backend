"use client"

import { useEffect, useMemo, useState } from "react"
import { MessageSquareQuote, RefreshCw, Search, Star } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { DataTable, type Column } from "@/components/shared"
import { useAuth } from "@/hooks/useAuth"
import { FeedbackService } from "@/lib/api/services/feedback"
import type { FeedbackStatus, TripFeedback } from "@/types/models"
import { formatDate } from "@/lib/utils"

const STATUS_OPTIONS: Array<{ value: FeedbackStatus; label: string }> = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
]

export default function FeedbackPage() {
  const { accessToken } = useAuth()
  const [feedbackRows, setFeedbackRows] = useState<TripFeedback[]>([])
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const pageSize = 10

  const selectedFeedback = useMemo(
    () => feedbackRows.find((item) => item.id === selectedFeedbackId) || null,
    [feedbackRows, selectedFeedbackId]
  )

  useEffect(() => {
    void loadFeedback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, statusFilter, accessToken])

  useEffect(() => {
    setReviewNotes(selectedFeedback?.reviewNotes || "")
  }, [selectedFeedback])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: Record<string, string | number> = {
        page,
        page_size: pageSize,
      }
      if (searchQuery) filters.search = searchQuery
      if (statusFilter !== "all") filters.status = statusFilter

      const response = await FeedbackService.list(filters, accessToken)
      if (response.success && response.data) {
        setFeedbackRows(response.data.results || [])
        setTotalPages(response.data.totalPages || 1)
        setTotalItems(response.data.count || 0)
        if (!selectedFeedbackId && response.data.results?.length) {
          setSelectedFeedbackId(response.data.results[0].id)
        }
      } else {
        setError(response.error || "Failed to load feedback.")
      }
    } catch (loadError) {
      console.error("Error loading feedback:", loadError)
      setError(loadError instanceof Error ? loadError.message : "Failed to load feedback.")
    } finally {
      setLoading(false)
    }
  }

  const saveReviewNotes = async () => {
    if (!selectedFeedback) return

    try {
      setSaving(true)
      const response = await FeedbackService.update(
        selectedFeedback.id,
        { reviewNotes },
        accessToken
      )
      if (response.success && response.data) {
        setFeedbackRows((current) =>
          current.map((row) => (row.id === response.data?.id ? response.data : row))
        )
      } else {
        setError(response.error || "Failed to save review notes.")
      }
    } catch (saveError) {
      console.error("Error saving feedback review notes:", saveError)
      setError(saveError instanceof Error ? saveError.message : "Failed to save review notes.")
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<TripFeedback>[] = [
    {
      key: "pilgrimName",
      header: "Pilgrim",
      render: (item) => (
        <div>
          <p className="font-medium">{item.pilgrimName}</p>
          <p className="text-xs text-muted-foreground">{item.bookingReference}</p>
        </div>
      ),
    },
    {
      key: "tripName",
      header: "Trip",
      render: (item) => (
        <div>
          <p className="text-sm">{item.tripName}</p>
          <p className="text-xs text-muted-foreground">{item.tripCode}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <span className="text-sm">{item.status}</span>,
    },
    {
      key: "overallRating",
      header: "Overall",
      render: (item) => (
        <span className="text-sm">{item.overallRating ? `${item.overallRating}/5` : "Pending"}</span>
      ),
    },
    {
      key: "followUpRequested",
      header: "Follow-up",
      render: (item) => (
        <span className="text-sm">{item.followUpRequested ? "Requested" : "No"}</span>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (item) => (
        <span className="text-sm">
          {item.submittedAt ? formatDate(item.submittedAt, "MMM dd, yyyy HH:mm") : "Not submitted"}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trip Feedback</h1>
          <p className="mt-2 text-muted-foreground">
            Review post-trip feedback, capture follow-up notes, and keep the support loop visible to operations.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadFeedback()} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          <CardDescription>Search by pilgrim, trip, booking reference, or comment text.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setPage(1)
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5" />
              <CardTitle>Feedback Queue</CardTitle>
            </div>
            <CardDescription>
              {totalItems} feedback record{totalItems === 1 ? "" : "s"} are currently available for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={feedbackRows}
              loading={loading}
              emptyMessage={error || "No feedback yet"}
              emptyDescription={error ? "Refresh the page after checking API access." : "Submitted pilgrim feedback will appear here."}
              pagination={{
                page,
                totalPages,
                totalItems,
                pageSize,
                onPageChange: setPage,
              }}
              onRowClick={(item) => setSelectedFeedbackId(item.id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <CardTitle>Review Panel</CardTitle>
            </div>
            <CardDescription>
              Keep the feedback state visible to the team and note any follow-up action that support owes the pilgrim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedFeedback ? (
              <p className="text-sm text-muted-foreground">
                Select a feedback record from the queue to review its notes and capture an operational follow-up.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selectedFeedback.pilgrimName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.tripName} · {selectedFeedback.bookingReference}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Ratings</p>
                    <p className="mt-2 text-sm">
                      Overall: {selectedFeedback.overallRating || "Pending"} / 5
                    </p>
                    <p className="text-sm">Support: {selectedFeedback.supportRating || "Pending"} / 5</p>
                    <p className="text-sm">Accommodation: {selectedFeedback.accommodationRating || "Pending"} / 5</p>
                    <p className="text-sm">Transport: {selectedFeedback.transportRating || "Pending"} / 5</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Flags</p>
                    <p className="mt-2 text-sm">Status: {selectedFeedback.status}</p>
                    <p className="text-sm">Follow-up: {selectedFeedback.followUpRequested ? "Requested" : "Not requested"}</p>
                    <p className="text-sm">Testimonial opt-in: {selectedFeedback.testimonialOptIn ? "Yes" : "No"}</p>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Highlights</p>
                  <p className="text-sm text-foreground">{selectedFeedback.highlights || "No highlights shared yet."}</p>
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Improvements</p>
                  <p className="text-sm text-foreground">{selectedFeedback.improvements || "No improvement notes shared yet."}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    placeholder="Capture the operational follow-up, owner, or closeout note here."
                    rows={6}
                  />
                </div>
                <Button onClick={() => void saveReviewNotes()} disabled={saving}>
                  {saving ? "Saving..." : "Save Review Notes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
