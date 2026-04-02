"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, RefreshCw, Save, ShieldAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { ReadinessService } from "@/lib/api/services/readiness"
import type { PilgrimReadiness } from "@/types/models"

export default function ReadinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { accessToken } = useAuth()
  const readinessId = params.id as string

  const [readiness, setReadiness] = useState<PilgrimReadiness | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    darasa_one_completed: false,
    darasa_two_completed: false,
    send_off_completed: false,
    validation_notes: "",
  })

  useEffect(() => {
    if (!readinessId) return
    void loadReadiness()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readinessId, accessToken])

  async function loadReadiness() {
    try {
      setLoading(true)
      setError(null)

      const response = await ReadinessService.get(readinessId, accessToken)
      if (response.success && response.data) {
        setReadiness(response.data)
        setFormState({
          darasa_one_completed: response.data.darasa_one_completed,
          darasa_two_completed: response.data.darasa_two_completed,
          send_off_completed: response.data.send_off_completed,
          validation_notes: response.data.validation_notes || "",
        })
      } else {
        setError(response.error || "Failed to load readiness record")
      }
    } catch (err) {
      console.error("Error loading readiness record:", err)
      setError(err instanceof Error ? err.message : "Failed to load readiness record")
    } finally {
      setLoading(false)
    }
  }

  async function saveManualChecks() {
    try {
      setSaving(true)
      setError(null)

      const response = await ReadinessService.update(readinessId, formState, accessToken)
      if (response.success && response.data) {
        setReadiness(response.data)
      } else {
        setError(response.error || "Failed to save readiness changes")
      }
    } catch (err) {
      console.error("Error saving readiness:", err)
      setError(err instanceof Error ? err.message : "Failed to save readiness changes")
    } finally {
      setSaving(false)
    }
  }

  async function validateReady() {
    try {
      setSaving(true)
      setError(null)

      const response = await ReadinessService.validateReady(readinessId, formState.validation_notes, accessToken)
      if (response.success && response.data) {
        setReadiness(response.data)
      } else {
        setError(response.error || "Failed to validate readiness")
      }
    } catch (err) {
      console.error("Error validating readiness:", err)
      setError(err instanceof Error ? err.message : "Failed to validate readiness")
    } finally {
      setSaving(false)
    }
  }

  async function clearValidation() {
    try {
      setSaving(true)
      setError(null)

      const response = await ReadinessService.clearValidation(readinessId, accessToken)
      if (response.success && response.data) {
        setReadiness(response.data)
      } else {
        setError(response.error || "Failed to clear travel-ready validation")
      }
    } catch (err) {
      console.error("Error clearing validation:", err)
      setError(err instanceof Error ? err.message : "Failed to clear travel-ready validation")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
        <div className="h-80 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (error || !readiness) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/readiness")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Readiness
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "Readiness record not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/readiness")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Readiness
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{readiness.pilgrim_name || "Readiness record"}</h1>
          <p className="mt-2 text-muted-foreground">
            {readiness.trip_name || readiness.trip_code} · {readiness.package_name} · {readiness.booking_reference}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadReadiness()} disabled={saving}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => void saveManualChecks()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save checks
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-xl font-semibold">{readiness.status}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Payment Progress</p>
            <p className="text-xl font-semibold">{readiness.payment_progress_percent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Travel Ready</p>
            <p className="text-xl font-semibold">{readiness.ready_for_travel ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Follow-up</p>
            <p className="text-xl font-semibold">{readiness.requires_follow_up ? "Required" : "Clear"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trip Context</CardTitle>
            <CardDescription>The booking and trip truth this readiness pass is attached to.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Trip:</span> {readiness.trip_name || readiness.trip_code}</p>
            <p><span className="font-medium">Trip code:</span> {readiness.trip_code}</p>
            <p><span className="font-medium">Package:</span> {readiness.package_name}</p>
            <p><span className="font-medium">Booking status:</span> {readiness.booking_status || "Unknown"}</p>
            <p><span className="font-medium">Package status:</span> {readiness.package_status || "Unknown"}</p>
            <p><span className="font-medium">Trip window:</span> {readiness.trip_start_date || "N/A"} to {readiness.trip_end_date || "N/A"}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/pilgrims/${readiness.pilgrim}`)}>
                Open pilgrim
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/bookings/${readiness.booking}`)}>
                Open booking
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/trips/${readiness.trip}`)}>
                Open trip
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Readiness Checks</CardTitle>
            <CardDescription>Update the staff-controlled training and validation state for this booking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <Checkbox
                  id="darasa-one"
                  checked={formState.darasa_one_completed}
                  onCheckedChange={(checked) => setFormState((current) => ({ ...current, darasa_one_completed: Boolean(checked) }))}
                />
                <Label htmlFor="darasa-one">Darasa 1 complete</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <Checkbox
                  id="darasa-two"
                  checked={formState.darasa_two_completed}
                  onCheckedChange={(checked) => setFormState((current) => ({ ...current, darasa_two_completed: Boolean(checked) }))}
                />
                <Label htmlFor="darasa-two">Darasa 2 complete</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <Checkbox
                  id="send-off"
                  checked={formState.send_off_completed}
                  onCheckedChange={(checked) => setFormState((current) => ({ ...current, send_off_completed: Boolean(checked) }))}
                />
                <Label htmlFor="send-off">Send-off complete</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validation-notes">Validation Notes</Label>
              <Textarea
                id="validation-notes"
                rows={6}
                placeholder="Add context for blockers, final review notes, or why validation was cleared."
                value={formState.validation_notes}
                onChange={(event) => setFormState((current) => ({ ...current, validation_notes: event.target.value }))}
              />
            </div>

            <div className="grid gap-3 rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Profile complete</span>
                <span>{readiness.profile_complete ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Passport valid</span>
                <span>{readiness.passport_valid ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Visa verified</span>
                <span>{readiness.visa_verified ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Documents complete</span>
                <span>{readiness.documents_complete ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment target met</span>
                <span>{readiness.payment_target_met ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ticket issued</span>
                <span>{readiness.ticket_issued ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void validateReady()} disabled={saving}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Validate ready
              </Button>
              <Button variant="outline" onClick={() => void clearValidation()} disabled={saving}>
                Clear validation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Missing Items</CardTitle>
            <CardDescription>What still needs to be completed before travel-ready validation can stand.</CardDescription>
          </CardHeader>
          <CardContent>
            {readiness.missing_items.length ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {readiness.missing_items.map((item) => (
                  <li key={item} className="rounded-md border p-3">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No missing items. This pilgrim is operationally complete.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle>Blockers</CardTitle>
            </div>
            <CardDescription>Issues that still require support or staff intervention.</CardDescription>
          </CardHeader>
          <CardContent>
            {readiness.blockers.length ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {readiness.blockers.map((item) => (
                  <li key={item} className="rounded-md border p-3">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No explicit blockers are active on this readiness record.</p>
            )}
            {readiness.blocking_reason ? (
              <div className="mt-4 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Blocking reason</p>
                <p className="mt-2 whitespace-pre-wrap">{readiness.blocking_reason}</p>
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              <Label htmlFor="validated-at">Validated at</Label>
              <Input id="validated-at" value={readiness.validated_at || "Not yet validated"} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
