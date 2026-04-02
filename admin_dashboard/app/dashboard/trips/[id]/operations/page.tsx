"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Package2, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { MilestoneService, ResourceService, TripService, UserService } from "@/lib/api/services"
import type {
  CreateTripMilestoneData,
  CreateTripResourceData,
  TripFullDetails,
  TripMilestone,
  TripResource,
  User,
} from "@/types/models"
import { toast } from "sonner"

const MILESTONE_STATUS_OPTIONS = [
  "NOT_STARTED",
  "SCHEDULED",
  "ON_TRACK",
  "AT_RISK",
  "BLOCKED",
  "DONE",
  "CANCELLED",
] as const

const MILESTONE_TYPE_OPTIONS = [
  "HOTEL_BOOKING",
  "AIRLINE_BOOKING",
  "DOCUMENT_COLLECTION",
  "DOCUMENT_REVIEW",
  "DARASA",
  "VISA",
  "PAYMENT_TARGET",
  "TICKETS",
  "SEND_OFF",
  "TRAVEL_READY",
  "DEPARTURE",
  "ARRIVAL",
  "POST_TRIP",
] as const

const RESOURCE_TYPE_OPTIONS = [
  "UMRAH_GUIDE",
  "DUA_BOOKLET",
  "DAILY_PROGRAM",
  "CHECKLIST",
  "POST_TRIP_MODULE",
  "OTHER",
] as const

const VIEWER_MODE_OPTIONS = ["VIEW_ONLY", "DOWNLOADABLE"] as const

const EMPTY_MILESTONE_FORM: CreateTripMilestoneData = {
  trip: "",
  package: null,
  milestoneType: "DOCUMENT_COLLECTION",
  title: "",
  status: "NOT_STARTED",
  targetDate: null,
  actualDate: null,
  notes: "",
  owner: null,
  isPublic: false,
  order: 0,
}

const EMPTY_RESOURCE_FORM: CreateTripResourceData & { metadataText: string } = {
  trip: "",
  package: null,
  title: "",
  description: "",
  resourceType: "UMRAH_GUIDE",
  order: 0,
  filePublicId: "",
  fileFormat: "pdf",
  fileUrl: "",
  viewerMode: "VIEW_ONLY",
  metadata: {},
  metadataText: "{}",
  isPinned: false,
  publishedAt: null,
}

function parseMetadata(metadataText: string): Record<string, unknown> {
  if (!metadataText.trim()) return {}
  return JSON.parse(metadataText) as Record<string, unknown>
}

