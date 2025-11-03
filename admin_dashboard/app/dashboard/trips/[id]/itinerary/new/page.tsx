"use client"

import { useState } from "react"
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

export default function NewItineraryItemPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [loading, setLoading] = useState(false)
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

  const onSubmit = async (data: ItineraryFormData) => {
    try {
      setLoading(true)
      setError(null)

      // Convert time strings (HH:mm) to datetime strings (ISO 8601)
      // Use a reference date (2024-01-01) + day offset for the datetime
      const convertTimeToDatetime = (timeStr: string | undefined, dayIndex: number): string | null => {
        if (!timeStr) return null
        // Use a base date and add days based on day_index
        const baseDate = new Date('2024-01-01')
        baseDate.setDate(baseDate.getDate() + dayIndex - 1)
        const [hours, minutes] = timeStr.split(':').map(Number)
        baseDate.setHours(hours, minutes, 0, 0)
        return baseDate.toISOString()
      }

      const dayIdx = parseInt(data.dayIndex)
      const itineraryData = {
        trip: tripId,
        dayIndex: dayIdx,
        title: data.title,
        startTime: convertTimeToDatetime(data.startTime, dayIdx),
        endTime: convertTimeToDatetime(data.endTime, dayIdx),
        location: data.location || null,
        notes: data.notes || null,
        attachUrl: data.attachUrl || null,
      }

      const response = await ItineraryService.create(itineraryData, accessToken)

      if (response.success) {
        toast.success("Itinerary item created")
        router.push(`/dashboard/trips/${tripId}/itinerary`)
      } else {
        // Handle field-level validation errors
        handleFormErrors(form.setError, response)
        
        const errorMessage = getErrorMessage(response, "Failed to create itinerary item")
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err: any) {
      console.error("Error creating itinerary item:", err)
      
      // Handle field-level validation errors
      handleFormErrors(form.setError, err)
      
      const errorMessage = getErrorMessage(err, "Failed to create itinerary item")
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Add Itinerary Item</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new activity or event to the trip schedule
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
                        placeholder="e.g., Morning Prayer at Masjid al-Haram"
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
                        placeholder="e.g., Masjid al-Haram, Makkah"
                        {...field}
                      />
                    </FormControl>
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
                        placeholder="Add any additional details or instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
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
                      Optional link to map, document, or image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

