"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Plus,
} from "lucide-react"
import { BookingService } from "@/lib/api/services/bookings"
import { PaymentService } from "@/lib/api/services/payments"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { BookingWithDetails, Payment, PaymentMethod } from "@/types/models"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Payment state
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [recordingPayment, setRecordingPayment] = useState(false)
  
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

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
        // Load payments if booking is fetched successfully
        loadPayments()
      } else {
        const errorMessage = response.error || "Failed to load booking details"
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

  const loadPayments = async () => {
    try {
      setLoadingPayments(true)
      const response = await PaymentService.listPayments(bookingId, accessToken)
      
      if (response.success && response.data) {
        setPayments(response.data.payments || [])
      }
    } catch (err) {
      console.error("Error loading payments:", err)
    } finally {
      setLoadingPayments(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    try {
      setRecordingPayment(true)
      
      const amountMinorUnits = Math.round(parseFloat(paymentAmount) * 100)
      
      const response = await PaymentService.recordPayment(
        bookingId,
        {
          amount_minor_units: amountMinorUnits,
          currency_id: booking?.currency?.id,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          reference_number: paymentReference || undefined,
          notes: paymentNotes || undefined,
        },
        accessToken
      )

      if (response.success) {
        toast.success("Payment recorded successfully")
        setPaymentDialogOpen(false)
        // Reset form
        setPaymentAmount("")
        setPaymentMethod("BANK_TRANSFER")
        setPaymentDate(new Date().toISOString().split('T')[0])
        setPaymentReference("")
        setPaymentNotes("")
        // Reload booking and payments
        loadBookingDetails()
      } else {
        // Handle validation errors
        if (response.error && typeof response.error === 'object') {
          const errors = Object.entries(response.error)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          toast.error(`Validation error: ${errors}`)
        } else {
          toast.error(response.error || "Failed to record payment")
        }
      }
    } catch (err) {
      console.error("Error recording payment:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to record payment"
      toast.error(errorMessage)
    } finally {
      setRecordingPayment(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return

    try {
      const response = await BookingService.delete(bookingId, accessToken)
      if (response.success) {
        toast.success("Booking deleted successfully")
        router.push("/dashboard/bookings")
      } else {
        const errorMessage = response.error || "Failed to delete booking"
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error deleting booking:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete booking"
      toast.error(errorMessage)
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
              <StatusBadge status={booking.payment_status} />
            </div>
            <p className="text-muted-foreground">
              <span className="font-mono text-sm">{booking.reference_number}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/bookings/${bookingId}/edit`)}
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
                booking.payment_status === "PAID"
                  ? "bg-green-100 text-green-600"
                  : booking.payment_status === "PARTIAL"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-xl font-bold">
                  {formatCurrency(booking.amount_paid_minor_units, booking.currency?.code || "USD")}
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
                  {format(new Date(booking.created_at), "MMM dd, yyyy")}
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
                    {booking.reference_number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <StatusBadge status={booking.payment_status} />
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">
                    {format(new Date(booking.created_at), "PPp")}
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
                onClick={() => router.push(`/dashboard/pilgrims/${booking.pilgrim}`)}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Overview of payment status and history</CardDescription>
              </div>
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Add a new payment for this booking
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ({booking.currency?.symbol || booking.currency?.code || "USD"})</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                          <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                          <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                          <SelectItem value="CHECK">Check</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference">Reference Number (Optional)</Label>
                      <Input
                        id="reference"
                        placeholder="Transaction reference"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPaymentDialogOpen(false)}
                        disabled={recordingPayment}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleRecordPayment} disabled={recordingPayment}>
                        {recordingPayment ? "Recording..." : "Record Payment"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Package Price</p>
                  <p className="text-lg font-bold">
                    {booking.packageDetails && formatCurrency(
                      booking.packageDetails.price_minor_units,
                      booking.currency?.code || "USD"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(booking.amount_paid_minor_units, booking.currency?.code || "USD")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-lg font-bold ${booking.payment_status === "PAID" ? "text-green-600" : "text-orange-600"}`}>
                    {booking.packageDetails && formatCurrency(
                      booking.packageDetails.price_minor_units - booking.amount_paid_minor_units,
                      booking.currency?.code || "USD"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPayments ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Recorded By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount_minor_units, payment.currency?.code || "USD")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.payment_method.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.reference_number || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {payment.recorded_by_name || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {payment.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

