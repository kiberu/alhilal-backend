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
import { BookingService } from "@/lib/api/services/bookings"
import { useAuth } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"

const bookingSchema = z.object({
  status: z.enum(["EOI", "BOOKED", "CONFIRMED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]),
  amountPaid: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Amount must be a valid positive number",
  }),
  specialRequests: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function EditBookingPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const bookingId = params.id as string

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
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  })

  const selectedStatus = watch("status")
  const selectedPaymentStatus = watch("paymentStatus")

  useEffect(() => {
    if (bookingId) {
      loadBookingData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const loadBookingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await BookingService.get(bookingId, accessToken)

      if (response.success && response.data) {
        const booking = response.data
        reset({
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          amountPaid: (booking.amountPaidMinorUnits / 100).toFixed(2),
          specialRequests: booking.specialRequests || "",
        })
      } else {
        setError(response.error || "Failed to load booking")
      }
    } catch (err) {
      console.error("Error loading booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load booking"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const amountPaidMinorUnits = Math.round(parseFloat(data.amountPaid) * 100)

      const updateData = {
        status: data.status,
        paymentStatus: data.paymentStatus,
        amountPaidMinorUnits,
        specialRequests: data.specialRequests || "",
      }

      const response = await BookingService.update(bookingId, updateData, accessToken)

      if (response.success) {
        router.push(`/dashboard/bookings/${bookingId}`)
      } else {
        setError(response.error || "Failed to update booking")
      }
    } catch (err) {
      console.error("Error updating booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking"
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
          Back to Booking
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
        <p className="mt-2 text-muted-foreground">
          Update booking details and status
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

