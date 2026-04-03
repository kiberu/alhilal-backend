"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileBarChart, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { ReportService } from "@/lib/api/services/reports"
import type {
  LeadFunnelReport,
  PaymentTargetReport,
  ReadinessCompletionReport,
  SummaryReport,
  TripPackagePerformanceReport,
  VisaTicketProgressReport,
} from "@/types/models"

type ExportKind =
  | "summary"
  | "payment-target"
  | "readiness"
  | "visa-ticket"
  | "trip-performance"
  | "lead-funnel"

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-UG").format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

function ReportTable<T extends { id: string }>({
  rows,
  columns,
  emptyMessage,
}: {
  rows: T[]
  columns: Column<T>[]
  emptyMessage: string
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  exportLabel,
  onExport,
  exporting,
}: {
  title: string
  description: string
  exportLabel: string
  onExport: () => void
  exporting: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
        <Download className="mr-2 h-4 w-4" />
        {exporting ? "Exporting..." : exportLabel}
      </Button>
    </div>
  )
}

export default function ReportsPage() {
  const { accessToken } = useAuth()
  const [timeRange, setTimeRange] = useState("30")
  const [summary, setSummary] = useState<SummaryReport | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<PaymentTargetReport | null>(null)
  const [readiness, setReadiness] = useState<ReadinessCompletionReport | null>(null)
  const [visaTicket, setVisaTicket] = useState<VisaTicketProgressReport | null>(null)
  const [performance, setPerformance] = useState<TripPackagePerformanceReport | null>(null)
  const [leadFunnel, setLeadFunnel] = useState<LeadFunnelReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<ExportKind | null>(null)

  const filters = useMemo(() => ({ days: Number(timeRange) }), [timeRange])

  useEffect(() => {
    void loadReportData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, timeRange])

  async function loadReportData() {
    try {
      setLoading(true)
      setError(null)

      const responses = await Promise.all([
        ReportService.getSummary(filters, accessToken),
        ReportService.getPaymentTarget(filters, accessToken),
        ReportService.getReadinessCompletion(filters, accessToken),
        ReportService.getVisaTicketProgress(filters, accessToken),
        ReportService.getTripPackagePerformance(filters, accessToken),
        ReportService.getLeadFunnel(filters, accessToken),
      ])

      const [summaryResponse, paymentTargetResponse, readinessResponse, visaTicketResponse, performanceResponse, leadFunnelResponse] = responses
      const firstError = responses.find((response) => !response.success)?.error

      if (firstError) {
        setError(firstError)
      }

      setSummary(summaryResponse.data || null)
      setPaymentTarget(paymentTargetResponse.data || null)
      setReadiness(readinessResponse.data || null)
      setVisaTicket(visaTicketResponse.data || null)
      setPerformance(performanceResponse.data || null)
      setLeadFunnel(leadFunnelResponse.data || null)
    } catch (err) {
      console.error("Error loading reports:", err)
      setError(err instanceof Error ? err.message : "Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(kind: ExportKind) {
    try {
      setExporting(kind)

      const blob = await ({
        summary: ReportService.exportSummary(filters, accessToken),
        "payment-target": ReportService.exportPaymentTarget(filters, accessToken),
        readiness: ReportService.exportReadinessCompletion(filters, accessToken),
        "visa-ticket": ReportService.exportVisaTicketProgress(filters, accessToken),
        "trip-performance": ReportService.exportTripPackagePerformance(filters, accessToken),
        "lead-funnel": ReportService.exportLeadFunnel(filters, accessToken),
      }[kind])

      downloadBlob(blob, `${kind}-${timeRange}-days.csv`)
    } catch (err) {
      console.error("Error exporting report:", err)
      setError(err instanceof Error ? err.message : "Failed to export report")
    } finally {
      setExporting(null)
    }
  }

  const paymentTargetColumns: Column<NonNullable<PaymentTargetReport["rows"]>[number]>[] = [
    {
      key: "trip",
      header: "Trip / Package",
      render: (row) => (
        <div>
          <p className="font-medium">{row.trip_name}</p>
          <p className="text-xs text-muted-foreground">{row.package_name}</p>
        </div>
      ),
    },
    { key: "active_bookings", header: "Active", render: (row) => formatNumber(row.active_bookings) },
    { key: "pilgrims_at_target", header: "At Target", render: (row) => formatNumber(row.pilgrims_at_target) },
    { key: "attainment_rate", header: "Attainment", render: (row) => formatPercent(row.attainment_rate) },
    { key: "sales_target", header: "Sales Target", render: (row) => formatNumber(row.sales_target) },
    { key: "sales_target_attainment_rate", header: "Sales Progress", render: (row) => formatPercent(row.sales_target_attainment_rate) },
  ]

  const readinessColumns: Column<NonNullable<ReadinessCompletionReport["rows"]>[number]>[] = [
    {
      key: "trip",
      header: "Trip / Package",
      render: (row) => (
        <div>
          <p className="font-medium">{row.trip_name}</p>
          <p className="text-xs text-muted-foreground">{row.package_name}</p>
        </div>
      ),
    },
    { key: "ready_for_travel", header: "Ready", render: (row) => formatNumber(row.ready_for_travel) },
    { key: "ready_for_review", header: "Review", render: (row) => formatNumber(row.ready_for_review) },
    { key: "blocked", header: "Blocked", render: (row) => formatNumber(row.blocked) },
    { key: "requires_follow_up", header: "Follow-up", render: (row) => formatNumber(row.requires_follow_up) },
    { key: "completion_rate", header: "Completion", render: (row) => formatPercent(row.completion_rate) },
  ]

  const visaTicketColumns: Column<NonNullable<VisaTicketProgressReport["rows"]>[number]>[] = [
    {
      key: "trip",
      header: "Trip / Package",
      render: (row) => (
        <div>
          <p className="font-medium">{row.trip_name}</p>
          <p className="text-xs text-muted-foreground">{row.package_name}</p>
        </div>
      ),
    },
    { key: "visa_verified", header: "Visa Verified", render: (row) => formatNumber(row.visa_verified) },
    { key: "ticket_issued", header: "Tickets Issued", render: (row) => formatNumber(row.ticket_issued) },
    { key: "documents_complete", header: "Docs Complete", render: (row) => formatNumber(row.documents_complete) },
    { key: "visa_verification_rate", header: "Visa Rate", render: (row) => formatPercent(row.visa_verification_rate) },
    { key: "ticket_issue_rate", header: "Ticket Rate", render: (row) => formatPercent(row.ticket_issue_rate) },
  ]

  const performanceColumns: Column<NonNullable<TripPackagePerformanceReport["rows"]>[number]>[] = [
    {
      key: "trip",
      header: "Trip / Package",
      render: (row) => (
        <div>
          <p className="font-medium">{row.trip_code} · {row.trip_name}</p>
          <p className="text-xs text-muted-foreground">{row.package_name} · {row.package_status}</p>
        </div>
      ),
    },
    { key: "capacity", header: "Capacity", render: (row) => formatNumber(row.capacity) },
    { key: "active_bookings", header: "Active", render: (row) => formatNumber(row.active_bookings) },
    { key: "confirmed_bookings", header: "Confirmed", render: (row) => formatNumber(row.confirmed_bookings) },
    { key: "occupancy_rate", header: "Occupancy", render: (row) => formatPercent(row.occupancy_rate) },
    { key: "sales_target_attainment_rate", header: "Sales Target", render: (row) => formatPercent(row.sales_target_attainment_rate) },
    { key: "average_payment_progress_percent", header: "Avg Payment", render: (row) => formatPercent(row.average_payment_progress_percent) },
  ]

  const leadFunnelColumns: Column<NonNullable<LeadFunnelReport["rows"]>[number]>[] = [
    { key: "status", header: "Status", render: (row) => row.status || "Unknown" },
    { key: "total", header: "Total", render: (row) => formatNumber(row.total) },
    { key: "consultation", header: "Consultation", render: (row) => formatNumber(row.consultation || 0) },
    { key: "guide_request", header: "Guide Requests", render: (row) => formatNumber(row.guide_request || 0) },
    { key: "conversion_rate", header: "Share", render: (row) => formatPercent(row.conversion_rate || 0) },
  ]

  const leadSourceColumns: Column<NonNullable<LeadFunnelReport["sources"]>[number]>[] = [
    { key: "source", header: "Source", render: (row) => row.source || "Unknown" },
    { key: "total", header: "Leads", render: (row) => formatNumber(row.total) },
    { key: "share_rate", header: "Share", render: (row) => formatPercent(row.share_rate || 0) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Operational reporting for payment targets, readiness completion, visa and ticket progress, trip/package performance, and lead funnel tracking. CSV is the export format for Phase 4.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void loadReportData()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(summary?.cards || []).map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{formatNumber(card.value)}</span>
                <span className="pb-1 text-sm text-muted-foreground">{card.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && !summary?.cards?.length ? (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardContent className="flex items-center gap-3 pt-6 text-sm text-muted-foreground">
              <FileBarChart className="h-5 w-5" />
              No summary metrics matched the current report filters.
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Payment Target Attainment"
            description="Track how many active pilgrims in each package have crossed the readiness payment threshold."
            exportLabel="Export CSV"
            onExport={() => void handleExport("payment-target")}
            exporting={exporting === "payment-target"}
          />
        </CardHeader>
        <CardContent>
          <ReportTable
            rows={paymentTarget?.rows || []}
            columns={paymentTargetColumns}
            emptyMessage={loading ? "Loading payment target report..." : "No payment target rows matched the current filters."}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Readiness Completion"
            description="Monitor travel-ready passes, review queue counts, blockers, and required follow-up by package."
            exportLabel="Export CSV"
            onExport={() => void handleExport("readiness")}
            exporting={exporting === "readiness"}
          />
        </CardHeader>
        <CardContent>
          <ReportTable
            rows={readiness?.rows || []}
            columns={readinessColumns}
            emptyMessage={loading ? "Loading readiness completion report..." : "No readiness rows matched the current filters."}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Visa & Ticket Progress"
            description="See where each package stands on verified visas, ticket issue, and document completion."
            exportLabel="Export CSV"
            onExport={() => void handleExport("visa-ticket")}
            exporting={exporting === "visa-ticket"}
          />
        </CardHeader>
        <CardContent>
          <ReportTable
            rows={visaTicket?.rows || []}
            columns={visaTicketColumns}
            emptyMessage={loading ? "Loading visa and ticket progress report..." : "No visa/ticket rows matched the current filters."}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Trip & Package Performance"
            description="Review package capacity, occupancy, payment progress, and commercial target attainment."
            exportLabel="Export CSV"
            onExport={() => void handleExport("trip-performance")}
            exporting={exporting === "trip-performance"}
          />
        </CardHeader>
        <CardContent>
          <ReportTable
            rows={performance?.rows || []}
            columns={performanceColumns}
            emptyMessage={loading ? "Loading trip and package performance report..." : "No trip/package performance rows matched the current filters."}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <SectionHeader
              title="Lead Funnel"
              description="Track website leads through the staff follow-up funnel by status and enquiry type."
              exportLabel="Export CSV"
              onExport={() => void handleExport("lead-funnel")}
              exporting={exporting === "lead-funnel"}
            />
          </CardHeader>
          <CardContent className="space-y-6">
            {leadFunnel?.totals ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-semibold">{formatNumber(leadFunnel.totals.total)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Contacted</p>
                    <p className="text-2xl font-semibold">{formatNumber(leadFunnel.totals.contacted)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Qualified</p>
                    <p className="text-2xl font-semibold">{formatNumber(leadFunnel.totals.qualified)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Closed</p>
                    <p className="text-2xl font-semibold">{formatNumber(leadFunnel.totals.closed)}</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}
            <ReportTable
              rows={leadFunnel?.rows || []}
              columns={leadFunnelColumns}
              emptyMessage={loading ? "Loading lead funnel report..." : "No lead funnel rows matched the current filters."}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Top lead origins in the selected reporting window.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportTable
              rows={leadFunnel?.sources || []}
              columns={leadSourceColumns}
              emptyMessage={loading ? "Loading lead source breakdown..." : "No lead sources matched the current filters."}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <SectionHeader
            title="Summary Export"
            description="Download the report summary cards as a quick CSV snapshot for the current filter window."
            exportLabel="Export Summary CSV"
            onExport={() => void handleExport("summary")}
            exporting={exporting === "summary"}
          />
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use this export when leadership needs the headline metrics without the detailed package-level tables.
        </CardContent>
      </Card>
    </div>
  )
}
