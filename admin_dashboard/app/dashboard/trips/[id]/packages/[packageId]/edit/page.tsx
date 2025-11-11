"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle, Package, Plus, Pencil, Trash2, Hotel, Plane } from "lucide-react"
import { PackageService, HotelService, FlightService } from "@/lib/api/services"
import type { PackageHotel, PackageFlight, CreatePackageHotelData, CreatePackageFlightData } from "@/lib/api/services"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const packageSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a valid positive number",
  }),
  currency: z.string().min(3).max(3, "Currency must be 3 characters"),
  capacity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Capacity must be a positive number",
  }),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INTERNAL"]),
})

const hotelSchema = z.object({
  name: z.string().min(3, "Hotel name is required"),
  address: z.string().optional(),
  room_type: z.string().optional(),
  check_in: z.string().min(1, "Check-in date is required"),
  check_out: z.string().min(1, "Check-out date is required"),
  group_confirmation_no: z.string().optional(),
})

const flightSchema = z.object({
  leg: z.enum(["OUTBOUND", "RETURN"], {
    errorMap: () => ({ message: "Select flight direction" })
  }),
  carrier: z.string().min(2, "Carrier is required"),
  flight_no: z.string().min(1, "Flight number is required"),
  dep_airport: z.string().min(3, "Departure airport is required (3-letter code)"),
  dep_dt: z.string().min(1, "Departure date/time is required"),
  arr_airport: z.string().min(3, "Arrival airport is required (3-letter code)"),
  arr_dt: z.string().min(1, "Arrival date/time is required"),
  group_pnr: z.string().optional(),
})

