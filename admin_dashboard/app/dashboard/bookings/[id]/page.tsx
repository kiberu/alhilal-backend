"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  User,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { BookingService } from "@/lib/api/services/bookings"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { BookingWithDetails } from "@/types/models"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const loadBookingDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await BookingService.get(bookingId, accessToken)

      if (response.success && response.data) {
        setBooking(response.data)
      } else {
        setError(response.error || "Failed to load booking details")
      }
    } catch (err) {
      console.error("Error loading booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load booking"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await BookingService.delete(bookingId, accessToken)
      if (response.success) {
        router.push("/bookings")
      } else {
        alert(response.error || "Failed to delete booking")
      }
    } catch (err) {
      console.error("Error deleting booking:", err)
      alert("Failed to delete booking")
    }
  }

  const formatCurrency = (minorUnits: number, currency: string = "USD") => {
    const amount = minorUnits / 100
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Booking not found"}</AlertDescription>
        </Alert>
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
          Back to Bookings
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
            <p className="text-muted-foreground">
              <span className="font-mono text-sm">{booking.referenceNumber}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/bookings/${bookingId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                booking.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-600"
                  : booking.paymentStatus === "PARTIAL"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-xl font-bold">
                  {formatCurrency(booking.amountPaidMinorUnits, booking.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Booked On</p>
                <p className="text-lg font-medium">
                  {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-600"
                  : booking.status === "CANCELLED"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
                {booking.status === "CONFIRMED" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : booking.status === "CANCELLED" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-medium">{booking.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pilgrim">
            <User className="mr-2 h-4 w-4" />
            Pilgrim
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip & Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Trip</p>
                  <p className="font-medium">{booking.packageDetails?.trip?.name || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.packageDetails?.trip?.code || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{booking.packageDetails?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Travel Dates</p>
                  <p className="text-sm">
                    {booking.packageDetails?.trip?.startDate && 
                      format(new Date(booking.packageDetails.trip.startDate), "MMM dd, yyyy")
                    } - {booking.packageDetails?.trip?.endDate && 
                      format(new Date(booking.packageDetails.trip.endDate), "MMM dd, yyyy")
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <span className="font-mono text-sm font-medium">
                    {booking.referenceNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <StatusBadge status={booking.paymentStatus} />
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">
                    {format(new Date(booking.createdAt), "PPp")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {booking.specialRequests && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {booking.specialRequests}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pilgrim Tab */}
        <TabsContent value="pilgrim">
          <Card>
            <CardHeader>
              <CardTitle>Pilgrim Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {booking.pilgrimDetails?.user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {booking.pilgrimDetails?.user?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {booking.pilgrimDetails?.user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">
                    {booking.pilgrimDetails?.nationality || "N/A"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/pilgrims/${booking.pilgrim}`)}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Package Price</p>
                  <p className="text-lg font-bold">
                    {booking.packageDetails && formatCurrency(
                      booking.packageDetails.priceMinorUnits,
                      booking.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(booking.amountPaidMinorUnits, booking.currency)}
                  </p>
                </div>
              </div>

              {booking.paymentStatus !== "PAID" && booking.packageDetails && (
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800">Outstanding Balance</p>
                  <p className="text-xl font-bold text-yellow-900">
                    {formatCurrency(
                      booking.packageDetails.priceMinorUnits - booking.amountPaidMinorUnits,
                      booking.currency
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