export default function TripOperationsPage() {
  const params = useParams()
  const router = useRouter()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [trip, setTrip] = useState<TripFullDetails | null>(null)
  const [milestones, setMilestones] = useState<TripMilestone[]>([])
  const [resources, setResources] = useState<TripResource[]>([])
  const [staffUsers, setStaffUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [packageFilter, setPackageFilter] = useState<string>("all")
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<TripMilestone | null>(null)
  const [editingResource, setEditingResource] = useState<TripResource | null>(null)
  const [milestoneForm, setMilestoneForm] = useState(EMPTY_MILESTONE_FORM)
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE_FORM)

  useEffect(() => {
    if (!tripId) return
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, accessToken])

  async function loadData() {
    try {
      setLoading(true)

      const [tripResponse, milestoneResponse, resourceResponse, staffResponse] = await Promise.all([
        TripService.getById(tripId, accessToken),
        MilestoneService.list({ trip: tripId }, accessToken),
        ResourceService.list({ trip: tripId }, accessToken),
        UserService.getUsers({ role: "STAFF" }, accessToken),
      ])

      if (tripResponse.success && tripResponse.data) {
        setTrip(tripResponse.data)
      }
      if (milestoneResponse.success && milestoneResponse.data) {
        setMilestones(milestoneResponse.data)
      }
      if (resourceResponse.success && resourceResponse.data) {
        setResources(resourceResponse.data)
      }
      if (staffResponse.success) {
        setStaffUsers(staffResponse.data || [])
      }
    } catch (err) {
      console.error("Error loading trip operations:", err)
      toast.error(err instanceof Error ? err.message : "Failed to load trip operations")
    } finally {
      setLoading(false)
    }
  }

  const filteredMilestones = useMemo(
    () => milestones.filter((milestone) => packageFilter === "all" || milestone.package === packageFilter),
    [milestones, packageFilter]
  )

  const filteredResources = useMemo(
    () => resources.filter((resource) => packageFilter === "all" || resource.package === packageFilter),
    [resources, packageFilter]
  )

  function openCreateMilestone() {
    setEditingMilestone(null)
    setMilestoneForm({
      ...EMPTY_MILESTONE_FORM,
      trip: tripId,
      package: packageFilter === "all" ? null : packageFilter,
    })
    setMilestoneDialogOpen(true)
  }

  function openEditMilestone(milestone: TripMilestone) {
    setEditingMilestone(milestone)
    setMilestoneForm({
      trip: milestone.trip,
      package: milestone.package || null,
      milestoneType: milestone.milestoneType,
      title: milestone.title,
      status: milestone.status,
      targetDate: milestone.targetDate || null,
      actualDate: milestone.actualDate || null,
      notes: milestone.notes || "",
      owner: milestone.owner || null,
      isPublic: milestone.isPublic,
      order: milestone.order,
    })
    setMilestoneDialogOpen(true)
  }

  function openCreateResource() {
    setEditingResource(null)
    setResourceForm({
      ...EMPTY_RESOURCE_FORM,
      trip: tripId,
      package: packageFilter === "all" ? null : packageFilter,
    })
    setResourceDialogOpen(true)
  }

  function openEditResource(resource: TripResource) {
    setEditingResource(resource)
    setResourceForm({
      trip: resource.trip,
      package: resource.package || null,
      title: resource.title,
      description: resource.description || "",
      resourceType: resource.resourceType,
      order: resource.order,
      filePublicId: resource.filePublicId,
      fileFormat: resource.fileFormat || "",
      fileUrl: resource.fileUrl || "",
      viewerMode: resource.viewerMode,
      metadata: resource.metadata || {},
      metadataText: JSON.stringify(resource.metadata || {}, null, 2),
      isPinned: resource.isPinned,
      publishedAt: resource.publishedAt || null,
    })
    setResourceDialogOpen(true)
  }

  async function saveMilestone() {
    try {
      setSaving(true)
      const payload = { ...milestoneForm, trip: tripId }

      const response = editingMilestone
        ? await MilestoneService.update(editingMilestone.id, payload, accessToken)
        : await MilestoneService.create(payload, accessToken)

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to save milestone")
      }

      toast.success(editingMilestone ? "Milestone updated" : "Milestone created")
      setMilestoneDialogOpen(false)
      await loadData()
    } catch (err) {
      console.error("Error saving milestone:", err)
      toast.error(err instanceof Error ? err.message : "Failed to save milestone")
    } finally {
      setSaving(false)
    }
  }

  async function saveResource() {
    try {
      setSaving(true)
      const payload = {
        ...resourceForm,
        trip: tripId,
        metadata: parseMetadata(resourceForm.metadataText),
      }

      const response = editingResource
        ? await ResourceService.update(editingResource.id, payload, accessToken)
        : await ResourceService.create(payload, accessToken)

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to save resource")
      }

      toast.success(editingResource ? "Resource updated" : "Resource created")
      setResourceDialogOpen(false)
      await loadData()
    } catch (err) {
      console.error("Error saving resource:", err)
      toast.error(err instanceof Error ? err.message : "Failed to save resource")
    } finally {
      setSaving(false)
    }
  }

  async function deleteMilestone(milestoneId: string) {
    if (!confirm("Delete this milestone?")) return
    try {
      const response = await MilestoneService.delete(milestoneId, accessToken)
      if (!response.success) {
        throw new Error(response.error || "Failed to delete milestone")
      }
      toast.success("Milestone deleted")
      await loadData()
    } catch (err) {
      console.error("Error deleting milestone:", err)
      toast.error(err instanceof Error ? err.message : "Failed to delete milestone")
    }
  }

  async function deleteResource(resourceId: string) {
    if (!confirm("Delete this resource?")) return
    try {
      const response = await ResourceService.delete(resourceId, accessToken)
      if (!response.success) {
        throw new Error(response.error || "Failed to delete resource")
      }
      toast.success("Resource deleted")
      await loadData()
    } catch (err) {
      console.error("Error deleting resource:", err)
      toast.error(err instanceof Error ? err.message : "Failed to delete resource")
    }
  }

  async function togglePublish(resource: TripResource) {
    try {
      const response = resource.publishedAt
        ? await ResourceService.unpublish(resource.id, accessToken)
        : await ResourceService.publish(resource.id, accessToken)

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update publication state")
      }

      toast.success(resource.publishedAt ? "Resource unpublished" : "Resource published")
      await loadData()
    } catch (err) {
      console.error("Error toggling resource publication:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update publication state")
    }
  }

  if (loading || !trip) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/trips/${tripId}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Trip
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name} Operations</h1>
          <p className="mt-2 text-muted-foreground">
            Manage milestones and pilgrim-facing resources for this trip and its package variants.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trip content</SelectItem>
              {trip.packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push(`/dashboard/trips/${tripId}/edit`)}>
            Edit trip fields
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Trip Status</p>
            <p className="text-xl font-semibold">{trip.status || "DRAFT"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Packages</p>
            <p className="text-xl font-semibold">{trip.packages.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Milestones</p>
            <p className="text-xl font-semibold">{filteredMilestones.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Resources</p>
            <p className="text-xl font-semibold">{filteredResources.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>
                  Track hotel, airline, document, darasa, visa, payment, ticketing, send-off, travel-ready, departure, arrival, and post-trip operations.
                </CardDescription>
              </div>
              <Button onClick={openCreateMilestone}>
                <Plus className="mr-2 h-4 w-4" />
                Add milestone
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredMilestones.length ? filteredMilestones.map((milestone) => (
                <div key={milestone.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{milestone.title || milestone.milestoneType}</p>
                      <p className="text-sm text-muted-foreground">
                        {milestone.milestoneType} · {milestone.status} · {milestone.package ? trip.packages.find((pkg) => pkg.id === milestone.package)?.name || "Package" : "Trip-wide"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Target: {milestone.targetDate || "Not scheduled"} · Actual: {milestone.actualDate || "Not completed"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{milestone.notes || "No operator notes yet."}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Owner: {milestone.ownerName || "Unassigned"} · Public: {milestone.isPublic ? "Yes" : "No"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditMilestone(milestone)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void deleteMilestone(milestone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No milestones match the selected package filter yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Manage pilgrim-facing resources, publication state, package scoping, ordering, and metadata while keeping mobile reads limited to published items.
                </CardDescription>
              </div>
              <Button onClick={openCreateResource}>
                <Plus className="mr-2 h-4 w-4" />
                Add resource
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredResources.length ? filteredResources.map((resource) => (
                <div key={resource.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{resource.title}</p>
                        {resource.isPinned ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {resource.resourceType} · {resource.viewerMode} · {resource.package ? trip.packages.find((pkg) => pkg.id === resource.package)?.name || "Package" : "Trip-wide"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{resource.description || "No description yet."}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        File: {resource.filePublicId} · Published: {resource.publishedAt ? "Yes" : "No"} · Order: {resource.order}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => void togglePublish(resource)}>
                        {resource.publishedAt ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditResource(resource)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => void deleteResource(resource.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  No resources match the selected package filter yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Create Milestone"}</DialogTitle>
            <DialogDescription>Use trip-wide scope when the milestone applies to every package.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Package Scope</Label>
                <Select value={milestoneForm.package || "trip"} onValueChange={(value) => setMilestoneForm((current) => ({ ...current, package: value === "trip" ? null : value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trip">Trip-wide</SelectItem>
                    {trip.packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Milestone Type</Label>
                <Select value={milestoneForm.milestoneType} onValueChange={(value) => setMilestoneForm((current) => ({ ...current, milestoneType: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MILESTONE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={milestoneForm.title} onChange={(event) => setMilestoneForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={milestoneForm.status} onValueChange={(value) => setMilestoneForm((current) => ({ ...current, status: value as CreateTripMilestoneData["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MILESTONE_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={milestoneForm.targetDate || ""} onChange={(event) => setMilestoneForm((current) => ({ ...current, targetDate: event.target.value || null }))} />
              </div>
              <div className="space-y-2">
                <Label>Actual Date</Label>
                <Input type="date" value={milestoneForm.actualDate || ""} onChange={(event) => setMilestoneForm((current) => ({ ...current, actualDate: event.target.value || null }))} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={milestoneForm.order || 0} onChange={(event) => setMilestoneForm((current) => ({ ...current, order: Number(event.target.value || 0) }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={milestoneForm.owner || "unassigned"} onValueChange={(value) => setMilestoneForm((current) => ({ ...current, owner: value === "unassigned" ? null : value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <input
                  id="milestone-public"
                  type="checkbox"
                  checked={Boolean(milestoneForm.isPublic)}
                  onChange={(event) => setMilestoneForm((current) => ({ ...current, isPublic: event.target.checked }))}
                />
                <Label htmlFor="milestone-public">Visible to pilgrims</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={milestoneForm.notes || ""} rows={5} onChange={(event) => setMilestoneForm((current) => ({ ...current, notes: event.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveMilestone()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Create Resource"}</DialogTitle>
            <DialogDescription>Published resources power the pilgrim app and support endpoints. Leave published blank to keep a draft resource hidden.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Package Scope</Label>
                <Select value={resourceForm.package || "trip"} onValueChange={(value) => setResourceForm((current) => ({ ...current, package: value === "trip" ? null : value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trip">Trip-wide</SelectItem>
                    {trip.packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select value={resourceForm.resourceType} onValueChange={(value) => setResourceForm((current) => ({ ...current, resourceType: value as CreateTripResourceData["resourceType"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={resourceForm.title} onChange={(event) => setResourceForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Viewer Mode</Label>
                <Select value={resourceForm.viewerMode} onValueChange={(value) => setResourceForm((current) => ({ ...current, viewerMode: value as CreateTripResourceData["viewerMode"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIEWER_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={resourceForm.description || ""} rows={4} onChange={(event) => setResourceForm((current) => ({ ...current, description: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>File Public ID</Label>
                <Input value={resourceForm.filePublicId} onChange={(event) => setResourceForm((current) => ({ ...current, filePublicId: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>File Format</Label>
                <Input value={resourceForm.fileFormat || ""} onChange={(event) => setResourceForm((current) => ({ ...current, fileFormat: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={resourceForm.order || 0} onChange={(event) => setResourceForm((current) => ({ ...current, order: Number(event.target.value || 0) }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Direct File URL</Label>
                <Input value={resourceForm.fileUrl || ""} onChange={(event) => setResourceForm((current) => ({ ...current, fileUrl: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Published At</Label>
                <Input type="datetime-local" value={resourceForm.publishedAt ? resourceForm.publishedAt.slice(0, 16) : ""} onChange={(event) => setResourceForm((current) => ({ ...current, publishedAt: event.target.value ? new Date(event.target.value).toISOString() : null }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Metadata (JSON)</Label>
              <Textarea value={resourceForm.metadataText} rows={6} onChange={(event) => setResourceForm((current) => ({ ...current, metadataText: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <input
                  id="resource-pinned"
                  type="checkbox"
                  checked={Boolean(resourceForm.isPinned)}
                  onChange={(event) => setResourceForm((current) => ({ ...current, isPinned: event.target.checked }))}
                />
                <Label htmlFor="resource-pinned">Pinned for pilgrims</Label>
              </div>
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                Publication is controlled by the timestamp above or the publish/unpublish action from the list.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveResource()} disabled={saving}>
              <Package2 className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
