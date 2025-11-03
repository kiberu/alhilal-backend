"use client"

import { useState, useEffect } from "react"
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
import { TripService } from "@/lib/api/services/trips"
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { PackageService } from "@/lib/api/services/packages"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { SearchableSelect, type SearchableSelectOption } from "@/components/shared"
import { handleFormErrors, getErrorMessage } from "@/lib/form-utils"

const bookingSchema = z.object({
  trip: z.string().uuid("Please select a trip"),
  pilgrim: z.string().uuid("Please select a pilgrim"),
  package: z.string().uuid("Please select a package"),
  status: z.enum(["EOI", "BOOKED", "CONFIRMED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "REFUNDED"]),
  amountPaid: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Amount must be a valid positive number",
  }),
  currency: z.string().min(3).max(3, "Currency code must be 3 characters"),
  paymentNote: z.string().optional(),
  ticketNumber: z.string().optional(),
  roomAssignment: z.string().optional(),
  specialNeeds: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function NewBookingPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for searchable selects
  const [trips, setTrips] = useState<SearchableSelectOption[]>([])
  const [pilgrims, setPilgrims] = useState<SearchableSelectOption[]>([])
  const [packages, setPackages] = useState<SearchableSelectOption[]>([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  const [loadingPilgrims, setLoadingPilgrims] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(false)

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

  const selectedTrip = watch("trip")
  const selectedPilgrim = watch("pilgrim")
  const selectedPackage = watch("package")
  const selectedStatus = watch("status")
  const selectedPaymentStatus = watch("paymentStatus")

  // Load trips on mount
  useEffect(() => {
    loadTrips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load pilgrims on mount
  useEffect(() => {
    loadPilgrims()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load packages when trip changes
  useEffect(() => {
    if (selectedTrip) {
      loadPackages(selectedTrip)
      // Reset package selection when trip changes
      setValue("package", "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip])

  const loadTrips = async () => {
    try {
      setLoadingTrips(true)
      const response = await TripService.list({}, accessToken)
      
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).results || []
        
        const tripOptions: SearchableSelectOption[] = dataArray.map((trip: any) => ({
          value: trip.id,
          label: `${trip.code} - ${trip.name}`,
          subtitle: `${trip.startDate || trip.start_date || ''} to ${trip.endDate || trip.end_date || ''}`,
        }))
        setTrips(tripOptions)
      }
    } catch (err) {
      console.error("Error loading trips:", err)
      toast.error("Failed to load trips")
    } finally {
      setLoadingTrips(false)
    }
  }

  const loadPilgrims = async (searchQuery?: string) => {
    try {
      setLoadingPilgrims(true)
      const filters: any = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      
      const response = await PilgrimService.list(filters, accessToken)
      
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).results || []
        
        const pilgrimOptions: SearchableSelectOption[] = dataArray.map((pilgrim: any) => ({
          value: pilgrim.id,
          label: pilgrim.fullName || `${pilgrim.firstName || ''} ${pilgrim.lastName || ''}`.trim() || 'Unnamed',
          subtitle: `${pilgrim.passportNumber || 'No passport'} • ${pilgrim.phone || 'No phone'}`,
        }))
        setPilgrims(pilgrimOptions)
      }
    } catch (err) {
      console.error("Error loading pilgrims:", err)
      toast.error("Failed to load pilgrims")
    } finally {
      setLoadingPilgrims(false)
    }
  }

  const loadPackages = async (tripId: string) => {
    try {
      setLoadingPackages(true)
      const response = await PackageService.list({ trip: tripId }, accessToken)
      
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).results || []
        
        const packageOptions: SearchableSelectOption[] = dataArray.map((pkg: any) => {
          const priceMinorUnits = pkg.priceMinorUnits || pkg.price_minor_units || 0
          const price = priceMinorUnits > 0 ? (priceMinorUnits / 100).toFixed(2) : '0.00'
          const currency = pkg.currency || 'USD'
          const capacity = pkg.capacity || 'N/A'
          
          return {
            value: pkg.id,
            label: pkg.name,
            subtitle: `${currency} ${price} • Capacity: ${capacity}`,
          }
        })
        setPackages(packageOptions)
        
        if (packageOptions.length === 0) {
          toast.info("No packages available for this trip")
        }
      }
    } catch (err) {
      console.error("Error loading packages:", err)
      toast.error("Failed to load packages")
      setPackages([])
    } finally {
      setLoadingPackages(false)
    }
  }

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
        paymentNote: data.paymentNote || "",
        ticketNumber: data.ticketNumber || "",
        roomAssignment: data.roomAssignment || "",
        specialNeeds: data.specialNeeds || "",
      }

      const response = await BookingService.create(bookingData, accessToken)

      if (response.success && response.data) {
        toast.success("Booking created successfully")
        router.push(`/dashboard/bookings/${response.data.id}`)
      } else {
        handleFormErrors(setValue as any, response)
        const errorMessage = getErrorMessage(response, "Failed to create booking")
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error creating booking:", err)
      handleFormErrors(setValue as any, err)
      const errorMessage = getErrorMessage(err, "Failed to create booking")
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
          {/* Trip & Package Selection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Trip & Package Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trip">
                    Trip <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={trips}
                    value={selectedTrip}
                    onValueChange={(value) => setValue("trip", value)}
                    placeholder="Select a trip..."
                    searchPlaceholder="Search trips by code or name..."
                    emptyText="No trips found"
                    loading={loadingTrips}
                  />
                  {errors.trip && (
                    <p className="text-sm text-red-500">{errors.trip.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select the trip first, then choose a package
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">
                    Package <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={packages}
                    value={selectedPackage}
                    onValueChange={(value) => setValue("package", value)}
                    placeholder={selectedTrip ? "Select a package..." : "Select trip first"}
                    searchPlaceholder="Search packages..."
                    emptyText={selectedTrip ? "No packages available for this trip" : "Select a trip first"}
                    loading={loadingPackages}
                    disabled={!selectedTrip}
                  />
                  {errors.package && (
                    <p className="text-sm text-red-500">{errors.package.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Package details and pricing
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pilgrim">
                  Pilgrim <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  options={pilgrims}
                  value={selectedPilgrim}
                  onValueChange={(value) => setValue("pilgrim", value)}
                  placeholder="Select a pilgrim..."
                  searchPlaceholder="Search by name, passport, or phone..."
                  emptyText="No pilgrims found"
                  loading={loadingPilgrims}
                  onSearch={(query) => {
                    if (query.length > 2) {
                      loadPilgrims(query)
                    }
                  }}
                />
                {errors.pilgrim && (
                  <p className="text-sm text-red-500">{errors.pilgrim.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Search and select the pilgrim for this booking
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Status */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EOI">EOI (Expression of Interest)</SelectItem>
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
                  onValueChange={(value) => setValue("paymentStatus", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial Payment</SelectItem>
                    <SelectItem value="PAID">Fully Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentStatus && (
                  <p className="text-sm text-red-500">{errors.paymentStatus.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">
                    Amount Paid <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNote">Payment Note</Label>
                <Textarea
                  id="paymentNote"
                  {...register("paymentNote")}
                  placeholder="Optional payment notes or reference"
                  rows={3}
                />
                {errors.paymentNote && (
                  <p className="text-sm text-red-500">{errors.paymentNote.message}</p>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticketNumber">Ticket Number</Label>
                  <Input
                    id="ticketNumber"
                    {...register("ticketNumber")}
                    placeholder="Optional ticket/booking reference"
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
                    placeholder="e.g., Room 301, Building A"
                  />
                  {errors.roomAssignment && (
                    <p className="text-sm text-red-500">{errors.roomAssignment.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Special Needs</Label>
                <Textarea
                  id="specialNeeds"
                  {...register("specialNeeds")}
                  placeholder="Any special requirements or accommodations needed"
                  rows={3}
                />
                {errors.specialNeeds && (
                  <p className="text-sm text-red-500">{errors.specialNeeds.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Booking"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
