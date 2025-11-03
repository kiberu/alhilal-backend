"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react"
import { ItineraryService } from "@/lib/api/services/trip-content"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface ItineraryItem {
  id: string
  trip: string
  dayIndex: number
  startTime?: string
  endTime?: string
  title: string
  location?: string
  notes?: string
  attachPublicId?: string
  attachUrl?: string
  createdAt: string
  updatedAt: string
}

export default function ItineraryPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tripId) {
      loadItinerary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const loadItinerary = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ItineraryService.list(tripId, accessToken)

      if (response.success && response.data) {
        // Handle paginated response (with results array) or direct array
        const dataArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).results || []
        
        // Sort by dayIndex
        const sorted = [...dataArray].sort((a, b) => a.dayIndex - b.dayIndex)
        setItems(sorted)
      } else {
        setError(response.error || "Failed to load itinerary")
        toast.error(response.error || "Failed to load itinerary")
      }
    } catch (err) {
      console.error("Error loading itinerary:", err)
      const errorMessage = "Failed to load itinerary"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp

    // Update dayIndex for both items
    newItems[index].dayIndex = index + 1
    newItems[index - 1].dayIndex = index

    setItems(newItems)

    try {
      await ItineraryService.reorder(
        newItems.map((item, idx) => ({ id: item.id, dayIndex: idx + 1 })),
        accessToken
      )
      toast.success("Itinerary reordered")
    } catch (err) {
      toast.error("Failed to reorder itinerary")
      loadItinerary() // Reload on failure
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp

    // Update dayIndex
    newItems[index].dayIndex = index + 1
    newItems[index + 1].dayIndex = index + 2

    setItems(newItems)

    try {
      await ItineraryService.reorder(
        newItems.map((item, idx) => ({ id: item.id, dayIndex: idx + 1 })),
        accessToken
      )
      toast.success("Itinerary reordered")
    } catch (err) {
      toast.error("Failed to reorder itinerary")
      loadItinerary()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this itinerary item?")) return

    try {
      const response = await ItineraryService.delete(id, accessToken)
      if (response.success) {
        toast.success("Itinerary item deleted")
        loadItinerary()
      } else {
        toast.error(response.error || "Failed to delete item")
      }
    } catch (err) {
      toast.error("Failed to delete item")
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
            <h1 className="text-3xl font-bold tracking-tight">Trip Itinerary</h1>
            <p className="mt-2 text-muted-foreground">
              Manage day-by-day schedule for this trip
            </p>
          </div>

          <Button onClick={() => router.push(`/dashboard/trips/${tripId}/itinerary/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
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

      {/* Itinerary Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No itinerary items yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first itinerary item to get started
            </p>
            <Button onClick={() => router.push(`/dashboard/trips/${tripId}/itinerary/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="flex items-start gap-4 p-6">
                {/* Reorder Controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Day Badge */}
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    D{item.dayIndex}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                    {item.startTime && item.endTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  )}

                  {item.attachUrl && (
                    <div className="mt-2">
                      <a
                        href={item.attachUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/trips/${tripId}/itinerary/${item.id}/edit`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
