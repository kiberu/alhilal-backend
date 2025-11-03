"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, AlertCircle, CheckCircle2, Upload, Loader2 } from "lucide-react"
import { DocumentUpload, type UploadedDocument } from "@/components/shared"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface BookedTrip {
  id: string
  name: string
  reference: string
}

export default function PilgrimDocumentsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const pilgrimId = params.id as string

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bookedTrips, setBookedTrips] = useState<BookedTrip[]>([])

  // Form state
  const [tripId, setTripId] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [otherDocumentType, setOtherDocumentType] = useState("")
  const [documentPublicId, setDocumentPublicId] = useState<string | null>(null)

  useEffect(() => {
    loadBookedTrips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadBookedTrips = async () => {
    try {
      setLoading(true)
      
      // Get pilgrim's bookings using the API service
      const { PilgrimService } = await import("@/lib/api/services/pilgrims")
      const response = await PilgrimService.get(pilgrimId, accessToken)

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load pilgrim bookings")
      }

      const data = response.data
      
      // Extract booked trips
      const trips: BookedTrip[] = []
      if (data.bookings && Array.isArray(data.bookings)) {
        data.bookings.forEach((booking: any) => {
          if (booking.status !== "CANCELLED" && booking.packageDetails?.trip) {
            trips.push({
              id: booking.packageDetails.trip.id,
              name: booking.packageDetails.trip.name,
              reference: booking.referenceNumber,
            })
          }
        })
      }

      setBookedTrips(trips)

      if (trips.length === 0) {
        setError("No booked trips found for this pilgrim. Please book a trip first.")
      }
    } catch (err) {
      console.error("Error loading trips:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load trips"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = (document: UploadedDocument) => {
    setDocumentPublicId(document.publicId)
    toast.success("Document uploaded successfully")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!tripId) {
      toast.error("Please select a trip")
      return
    }

    if (!documentType) {
      toast.error("Please select a document type")
      return
    }

    if (documentType === "OTHER" && !otherDocumentType) {
      toast.error("Please specify the document type")
      return
    }

    if (!documentPublicId) {
      toast.error("Please upload a document")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      // Import API client
      const { apiClient } = await import("@/lib/api/client")
      const { API_ENDPOINTS } = await import("@/lib/api/config")

      let response: any

      if (documentType === "PASSPORT") {
        // Create passport record
        const payload = {
          pilgrim: pilgrimId,
          passportNumber: "TBD", // Required field - staff can update later
          issueCountry: "XX",    // Required field - staff can update later
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          documentPublicId: documentPublicId,
        }
        response = await apiClient.post(API_ENDPOINTS.PASSPORTS.CREATE, payload, undefined, accessToken)
      } else if (documentType === "VISA") {
        // Create visa record
        const payload = {
          pilgrim: pilgrimId,
          trip: tripId,
          status: "PENDING",
          documentPublicId: documentPublicId,
        }
        response = await apiClient.post(API_ENDPOINTS.VISAS.CREATE, payload, undefined, accessToken)
      } else {
        // For OTHER documents, create a visa record with a note
        const payload = {
          pilgrim: pilgrimId,
          trip: tripId,
          status: "PENDING",
          visaNumber: `OTHER: ${otherDocumentType}`,
          documentPublicId: documentPublicId,
        }
        response = await apiClient.post(API_ENDPOINTS.VISAS.CREATE, payload, undefined, accessToken)
      }

      if (!response.success) {
        throw new Error(response.error || "Failed to upload document")
      }

      setSuccess("Document uploaded successfully")
      toast.success("Document uploaded successfully")

      // Reset form
      setTripId("")
      setDocumentType("")
      setOtherDocumentType("")
      setDocumentPublicId(null)

      // Redirect back to pilgrim detail after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/pilgrims/${pilgrimId}`)
      }, 2000)
    } catch (err) {
      console.error("Error uploading document:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to upload document"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pilgrim
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
          Back to Pilgrim
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
        <p className="mt-2 text-muted-foreground">
          Upload travel documents for this pilgrim
        </p>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="inline-block mr-2 h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Select trip, document type, and upload the file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Selection */}
            <div className="space-y-2">
              <Label htmlFor="trip">
                Trip <span className="text-red-500">*</span>
              </Label>
              <Select value={tripId} onValueChange={setTripId} disabled={bookedTrips.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a booked trip" />
                </SelectTrigger>
                <SelectContent>
                  {bookedTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name} - {trip.reference}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only trips with active bookings are shown
              </p>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="OTHER">Other (Specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Other Document Type (shown when OTHER is selected) */}
            {documentType === "OTHER" && (
              <div className="space-y-2">
                <Label htmlFor="otherDocumentType">
                  Specify Document Type <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="otherDocumentType"
                  value={otherDocumentType}
                  onChange={(e) => setOtherDocumentType(e.target.value)}
                  placeholder="e.g., Medical Certificate, Insurance"
                  required
                />
              </div>
            )}

            {/* Document Upload */}
            <DocumentUpload
              onUploadSuccess={handleDocumentUpload}
              folder={documentType === "PASSPORT" ? "passports" : documentType === "VISA" ? "visas" : "documents"}
              label={
                <span>
                  Upload Document <span className="text-red-500">*</span>
                </span>
              }
              description="Upload document (image, PDF, or doc file)"
              accept="image/*,application/pdf,.doc,.docx"
              maxSizeMB={10}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || bookedTrips.length === 0}>
                <Upload className="mr-2 h-4 w-4" />
                {submitting ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

