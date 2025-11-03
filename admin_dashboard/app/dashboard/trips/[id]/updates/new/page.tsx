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
import { Checkbox } from "@/components/ui/checkbox"
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
import { TripUpdateService } from "@/lib/api/services/trip-content"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

const updateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  bodyMd: z.string().min(10, "Body must be at least 10 characters"),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  pinned: z.boolean(),
  publishAt: z.string().min(1, "Publish date is required"),
  attachUrl: z.string().url().optional().or(z.literal("")),
})

type UpdateFormData = z.infer<typeof updateSchema>

export default function NewTripUpdatePage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      bodyMd: "",
      urgency: "NORMAL",
      pinned: false,
      publishAt: new Date().toISOString().slice(0, 16), // Current datetime
      attachUrl: "",
    },
  })

  const onSubmit = async (data: UpdateFormData) => {
    try {
      setLoading(true)
      setError(null)

      const updateData = {
        trip: tripId,
        title: data.title,
        bodyMd: data.bodyMd,
        urgency: data.urgency,
        pinned: data.pinned,
        publishAt: data.publishAt,
        attachUrl: data.attachUrl || null,
      }

      const response = await TripUpdateService.create(updateData, accessToken)

      if (response.success) {
        toast.success("Update created successfully")
        router.push(`/dashboard/trips/${tripId}/updates`)
      } else {
        setError(response.error || "Failed to create update")
        toast.error("Failed to create update")
      }
    } catch (err) {
      console.error("Error creating update:", err)
      setError("Failed to create update")
      toast.error("Failed to create update")
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
          Back to Updates
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Update</h1>
        <p className="mt-2 text-muted-foreground">
          Post a new announcement or update for pilgrims
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
              <CardTitle>Update Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Important: Flight Schedule Change"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief headline for the update
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyMd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your announcement here... (Markdown supported)"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Full update message. You can use markdown formatting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Priority level for this update
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date & Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        When to publish this update
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Pin this update
                      </FormLabel>
                      <FormDescription>
                        Pinned updates appear at the top of the list
                      </FormDescription>
                    </div>
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
                      Optional link to document, image, or resource
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
              {loading ? "Creating..." : "Create Update"}
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

