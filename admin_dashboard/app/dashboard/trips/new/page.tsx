"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { TripService } from "@/lib/api/services/trips"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { PhotoUpload } from "@/components/shared"

const tripSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code must be less than 20 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  cities: z.string().min(1, "At least one city is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "ARCHIVED"]),
  coverImage: z.string().optional(),
  operatorNotes: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end >= start
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
})

type TripFormData = z.infer<typeof tripSchema>

export default function NewTripPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      code: "",
      name: "",
      cities: "",
      startDate: "",
      endDate: "",
      visibility: "PUBLIC",
      coverImage: "",
      operatorNotes: "",
    },
  })

  const onSubmit = async (data: TripFormData) => {
    try {
      setLoading(true)
      setError(null)

      // Transform cities from comma-separated string to array
      const citiesArray = data.cities
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean)

      const tripData = {
        ...data,
        cities: citiesArray,
      }

      const response = await TripService.create(tripData, accessToken)

      if (response.success && response.data) {
        toast.success("Trip created successfully")
        router.push(`/dashboard/trips/${response.data.id}`)
      } else {
        const errorMessage = response.error || "Failed to create trip"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error creating trip:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create trip"
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
          Back to Trips
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Trip</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new trip with its details and configuration
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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for this trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., UMR2025-001"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this trip
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls who can see this trip
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Umrah Package - December 2025"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The display name for this trip
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cities *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Makkah, Madinah"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of cities included in this trip
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PhotoUpload
                        label="Cover Image"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Upload trip cover image"
                        maxSize={5}
                        folder="trips/covers"
                        required={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a cover image for this trip (optional, max 5MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operator Notes</CardTitle>
              <CardDescription>
                Internal notes for staff only (not visible to pilgrims)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="operatorNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any internal notes about this trip..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
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
              {loading ? "Creating..." : "Create Trip"}
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