type PackageFormData = z.infer<typeof packageSchema>
type HotelFormData = z.infer<typeof hotelSchema>
type FlightFormData = z.infer<typeof flightSchema>

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string
  const packageId = params.packageId as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hotels state
  const [hotels, setHotels] = useState<PackageHotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(false)
  const [hotelDialogOpen, setHotelDialogOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<PackageHotel | null>(null)
  
  // Flights state
  const [flights, setFlights] = useState<PackageFlight[]>([])
  const [flightsLoading, setFlightsLoading] = useState(false)
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<PackageFlight | null>(null)

  const packageForm = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: "",
      currency: "USD",
      capacity: "50",
      visibility: "PUBLIC",
    },
  })

  const hotelForm = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: "",
      address: "",
      room_type: "",
      check_in: "",
      check_out: "",
      group_confirmation_no: "",
    },
  })

  const flightForm = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      leg: "OUTBOUND",
      carrier: "",
      flight_no: "",
      dep_airport: "",
      dep_dt: "",
      arr_airport: "",
      arr_dt: "",
      group_pnr: "",
    },
  })

  // Fetch package data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true)
        const response = await PackageService.get(packageId, accessToken)

        if (response.success && response.data) {
          const pkg = response.data
          // Convert price from minor units to dollars
          const priceInDollars = pkg.price_minor_units 
            ? (pkg.price_minor_units / 100).toString() 
            : "0"

          packageForm.reset({
            name: pkg.name,
            price: priceInDollars,
            currency: pkg.currency || "USD",
            capacity: pkg.capacity?.toString() || "50",
            visibility: (pkg.visibility as "PUBLIC" | "PRIVATE" | "INTERNAL") || "PUBLIC",
          })
          
          // Load hotels and flights
          await Promise.all([loadHotels(), loadFlights()])
        } else {
          const errorMessage = response.error || "Failed to load package"
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (err) {
        console.error("Error fetching package:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load package"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setFetchLoading(false)
      }
    }

    if (packageId && accessToken) {
      fetchData()
    }
  }, [packageId, accessToken])

  const loadHotels = async () => {
    try {
      setHotelsLoading(true)
      const response = await HotelService.list(packageId, accessToken)
      if (response.success && response.data) {
        // API returns paginated data, extract results array
        const hotelsData = Array.isArray(response.data) ? response.data : response.data.results || []
        setHotels(hotelsData)
    }
    } catch (err) {
      console.error("Error loading hotels:", err)
    } finally {
      setHotelsLoading(false)
    }
  }

  const loadFlights = async () => {
    try {
      setFlightsLoading(true)
      const response = await FlightService.list(packageId, accessToken)
      if (response.success && response.data) {
        // API returns paginated data, extract results array
        const flightsData = Array.isArray(response.data) ? response.data : response.data.results || []
        setFlights(flightsData)
      }
    } catch (err) {
      console.error("Error loading flights:", err)
    } finally {
      setFlightsLoading(false)
    }
  }

  const onSubmitPackage: SubmitHandler<PackageFormData> = async (data) => {
    try {
      setLoading(true)
      setError(null)

      // Convert price to minor units (cents)
      const priceMinorUnits = Math.round(parseFloat(data.price) * 100)

      const packageData = {
        name: data.name,
        price_minor_units: priceMinorUnits,
        currency: data.currency,
        capacity: parseInt(data.capacity),
        visibility: data.visibility,
      }

      const response = await PackageService.update(packageId, packageData, accessToken)

      if (response.success && response.data) {
        toast.success("Package updated successfully")
      } else {
        const errorMessage = response.error || "Failed to update package"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error updating package:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update package"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitHotel: SubmitHandler<HotelFormData> = async (data) => {
    try {
      const hotelData: CreatePackageHotelData = {
        package: packageId,
        name: data.name,
        address: data.address || null,
        room_type: data.room_type || null,
        check_in: data.check_in,
        check_out: data.check_out,
        group_confirmation_no: data.group_confirmation_no || null,
      }

      if (editingHotel) {
        const response = await HotelService.update(editingHotel.id, hotelData, accessToken)
        if (response.success) {
          toast.success("Hotel updated successfully")
          await loadHotels()
          setHotelDialogOpen(false)
          setEditingHotel(null)
          hotelForm.reset()
        } else {
          toast.error(response.error || "Failed to update hotel")
        }
      } else {
        const response = await HotelService.create(hotelData, accessToken)
        if (response.success) {
          toast.success("Hotel added successfully")
          await loadHotels()
          setHotelDialogOpen(false)
          hotelForm.reset()
        } else {
          toast.error(response.error || "Failed to add hotel")
        }
      }
    } catch (err) {
      console.error("Error saving hotel:", err)
      toast.error("Failed to save hotel")
    }
  }

  const onSubmitFlight: SubmitHandler<FlightFormData> = async (data) => {
    try {
      const flightData: CreatePackageFlightData = {
        package: packageId,
        leg: data.leg,
        carrier: data.carrier,
        flight_no: data.flight_no,
        dep_airport: data.dep_airport.toUpperCase(),
        dep_dt: data.dep_dt,
        arr_airport: data.arr_airport.toUpperCase(),
        arr_dt: data.arr_dt,
        group_pnr: data.group_pnr || null,
      }

      if (editingFlight) {
        const response = await FlightService.update(editingFlight.id, flightData, accessToken)
        if (response.success) {
          toast.success("Flight updated successfully")
          await loadFlights()
          setFlightDialogOpen(false)
          setEditingFlight(null)
          flightForm.reset()
        } else {
          toast.error(response.error || "Failed to update flight")
        }
      } else {
        const response = await FlightService.create(flightData, accessToken)
        if (response.success) {
          toast.success("Flight added successfully")
          await loadFlights()
          setFlightDialogOpen(false)
          flightForm.reset()
        } else {
          toast.error(response.error || "Failed to add flight")
        }
      }
    } catch (err) {
      console.error("Error saving flight:", err)
      toast.error("Failed to save flight")
    }
  }

  const handleEditHotel = (hotel: PackageHotel) => {
    setEditingHotel(hotel)
    hotelForm.reset({
      name: hotel.name,
      address: hotel.address || "",
      room_type: hotel.room_type || "",
      check_in: hotel.check_in.split('T')[0],
      check_out: hotel.check_out.split('T')[0],
      group_confirmation_no: hotel.group_confirmation_no || "",
    })
    setHotelDialogOpen(true)
  }

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return
    
    try {
      const response = await HotelService.delete(hotelId, accessToken)
      if (response.success) {
        toast.success("Hotel deleted successfully")
        await loadHotels()
      } else {
        toast.error(response.error || "Failed to delete hotel")
      }
    } catch (err) {
      console.error("Error deleting hotel:", err)
      toast.error("Failed to delete hotel")
    }
  }

  const handleEditFlight = (flight: PackageFlight) => {
    setEditingFlight(flight)
    flightForm.reset({
      leg: flight.leg as "OUTBOUND" | "RETURN",
      carrier: flight.carrier,
      flight_no: flight.flight_no,
      dep_airport: flight.dep_airport,
      dep_dt: flight.dep_dt.slice(0, 16), // Format for datetime-local input
      arr_airport: flight.arr_airport,
      arr_dt: flight.arr_dt.slice(0, 16),
      group_pnr: flight.group_pnr || "",
    })
    setFlightDialogOpen(true)
  }

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm("Are you sure you want to delete this flight?")) return
    
    try {
      const response = await FlightService.delete(flightId, accessToken)
      if (response.success) {
        toast.success("Flight deleted successfully")
        await loadFlights()
      } else {
        toast.error(response.error || "Failed to delete flight")
      }
    } catch (err) {
      console.error("Error deleting flight:", err)
      toast.error("Failed to delete flight")
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
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
          Back to Trip
        </Button>
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Package</h1>
            <p className="text-muted-foreground">
              Update package details, hotels, and flights
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <Package className="mr-2 h-4 w-4" />
            Package Details
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <Hotel className="mr-2 h-4 w-4" />
            Hotels ({hotels.length})
          </TabsTrigger>
          <TabsTrigger value="flights">
            <Plane className="mr-2 h-4 w-4" />
            Flights ({flights.length})
          </TabsTrigger>
        </TabsList>

        {/* Package Details Tab */}
        <TabsContent value="details">
          <Form {...packageForm}>
            <form onSubmit={packageForm.handleSubmit(onSubmitPackage)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Configure the package pricing and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                    control={packageForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Economy Package, Premium Package"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this package
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                      control={packageForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2500.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                            Price in major units
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                      control={packageForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="UGX">UGX</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                      control={packageForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Max pilgrims
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                    control={packageForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="INTERNAL">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Controls who can see this package
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
        </TabsContent>

        {/* Hotels Tab */}
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hotels</CardTitle>
                  <CardDescription>
                    Manage accommodation for this package
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingHotel(null)
                  hotelForm.reset()
                  setHotelDialogOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hotel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hotelsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Hotel className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No hotels added yet</p>
                  <p className="text-sm">Click "Add Hotel" to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotels.map((hotel) => (
                      <TableRow key={hotel.id}>
                        <TableCell className="font-medium">{hotel.name}</TableCell>
                        <TableCell>{hotel.address || "-"}</TableCell>
                        <TableCell>{hotel.room_type || "-"}</TableCell>
                        <TableCell>{new Date(hotel.check_in).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(hotel.check_out).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHotel(hotel)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteHotel(hotel.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flights Tab */}
        <TabsContent value="flights">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Flights</CardTitle>
                  <CardDescription>
                    Manage flights for this package
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingFlight(null)
                  flightForm.reset()
                  setFlightDialogOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Flight
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {flightsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : flights.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Plane className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No flights added yet</p>
                  <p className="text-sm">Click "Add Flight" to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Direction</TableHead>
                      <TableHead>Flight</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flights.map((flight) => (
                      <TableRow key={flight.id}>
                        <TableCell className="font-medium">{flight.leg}</TableCell>
                        <TableCell>{flight.carrier} {flight.flight_no}</TableCell>
                        <TableCell>{flight.dep_airport} → {flight.arr_airport}</TableCell>
                        <TableCell>{new Date(flight.dep_dt).toLocaleString()}</TableCell>
                        <TableCell>{new Date(flight.arr_dt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFlight(flight)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFlight(flight.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hotel Dialog */}
      <Dialog open={hotelDialogOpen} onOpenChange={setHotelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingHotel ? "Edit Hotel" : "Add Hotel"}</DialogTitle>
            <DialogDescription>
              Enter hotel accommodation details for this package
            </DialogDescription>
          </DialogHeader>
          <Form {...hotelForm}>
            <form onSubmit={hotelForm.handleSubmit(onSubmitHotel)} className="space-y-4">
              <FormField
                control={hotelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hilton Makkah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={hotelForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={hotelForm.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quad, Double, Triple" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={hotelForm.control}
                  name="check_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={hotelForm.control}
                  name="check_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={hotelForm.control}
                name="group_confirmation_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Confirmation Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Booking confirmation number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setHotelDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingHotel ? "Update" : "Add"} Hotel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Flight Dialog */}
      <Dialog open={flightDialogOpen} onOpenChange={setFlightDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFlight ? "Edit Flight" : "Add Flight"}</DialogTitle>
            <DialogDescription>
              Enter flight details for this package
            </DialogDescription>
          </DialogHeader>
          <Form {...flightForm}>
            <form onSubmit={flightForm.handleSubmit(onSubmitFlight)} className="space-y-4">
              <FormField
                control={flightForm.control}
                name="leg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Direction *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OUTBOUND">Outbound</SelectItem>
                        <SelectItem value="RETURN">Return</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={flightForm.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Emirates" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={flightForm.control}
                  name="flight_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EK748" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={flightForm.control}
                  name="dep_airport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Airport *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., EBB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={flightForm.control}
                  name="arr_airport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Airport *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JED" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={flightForm.control}
                  name="dep_dt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date & Time *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={flightForm.control}
                  name="arr_dt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Date & Time *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={flightForm.control}
                name="group_pnr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group PNR</FormLabel>
                    <FormControl>
                      <Input placeholder="Booking reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFlightDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingFlight ? "Update" : "Add"} Flight
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
