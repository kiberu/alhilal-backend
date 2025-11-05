"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Pin,
  PinOff,
  AlertCircle,
  Bell,
  Clock,
} from "lucide-react"
import { TripUpdateService } from "@/lib/api/services/trip-content"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface TripUpdate {
  id: string
  trip: string
  package?: string | null
  title: string
  bodyMd: string
  urgency: "LOW" | "NORMAL" | "HIGH" | "URGENT"
  pinned: boolean
  publishAt: string
  attachPublicId?: string
  attachUrl?: string
  createdAt: string
  updatedAt: string
}

const urgencyColors = {
  LOW: "bg-slate-100 text-slate-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export default function TripUpdatesPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [updates, setUpdates] = useState<TripUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tripId) {
      loadUpdates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const loadUpdates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await TripUpdateService.list(tripId, accessToken)

      if (response.success && response.data) {
        // Sort: pinned first, then by publishAt desc
        const sorted = [...response.data].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
        })
        setUpdates(sorted)
      } else {
        setError(response.error || "Failed to load updates")
      }
    } catch (err) {
      console.error("Error loading updates:", err)
      setError("Failed to load updates")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePin = async (updateId: string, currentlyPinned: boolean) => {
    try {
      const response = await TripUpdateService.togglePin(updateId, accessToken)
      if (response.success) {
        toast.success(currentlyPinned ? "Update unpinned" : "Update pinned")
        loadUpdates()
      } else {
        toast.error("Failed to toggle pin")
      }
    } catch (err) {
      toast.error("Failed to toggle pin")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return

    try {
      const response = await TripUpdateService.delete(id, accessToken)
      if (response.success) {
        toast.success("Update deleted")
        loadUpdates()
      } else {
        toast.error(response.error || "Failed to delete update")
      }
    } catch (err) {
      toast.error("Failed to delete update")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trip
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trip Updates</h1>
            <p className="mt-2 text-muted-foreground">
              Post announcements and updates for pilgrims
            </p>
          </div>

          <Button onClick={() => router.push(`/dashboard/trips/${tripId}/updates/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Update
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Updates List */}
      {updates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No updates yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first update to keep pilgrims informed
            </p>
            <Button onClick={() => router.push(`/dashboard/trips/${tripId}/updates/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Update
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className={update.pinned ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {update.pinned && (
                        <Pin className="h-4 w-4 text-primary fill-primary" />
                      )}
                      <CardTitle className="text-xl">{update.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(update.publishAt, "MMM dd, yyyy 'at' HH:mm")}
                      </div>
                      <Badge
                        variant="secondary"
                        className={urgencyColors[update.urgency]}
                      >
                        {update.urgency}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePin(update.id, update.pinned)}
                    >
                      {update.pinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/trips/${tripId}/updates/${update.id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(update.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {/* Simple markdown rendering - could be enhanced with a markdown library */}
                  {update.bodyMd.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2">{line}</p>
                  ))}
                </div>

                {update.attachUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={update.attachUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

