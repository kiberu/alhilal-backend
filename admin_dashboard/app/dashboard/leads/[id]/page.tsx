"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { LeadService } from "@/lib/api/services/leads"
import { formatDate } from "@/lib/utils"
import type { Lead, LeadStatus, UpdateLeadData, User } from "@/types/models"
import { UserService } from "@/lib/api/services/users"

const STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLOSED", label: "Closed" },
]

export default function LeadDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { accessToken } = useAuth()
  const leadId = params.id as string
  const [lead, setLead] = useState<Lead | null>(null)
  const [staffUsers, setStaffUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<UpdateLeadData>({
    status: "NEW",
    assignedTo: null,
    followUpNotes: "",
    contactedAt: null,
  })

  useEffect(() => {
    if (!leadId) return
    void Promise.all([loadLead(), loadStaffUsers()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, accessToken])

  const loadLead = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await LeadService.get(leadId, accessToken)
      if (response.success && response.data) {
        setLead(response.data)
        setFormState({
          status: response.data.status,
          assignedTo: response.data.assignedTo || null,
          followUpNotes: response.data.followUpNotes || "",
          contactedAt: response.data.contactedAt || null,
        })
      } else {
        setError(response.error || "Failed to load lead")
      }
    } catch (err) {
      console.error("Error loading lead:", err)
      setError(err instanceof Error ? err.message : "Failed to load lead")
    } finally {
      setLoading(false)
    }
  }

  const loadStaffUsers = async () => {
    try {
      const response = await UserService.getUsers({ role: "STAFF" }, accessToken)
      if (response.success && response.data) {
        const users = Array.isArray(response.data) ? response.data : []
        setStaffUsers(users.filter((user) => user.role === "STAFF"))
      }
    } catch (err) {
      console.error("Error loading staff users:", err)
    }
  }

  const canMarkContacted = useMemo(() => formState.status === "CONTACTED" && !formState.contactedAt, [formState])

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload: UpdateLeadData = {
        ...formState,
        contactedAt: canMarkContacted ? new Date().toISOString() : formState.contactedAt || null,
      }
      const response = await LeadService.update(leadId, payload, accessToken)
      if (response.success && response.data) {
        setLead(response.data)
        setFormState({
          status: response.data.status,
          assignedTo: response.data.assignedTo || null,
          followUpNotes: response.data.followUpNotes || "",
          contactedAt: response.data.contactedAt || null,
        })
        toast.success("Lead updated")
      } else {
        toast.error(response.error || "Failed to update lead")
      }
    } catch (err) {
      console.error("Error updating lead:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update lead")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || "Lead not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/leads")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Leads
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {lead.interestType === "GUIDE_REQUEST" ? "Planning guide request" : "Consultation lead"} from {lead.source}
          </p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          Save follow-up
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>Captured directly from the public website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="font-medium">Phone:</span> {lead.phone}</p>
            <p><span className="font-medium">Email:</span> {lead.email || "Not provided"}</p>
            <p><span className="font-medium">Travel window:</span> {lead.travelWindow || "Not provided"}</p>
            <p><span className="font-medium">Trip:</span> {lead.tripName || "General enquiry"}</p>
            <p><span className="font-medium">Page path:</span> {lead.pagePath}</p>
            <p><span className="font-medium">Context:</span> {lead.contextLabel}</p>
            <p><span className="font-medium">CTA:</span> {lead.ctaLabel}</p>
            <p><span className="font-medium">Campaign:</span> {lead.campaign || "None"}</p>
            <p><span className="font-medium">Referrer:</span> {lead.referrer || "Direct / unavailable"}</p>
            <p><span className="font-medium">Created:</span> {formatDate(lead.createdAt, "MMM dd, yyyy HH:mm")}</p>
            <p><span className="font-medium">Last updated:</span> {formatDate(lead.updatedAt, "MMM dd, yyyy HH:mm")}</p>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Lead notes</p>
              <p className="mt-2 text-muted-foreground">{lead.notes || "No notes were provided on submission."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up</CardTitle>
            <CardDescription>Track owner, status, and the latest human notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead-status">Status</Label>
                <Select value={formState.status} onValueChange={(value) => setFormState((current) => ({ ...current, status: value as LeadStatus }))}>
                  <SelectTrigger id="lead-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-assignee">Assigned staff member</Label>
                <Select value={formState.assignedTo || "unassigned"} onValueChange={(value) => setFormState((current) => ({ ...current, assignedTo: value === "unassigned" ? null : value }))}>
                  <SelectTrigger id="lead-assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-contacted-at">Contacted at</Label>
              <Input
                id="lead-contacted-at"
                type="datetime-local"
                value={formState.contactedAt ? new Date(formState.contactedAt).toISOString().slice(0, 16) : ""}
                onChange={(event) => setFormState((current) => ({
                  ...current,
                  contactedAt: event.target.value ? new Date(event.target.value).toISOString() : null,
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-follow-up-notes">Follow-up notes</Label>
              <Textarea
                id="lead-follow-up-notes"
                rows={10}
                value={formState.followUpNotes || ""}
                onChange={(event) => setFormState((current) => ({ ...current, followUpNotes: event.target.value }))}
                placeholder="Document the last conversation, guide send action, pricing context, or next follow-up."
              />
            </div>

            <div className="grid gap-3 rounded-lg border p-4 text-sm text-muted-foreground md:grid-cols-2">
              <div>
                <p className="font-medium text-foreground">UTM source</p>
                <p>{lead.utmSource || "None"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">UTM medium</p>
                <p>{lead.utmMedium || "None"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">UTM campaign</p>
                <p>{lead.utmCampaign || "None"}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">UTM content</p>
                <p>{lead.utmContent || "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
