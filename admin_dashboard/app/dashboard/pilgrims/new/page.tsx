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

const pilgrimSchema = z.object({
  user: z.string().uuid("Invalid user ID"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(2, "Nationality is required"),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalInfo: z.string().optional(),
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
      nationality: "UG",
    },
  })

  const selectedGender = watch("gender")

  const onSubmit = async (data: PilgrimFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const response = await PilgrimService.create(data, accessToken)

      if (response.success && response.data) {
        router.push(`/dashboard/pilgrims/${response.data.id}`)
      } else {
        setError(response.error || "Failed to create pilgrim")
      }
    } catch (err) {
      console.error("Error creating pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create pilgrim"
      setError(errorMessage)
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
          {/* User Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">
                  User ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user"
                  {...register("user")}
                  placeholder="Enter user UUID"
                />
                {errors.user && (
                  <p className="text-sm text-red-500">{errors.user.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter the UUID of the user account for this pilgrim
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
                <Label htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nationality"
                  {...register("nationality")}
                  placeholder="e.g., UG, KE, TZ"
                  maxLength={2}
                />
                {errors.nationality && (
                  <p className="text-sm text-red-500">{errors.nationality.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter 2-letter country code
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Details</Label>
                <Textarea
                  id="emergencyContact"
                  {...register("emergencyContact")}
                  placeholder="Name, relationship, phone number..."
                  rows={3}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
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
                <Label htmlFor="medicalInfo">Medical History & Allergies</Label>
                <Textarea
                  id="medicalInfo"
                  {...register("medicalInfo")}
                  placeholder="List any medical conditions, allergies, or special requirements..."
                  rows={4}
                />
                {errors.medicalInfo && (
                  <p className="text-sm text-red-500">{errors.medicalInfo.message}</p>
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

