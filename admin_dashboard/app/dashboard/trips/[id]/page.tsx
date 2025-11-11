"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Calendar,
  MapPin,
  Eye,
  Package,
  Users,
  FileText,
  Map,
  BookOpen,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TripService } from "@/lib/api/services/trips"
import { PackageService } from "@/lib/api/services/packages"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { TripFullDetails } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function TripDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [trip, setTrip] = useState<TripFullDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (tripId) {
      loadTripDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const loadTripDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await TripService.getById(tripId, accessToken)

      if (response.success && response.data) {
        setTrip(response.data)
      } else {
        const errorMessage = response.error || "Failed to load trip details"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading trip:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load trip"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!packageToDelete) return

    try {
      setDeleting(true)
      const response = await PackageService.delete(packageToDelete.id, accessToken)

      if (response.success) {
        toast.success("Package deleted successfully")
        setDeleteDialogOpen(false)
        setPackageToDelete(null)
        // Reload trip details to reflect the deletion
        loadTripDetails()
      } else {
        const errorMessage = response.error || "Failed to delete package"
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error deleting package:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete package"
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = (packageId: string, packageName: string) => {
    setPackageToDelete({ id: packageId, name: packageName })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return

    try {
      const response = await TripService.delete(tripId, accessToken)
      if (response.success) {
        toast.success("Trip deleted successfully")
        router.push("/dashboard/trips")
      } else {
        const errorMessage = response.error || "Failed to delete trip"
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error deleting trip:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete trip"
      toast.error(errorMessage)
    }
  }

  const handleDuplicate = async () => {
    if (!trip) return
    
    const newCode = prompt("Enter code for the duplicate trip:", `${trip.code}-COPY`)
    if (!newCode) return

    try {
      const duplicateData = {
        code: newCode,
        name: `${trip.name} (Copy)`,
        cities: trip.cities || [],
        startDate: trip.startDate,
        endDate: trip.endDate,
        visibility: trip.visibility || "PRIVATE",
        coverImage: trip.coverImage,
        operatorNotes: trip.operatorNotes ? `${trip.operatorNotes}\n\n(Duplicated from ${trip.code})` : `Duplicated from ${trip.code}`,
      }

      const response = await TripService.create(duplicateData, accessToken)
      if (response.success && response.data) {
        toast.success("Trip duplicated successfully")
        router.push(`/dashboard/trips/${response.data.id}`)
      } else {
        const errorMessage = response.error || "Failed to duplicate trip"
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error duplicating trip:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate trip"
      toast.error(errorMessage)
    }
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

  if (error || !trip) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trips
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Trip not found"}</AlertDescription>
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
          Back to Trips
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
              <StatusBadge status={trip.visibility} />
              {trip.featured && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                  ⭐ Featured
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              <span className="font-mono text-sm">{trip.code}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/trips/${tripId}/edit`)}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Packages</p>
                <p className="text-2xl font-bold">{trip.packages?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{trip.bookingStats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Itinerary</p>
                <p className="text-2xl font-bold">{trip.itinerary?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guide Sections</p>
                <p className="text-2xl font-bold">{trip.guideSections?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Eye className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="packages">
            <Package className="mr-2 h-4 w-4" />
            Packages ({trip.packages?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Users className="mr-2 h-4 w-4" />
            Bookings ({trip.bookingStats?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="itinerary">
            <Map className="mr-2 h-4 w-4" />
            Itinerary ({trip.itinerary?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cities</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {trip.cities.map((city) => (
                        <Badge key={city} variant="outline">
                          {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {trip.coverImage && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Cover Image</p>
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="h-32 w-full rounded-md object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">EOI</span>
                  <span className="text-sm font-medium">
                    {trip.bookingStats?.eoiCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Booked</span>
                  <span className="text-sm font-medium">
                    {trip.bookingStats?.bookedCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="text-sm font-medium">
                    {trip.bookingStats?.confirmedCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold">
                    {trip.bookingStats?.total || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {trip.operatorNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Operator Notes</CardTitle>
                <CardDescription>Internal notes (staff only)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {trip.operatorNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Packages</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/trips/${tripId}/packages/new`)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trip.packages && trip.packages.length > 0 ? (
                <div className="space-y-4">
                  {trip.packages.map((pkg) => (
                    <Card key={pkg.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{pkg.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Capacity: {pkg.capacity} pilgrims
                            </p>
                            <p className="mt-1 text-lg font-bold">
                              {pkg.currency?.symbol || pkg.currency?.code || 'USD'} {(pkg.price_minor_units / 100).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                          <StatusBadge status={pkg.visibility} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/trips/${tripId}/packages/${pkg.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(pkg.id, pkg.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No packages added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bookings</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/bookings?trip=${tripId}`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View All Bookings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trip.bookingStats && trip.bookingStats.total > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">EOI</p>
                      <p className="text-2xl font-bold">{trip.bookingStats.eoiCount || 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Booked</p>
                      <p className="text-2xl font-bold">{trip.bookingStats.bookedCount || 0}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold">{trip.bookingStats.confirmedCount || 0}</p>
                    </div>
                    <div className="rounded-lg border p-4 bg-blue-50">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{trip.bookingStats.total || 0}</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Click "View All Bookings" to manage bookings for this trip
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No bookings for this trip yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Itinerary Tab */}
        <TabsContent value="itinerary">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Itinerary</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/dashboard/trips/${tripId}/itinerary`)}
                >
                  <Map className="mr-2 h-4 w-4" />
                  Manage Itinerary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trip.itinerary && trip.itinerary.length > 0 ? (
                <div className="space-y-3">
                  {trip.itinerary.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 border-l-2 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Day {item.dayNumber} • {item.startTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No itinerary items added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Package Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the package "{packageToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePackage}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

