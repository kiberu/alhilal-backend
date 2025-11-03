"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"

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

export default function NewDuaPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DuaFormData>({
    resolver: zodResolver(duaSchema),
    defaultValues: {
      category: "GENERAL",
      orderIndex: "0",
    },
  })

  const selectedCategory = watch("category")

  const onSubmit = async (data: DuaFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const duaData = {
        ...data,
        orderIndex: parseInt(data.orderIndex),
      }

      const response = await DuaService.create(duaData, accessToken)

      if (response.success && response.data) {
        toast.success("Dua created successfully")
        router.push(`/dashboard/duas/${response.data.id}`)
      } else {
        const errorMessage = response.error || "Failed to create dua"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error creating dua:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create dua"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
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
          Back to Duas
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Create New Dua</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new prayer or supplication
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
                {errors.transliteration && (
                  <p className="text-sm text-red-500">{errors.transliteration.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    {...register("reference")}
                    placeholder="e.g., Sahih Bukhari 123"
                  />
                  {errors.reference && (
                    <p className="text-sm text-red-500">{errors.reference.message}</p>
                  )}
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
                    placeholder="0"
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
            {isSubmitting ? "Creating..." : "Create Dua"}
          </Button>
        </div>
      </form>
    </div>
  )
}

