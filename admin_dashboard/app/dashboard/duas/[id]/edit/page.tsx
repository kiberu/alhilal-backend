"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { DuaService } from "@/lib/api/services/duas"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

const duaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleArabic: z.string().min(1, "Arabic title is required"),
  content: z.string().min(1, "Content is required"),
  contentArabic: z.string().min(1, "Arabic content is required"),
  transliteration: z.string().optional(),
  category: z.enum(["GENERAL", "TRAVEL", "PRAYER", "HEALTH", "FORGIVENESS", "GUIDANCE", "GRATITUDE"]),
  reference: z.string().optional(),
  orderIndex: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Order must be a valid positive number",
  }),
})

type DuaFormData = z.infer<typeof duaSchema>

export default function EditDuaPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const duaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DuaFormData>({
    resolver: zodResolver(duaSchema),
  })

  const selectedCategory = watch("category")

  useEffect(() => {
    if (duaId) {
      loadDuaData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duaId])

  const loadDuaData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await DuaService.get(duaId, accessToken)

      if (response.success && response.data) {
        const dua = response.data
        reset({
          title: dua.title || "",
          titleArabic: dua.titleArabic || "",
          content: dua.content || "",
          contentArabic: dua.contentArabic || "",
          transliteration: dua.transliteration || "",
          category: dua.category || "GENERAL",
          reference: dua.reference || "",
          orderIndex: String(dua.orderIndex || 0),
        })
      } else {
        setError(response.error || "Failed to load dua")
      }
    } catch (err) {
      console.error("Error loading dua:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load dua"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: DuaFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const duaData = {
        ...data,
        orderIndex: parseInt(data.orderIndex),
      }

      const response = await DuaService.update(duaId, duaData, accessToken)

      if (response.success) {
        router.push(`/dashboard/duas/${duaId}`)
      } else {
        setError(response.error || "Failed to update dua")
      }
    } catch (err) {
      console.error("Error updating dua:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update dua"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
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
          Back to Dua
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Edit Dua</h1>
        <p className="mt-2 text-muted-foreground">
          Update dua information
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* English Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>English Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter English title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setValue("category", value as "GENERAL" | "TRAVEL" | "PRAYER" | "HEALTH" | "FORGIVENESS" | "GUIDANCE" | "GRATITUDE")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRAVEL">Travel</SelectItem>
                      <SelectItem value="PRAYER">Prayer</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter English translation"
                  rows={6}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Arabic Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Arabic Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titleArabic">
                  Arabic Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titleArabic"
                  {...register("titleArabic")}
                  placeholder="أدخل العنوان بالعربية"
                  dir="rtl"
                  className="font-arabic text-lg"
                />
                {errors.titleArabic && (
                  <p className="text-sm text-red-500">{errors.titleArabic.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentArabic">
                  Arabic Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="contentArabic"
                  {...register("contentArabic")}
                  placeholder="أدخل المحتوى بالعربية"
                  rows={6}
                  dir="rtl"
                  className="font-arabic text-lg"
                />
                {errors.contentArabic && (
                  <p className="text-sm text-red-500">{errors.contentArabic.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transliteration">Transliteration</Label>
                <Textarea
                  id="transliteration"
                  {...register("transliteration")}
                  placeholder="Enter phonetic transliteration (optional)"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    {...register("reference")}
                    placeholder="e.g., Sahih Bukhari 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">
                    Display Order <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    min="0"
                    {...register("orderIndex")}
                  />
                  {errors.orderIndex && (
                    <p className="text-sm text-red-500">{errors.orderIndex.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

