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
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

const pilgrimSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  passportNumber: z.string().min(6, "Passport number is required"),
  phone: z.string().min(10, "Phone number is required"),
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

export default function NewPilgrimPage() {
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
  } = useForm<PilgrimFormData>({
    resolver: zodResolver(pilgrimSchema),
    defaultValues: {
      gender: "MALE",
      nationality: "",
      fullName: "",
      passportNumber: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelationship: "",
      medicalConditions: "",
    },
  })

  const selectedGender = watch("gender")

  const onSubmit = async (data: PilgrimFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await PilgrimService.create(data, accessToken)

      if (response.success && response.data) {
        toast.success("Pilgrim created successfully")
        router.push(`/dashboard/pilgrims/${response.data.id}`)
      } else {
        const errorMessage = response.error || "Failed to create pilgrim"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error creating pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create pilgrim"
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
          Back to Pilgrims
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Create New Pilgrim</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new pilgrim to the system
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
          {/* Identity Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Identity Information</CardTitle>
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
                <Label htmlFor="passportNumber">
                  Passport Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="passportNumber"
                  {...register("passportNumber")}
                  placeholder="e.g., AB123456"
                />
                {errors.passportNumber && (
                  <p className="text-sm text-red-500">{errors.passportNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="e.g., +966501234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Used for OTP verification in mobile app
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
            {isSubmitting ? "Creating..." : "Create Pilgrim"}
          </Button>
        </div>
      </form>
    </div>
  )
}

