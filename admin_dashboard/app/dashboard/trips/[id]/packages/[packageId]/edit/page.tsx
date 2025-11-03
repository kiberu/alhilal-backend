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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle, Package } from "lucide-react"
import { PackageService } from "@/lib/api/services/packages"
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

type PackageFormData = z.infer<typeof packageSchema>

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string
  const packageId = params.packageId as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: "",
      currency: "USD",
      capacity: "50",
      visibility: "PUBLIC",
    },
  })

  // Fetch package data
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setFetchLoading(true)
        const response = await PackageService.get(packageId, accessToken)

        if (response.success && response.data) {
          const pkg = response.data
          // Convert price from minor units to dollars
          const priceInDollars = pkg.price_minor_units 
            ? (pkg.price_minor_units / 100).toString() 
            : "0"

          form.reset({
            name: pkg.name,
            price: priceInDollars,
            currency: pkg.currency || "USD",
            capacity: pkg.capacity?.toString() || "50",
            visibility: (pkg.visibility as "PUBLIC" | "PRIVATE" | "INTERNAL") || "PUBLIC",
          })
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
      fetchPackage()
    }
  }, [packageId, accessToken, form])

  const onSubmit: SubmitHandler<PackageFormData> = async (data) => {
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
        router.push(`/dashboard/trips/${tripId}?tab=packages`)
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
              Update package details for this trip
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

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>
                Configure the package pricing and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
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
                  control={form.control}
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
                        Price in dollars
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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
    </div>
  )
}

