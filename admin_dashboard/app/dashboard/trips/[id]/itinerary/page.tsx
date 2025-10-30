"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  MapPin,
  AlertCircle,
  Save,
} from "lucide-react"
import { TripService } from "@/lib/api/services/trips"
import { useAuth } from "@/hooks/useAuth"
import type { ItineraryItem } from "@/types/models"

const itineraryItemSchema = z.object({
  dayNumber: z.string().min(1).transform(val => parseInt(val)),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
})

type ItineraryItemFormData = z.infer<typeof itineraryItemSchema>

export default function ItineraryBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const form = useForm<ItineraryItemFormData>({
    resolver: zodResolver(itineraryItemSchema),
    defaultValues: {
      dayNumber: "1",
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "",
      location: "",
    },
  })

  useEffect(() => {
    loadItinerary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const loadItinerary = async () => {
    try {
      setLoading(true)
      const response = await TripService.getItinerary(tripId, accessToken)
      if (response.success && response.data) {
        setItems(response.data)
      }
    } catch (err) {
      console.error("Error loading itinerary:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ItineraryItemFormData) => {
    try {
      setSaving(true)
      setError(null)

      const response = await TripService.addItineraryItem(tripId, data, accessToken)

      if (response.success) {
        await loadItinerary()
        setShowForm(false)
        form.reset()
      } else {
        setError(response.error || "Failed to add itinerary item")
      }
    } catch (err) {
      console.error("Error adding item:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to add item"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this itinerary item?")) return

    try {
      const response = await TripService.deleteItineraryItem(tripId, itemId, accessToken)
      if (response.success) {
        await loadItinerary()
      }
    } catch (err) {
      console.error("Error deleting item:", err)
    }
  }

  const groupedByDay = items.reduce((acc, item) => {
    const day = item.dayNumber
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {} as Record<number, ItineraryItem[]>)

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Itinerary Builder</h1>
            <p className="mt-2 text-muted-foreground">
              Create and manage the day-by-day schedule
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
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

      {/* Add Item Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Itinerary Item</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dayNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day Number *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Masjid al-Haram" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tawaf, Umrah, Ziyarat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this activity..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Adding..." : "Add Item"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Itinerary Items */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : Object.keys(groupedByDay).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No itinerary items yet. Add your first item to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDay)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([day, dayItems]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-lg">Day {day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <GripVertical className="mt-1 h-5 w-5 text-muted-foreground cursor-move" />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              
                              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                {item.startTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{item.startTime}</span>
                                    {item.endTime && <span> - {item.endTime}</span>}
                                  </div>
                                )}
                                {item.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{item.location}</span>
                                  </div>
                                )}
                              </div>

                              {item.description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

