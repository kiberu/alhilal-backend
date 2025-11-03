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
import { toast } from "sonner"

const bookingSchema = z.object({
  status: z.enum(["EOI", "BOOKED", "CONFIRMED", "CANCELLED"]),
  payment_status: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]),
  amount_paid: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Amount must be a valid positive number",
  }),
  currency: z.string().min(3).max(3, "Currency must be 3 characters"),
  paymentNote: z.string().optional(),
  ticketNumber: z.string().optional(),
  roomAssignment: z.string().optional(),
  specialNeeds: z.string().optional(),
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
  const selectedPaymentStatus = watch("payment_status")

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
          payment_status: booking.payment_status,
          amount_paid: (booking.amount_paid_minor_units / 100).toFixed(2),
          currency: booking.currency || "USD",
          paymentNote: booking.paymentNote || "",
          ticketNumber: booking.ticketNumber || "",
          roomAssignment: booking.roomAssignment || "",
          specialNeeds: booking.specialNeeds || "",
        })
      } else {
        const errorMessage = response.error || "Failed to load booking"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load booking"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const amountPaidMinorUnits = Math.round(parseFloat(data.amount_paid) * 100)

      const updateData = {
        status: data.status,
        payment_status: data.payment_status,
        amount_paid_minor_units: amountPaidMinorUnits,
        currency: data.currency,
        payment_note: data.paymentNote || "",
        ticket_number: data.ticketNumber || "",
        room_assignment: data.roomAssignment || "",
        special_needs: data.specialNeeds || "",
      }

      const response = await BookingService.update(bookingId, updateData, accessToken)

      if (response.success) {
        toast.success("Booking updated successfully")
        router.push(`/dashboard/bookings/${bookingId}`)
      } else {
        const errorMessage = response.error || "Failed to update booking"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error updating booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update booking"
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
                <Label htmlFor="payment_status">
                  Payment Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPaymentStatus}
                  onValueChange={(value) => setValue("payment_status", value as "PENDING" | "PARTIAL" | "PAID" | "REFUNDED")}
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
                {errors.payment_status && (
                  <p className="text-sm text-red-500">{errors.payment_status.message}</p>
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
                <Select
                  value={watch("currency")}
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-500">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNote">Payment Note</Label>
                <Textarea
                  id="paymentNote"
                  {...register("paymentNote")}
                  placeholder="Add payment details or notes..."
                  rows={3}
                />
                {errors.paymentNote && (
                  <p className="text-sm text-red-500">{errors.paymentNote.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ticketNumber">Ticket Number</Label>
                <Input
                  id="ticketNumber"
                  {...register("ticketNumber")}
                  placeholder="e.g., TKT123456"
                />
                {errors.ticketNumber && (
                  <p className="text-sm text-red-500">{errors.ticketNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomAssignment">Room Assignment</Label>
                <Input
                  id="roomAssignment"
                  {...register("roomAssignment")}
                  placeholder="e.g., Room 205"
                />
                {errors.roomAssignment && (
                  <p className="text-sm text-red-500">{errors.roomAssignment.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Needs */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Special Needs & Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Special Needs</Label>
                <Textarea
                  id="specialNeeds"
                  {...register("specialNeeds")}
                  placeholder="Dietary requirements, accessibility needs, medical accommodations..."
                  rows={4}
                />
                {errors.specialNeeds && (
                  <p className="text-sm text-red-500">{errors.specialNeeds.message}</p>
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

