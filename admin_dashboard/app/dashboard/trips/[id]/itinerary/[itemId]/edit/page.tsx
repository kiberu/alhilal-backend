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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { ItineraryService } from "@/lib/api/services/trip-content"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { handleFormErrors, getErrorMessage } from "@/lib/form-utils"
import { Skeleton } from "@/components/ui/skeleton"

const itinerarySchema = z.object({
  dayIndex: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Day must be a positive number",
  }),
  title: z.string().min(3, "Title must be at least 3 characters"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  attachUrl: z.string().url().optional().or(z.literal("")),
}).refine((data) => {
  // If both times are provided, ensure end time is after start time
  if (data.startTime && data.endTime) {
    return data.endTime >= data.startTime
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})

type ItineraryFormData = z.infer<typeof itinerarySchema>

export default function EditItineraryItemPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string
  const itemId = params.itemId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ItineraryFormData>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      dayIndex: "1",
      title: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
      attachUrl: "",
    },
  })

  useEffect(() => {
    if (itemId) {
      loadItineraryItem()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  const loadItineraryItem = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ItineraryService.get(itemId, accessToken)

      if (response.success && response.data) {
        const item = response.data
        
        // Convert datetime to time string (HH:mm)
        const datetimeToTime = (datetimeStr: string | null | undefined): string => {
          if (!datetimeStr) return ""
          const date = new Date(datetimeStr)
          return date.toTimeString().slice(0, 5) // "HH:mm"
        }

        form.reset({
          dayIndex: String(item.dayIndex || item.day_index || 1),
          title: item.title || "",
          startTime: datetimeToTime(item.startTime || item.start_time),
          endTime: datetimeToTime(item.endTime || item.end_time),
          location: item.location || "",
          notes: item.notes || "",
          attachUrl: item.attachUrl || item.attach_url || "",
        })
      } else {
        const errorMessage = getErrorMessage(response, "Failed to load itinerary item")
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err: any) {
      console.error("Error loading itinerary item:", err)
      const errorMessage = getErrorMessage(err, "Failed to load itinerary item")
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ItineraryFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Convert time strings (HH:mm) to datetime strings (ISO 8601)
      const convertTimeToDatetime = (timeStr: string | undefined, dayIndex: number): string | null => {
        if (!timeStr) return null
        const baseDate = new Date('2024-01-01')
        baseDate.setDate(baseDate.getDate() + dayIndex - 1)
        const [hours, minutes] = timeStr.split(':').map(Number)
        baseDate.setHours(hours, minutes, 0, 0)
        return baseDate.toISOString()
      }

      const dayIdx = parseInt(data.dayIndex)
      const itineraryData = {
        dayIndex: dayIdx,
        title: data.title,
        startTime: convertTimeToDatetime(data.startTime, dayIdx),
        endTime: convertTimeToDatetime(data.endTime, dayIdx),
        location: data.location || null,
        notes: data.notes || null,
        attachUrl: data.attachUrl || null,
      }

      const response = await ItineraryService.update(itemId, itineraryData, accessToken)

      if (response.success) {
        toast.success("Itinerary item updated")
        router.push(`/dashboard/trips/${tripId}/itinerary`)
      } else {
        handleFormErrors(form.setError, response)
        const errorMessage = getErrorMessage(response, "Failed to update itinerary item")
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err: any) {
      console.error("Error updating itinerary item:", err)
      handleFormErrors(form.setError, err)
      const errorMessage = getErrorMessage(err, "Failed to update itinerary item")
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
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
          Back to Itinerary
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Itinerary Item</h1>
        <p className="mt-2 text-muted-foreground">
          Update the activity or event details
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="dayIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Trip day number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional
                      </FormDescription>
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
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional
                      </FormDescription>
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
                      <Input
                        placeholder="e.g., Depart from Airport, Visit Kaaba"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of the activity
                    </FormDescription>
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
                      <Input
                        placeholder="e.g., Masjid al-Haram, Mina"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Where this activity takes place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details, instructions, or important information"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed information for pilgrims
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachment URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to map, document, or other resource
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Updating..." : "Update Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}



