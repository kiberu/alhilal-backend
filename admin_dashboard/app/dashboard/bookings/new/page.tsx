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
import { BookingService } from "@/lib/api/services/bookings"
import { useAuth } from "@/hooks/useAuth"

const bookingSchema = z.object({
  pilgrim: z.string().uuid("Invalid pilgrim ID"),
  package: z.string().uuid("Invalid package ID"),
  status: z.enum(["EOI", "BOOKED", "CONFIRMED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]),
  amountPaid: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Amount must be a valid positive number",
  }),
  currency: z.string().min(3).max(3, "Currency code must be 3 characters"),
  specialRequests: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function NewBookingPage() {
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
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: "EOI",
      paymentStatus: "PENDING",
      amountPaid: "0",
      currency: "USD",
    },
  })

  const selectedStatus = watch("status")
  const selectedPaymentStatus = watch("paymentStatus")

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Convert amount to minor units (cents)
      const amountPaidMinorUnits = Math.round(parseFloat(data.amountPaid) * 100)

      const bookingData = {
        pilgrim: data.pilgrim,
        package: data.package,
        status: data.status,
        paymentStatus: data.paymentStatus,
        amountPaidMinorUnits,
        currency: data.currency,
        specialRequests: data.specialRequests || "",
      }

      const response = await BookingService.create(bookingData, accessToken)

      if (response.success && response.data) {
        router.push(`/dashboard/bookings/${response.data.id}`)
      } else {
        setError(response.error || "Failed to create booking")
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create booking"
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
          Back to Bookings
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
        <p className="mt-2 text-muted-foreground">
          Create a booking for a pilgrim
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
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pilgrim">
                    Pilgrim ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pilgrim"
                    {...register("pilgrim")}
                    placeholder="Enter pilgrim UUID"
                  />
                  {errors.pilgrim && (
                    <p className="text-sm text-red-500">{errors.pilgrim.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the UUID of the pilgrim making this booking
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">
                    Package ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="package"
                    {...register("package")}
                    placeholder="Enter package UUID"
                  />
                  {errors.package && (
                    <p className="text-sm text-red-500">{errors.package.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the UUID of the package being booked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Booking Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue("status", value as "EOI" | "BOOKED" | "CONFIRMED" | "CANCELLED")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EOI">Expression of Interest</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">
                  Payment Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(value) => setValue("paymentStatus", value as "PENDING" | "PARTIAL" | "PAID" | "REFUNDED")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentStatus && (
                  <p className="text-sm text-red-500">{errors.paymentStatus.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amountPaid">
                  Amount Paid <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("amountPaid")}
                  placeholder="0.00"
                />
                {errors.amountPaid && (
                  <p className="text-sm text-red-500">{errors.amountPaid.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currency"
                  {...register("currency")}
                  placeholder="USD"
                  maxLength={3}
                />
                {errors.currency && (
                  <p className="text-sm text-red-500">{errors.currency.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Notes</Label>
                <Textarea
                  id="specialRequests"
                  {...register("specialRequests")}
                  placeholder="Enter any special requests or notes..."
                  rows={4}
                />
                {errors.specialRequests && (
                  <p className="text-sm text-red-500">{errors.specialRequests.message}</p>
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
            {isSubmitting ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  )
}

