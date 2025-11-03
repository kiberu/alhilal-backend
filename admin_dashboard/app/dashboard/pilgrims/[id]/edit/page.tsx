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
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const pilgrimSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(2, "Nationality is required").max(2, "Use 2-letter country code"),
  address: z.string().optional(),
  emergencyName: z.string().min(2, "Emergency contact name is required"),
  emergencyPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyRelationship: z.string().optional(),
  medicalConditions: z.string().optional(),
})

type PilgrimFormData = z.infer<typeof pilgrimSchema>

export default function EditPilgrimPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const pilgrimId = params.id as string

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
  } = useForm<PilgrimFormData>({
    resolver: zodResolver(pilgrimSchema),
  })

  const selectedGender = watch("gender")

  useEffect(() => {
    if (pilgrimId) {
      loadPilgrimData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilgrimId])

  const loadPilgrimData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await PilgrimService.get(pilgrimId, accessToken)

      if (response.success && response.data) {
        const pilgrim = response.data
        reset({
          fullName: pilgrim.fullName || "",
          dateOfBirth: pilgrim.dateOfBirth || "",
          gender: pilgrim.gender || "MALE",
          nationality: pilgrim.nationality || "",
          address: pilgrim.address || "",
          emergencyName: pilgrim.emergencyName || "",
          emergencyPhone: pilgrim.emergencyPhone || "",
          emergencyRelationship: pilgrim.emergencyRelationship || "",
          medicalConditions: pilgrim.medicalConditions || "",
        })
      } else {
        const errorMessage = response.error || "Failed to load pilgrim"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load pilgrim"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PilgrimFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await PilgrimService.update(pilgrimId, data, accessToken)

      if (response.success) {
        toast.success("Pilgrim updated successfully")
        router.push(`/dashboard/pilgrims/${pilgrimId}`)
      } else {
        const errorMessage = response.error || "Failed to update pilgrim"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error updating pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update pilgrim"
      setError(errorMessage)
      toast.error(errorMessage)
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
          Back to Pilgrim
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Edit Pilgrim</h1>
        <p className="mt-2 text-muted-foreground">
          Update pilgrim information
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
          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="e.g., Ahmed Ali"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Full name as on passport
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  placeholder="e.g., SA, US, UK"
                  maxLength={2}
                />
                {errors.nationality && (
                  <p className="text-sm text-red-500">{errors.nationality.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  2-letter ISO country code
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedGender}
                  onValueChange={(value) => setValue("gender", value as "MALE" | "FEMALE" | "OTHER")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address..."
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">
                  Contact Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergencyName"
                  {...register("emergencyName")}
                  placeholder="e.g., Fatima Ali"
                />
                {errors.emergencyName && (
                  <p className="text-sm text-red-500">{errors.emergencyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register("emergencyPhone")}
                  placeholder="e.g., +966507654321"
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-red-500">{errors.emergencyPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Input
                  id="emergencyRelationship"
                  {...register("emergencyRelationship")}
                  placeholder="e.g., Wife, Brother, Mother"
                />
                {errors.emergencyRelationship && (
                  <p className="text-sm text-red-500">{errors.emergencyRelationship.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions & Allergies</Label>
                <Textarea
                  id="medicalConditions"
                  {...register("medicalConditions")}
                  placeholder="List any medical conditions, allergies, or special requirements..."
                  rows={4}
                />
                {errors.medicalConditions && (
                  <p className="text-sm text-red-500">{errors.medicalConditions.message}</p>
                )}
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

