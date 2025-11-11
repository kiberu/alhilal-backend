"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  FileText,
  CreditCard,
  Plane,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { PilgrimService } from "@/lib/api/services/pilgrims"
import { DocumentService, type Document as DocumentType } from "@/lib/api/services/documents"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { PilgrimWithDetails } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function PilgrimDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const pilgrimId = params.id as string

  const [pilgrim, setPilgrim] = useState<PilgrimWithDetails | null>(null)
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'document' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (pilgrimId) {
      loadPilgrimDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilgrimId])

  const loadPilgrimDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await PilgrimService.get(pilgrimId, accessToken)

      if (response.success && response.data) {
        setPilgrim(response.data)
        // Load documents for this pilgrim
        loadDocuments()
      } else {
        const errorMessage = response.error || "Failed to load pilgrim details"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load pilgrim"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true)
      const response = await DocumentService.list({ pilgrim: pilgrimId }, accessToken)
      
      if (response.success && response.data) {
        const docs = Array.isArray(response.data) ? response.data : response.data.results || []
        setDocuments(docs)
      }
    } catch (err) {
      console.error("Error loading documents:", err)
    } finally {
      setDocumentsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pilgrim?")) return

    try {
      const response = await PilgrimService.delete(pilgrimId, accessToken)
      if (response.success) {
        toast.success("Pilgrim deleted successfully")
        router.push("/dashboard/pilgrims")
      } else {
        const errorMessage = response.error || "Failed to delete pilgrim"
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error deleting pilgrim:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete pilgrim"
      toast.error(errorMessage)
    }
  }

  const handleViewDocument = (documentUrl: string | undefined) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank')
    } else {
      toast.error('Document file not available')
    }
  }

  const handleDeleteDocument = (id: string) => {
    setDeleteType('document')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)

      const response = await DocumentService.delete(deleteId, accessToken)

      if (response.success) {
        toast.success('Document deleted successfully')
        // Reload documents to refresh the list
        await loadDocuments()
      } else {
        throw new Error(response.error || 'Failed to delete document')
      }
    } catch (err) {
      console.error('Error deleting document:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setDeleteId(null)
      setDeleteType(null)
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

  if (error || !pilgrim) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pilgrims
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Pilgrim not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const age = pilgrim.dateOfBirth
    ? new Date().getFullYear() - new Date(pilgrim.dateOfBirth).getFullYear()
    : null

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
          Back to Pilgrims
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {pilgrim.userDetails?.name || "Pilgrim Profile"}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{pilgrim.userDetails?.phone || "No phone"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/pilgrims/${pilgrimId}/documents`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/pilgrims/${pilgrimId}/edit`)}
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

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-xl font-bold">{pilgrim.bookings?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Trips</p>
                <p className="text-xl font-bold">
                  {pilgrim.bookings?.filter(b => b.status !== "CANCELLED").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-medium">
                  {formatDate(pilgrim.created_at, "MMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <FileText className="mr-2 h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{pilgrim.userDetails?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {pilgrim.dateOfBirth
                      ? `${formatDate(pilgrim.dateOfBirth, "PPP")} (${age} years)`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">
                    {pilgrim.gender?.toLowerCase() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{pilgrim.nationality || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{pilgrim.userDetails?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{pilgrim.userDetails?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{pilgrim.address || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {pilgrim.medicalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {pilgrim.medicalInfo}
                </p>
              </CardContent>
            </Card>
          )}

          {pilgrim.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {pilgrim.emergencyContact}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>All bookings made by this pilgrim</CardDescription>
            </CardHeader>
            <CardContent>
              {!pilgrim.bookings || pilgrim.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {pilgrim.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {booking.packageDetails?.trip?.name || "Unknown Trip"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ref: {booking.referenceNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={booking.status} />
                        <StatusBadge status={booking.paymentStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Travel Documents</CardTitle>
              <CardDescription>Passport, visa, and other documents</CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{doc.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {doc.document_type}
                            </Badge>
                          </div>
                          {doc.document_number && (
                            <p className="text-sm text-muted-foreground">
                              #{doc.document_number}
                            </p>
                          )}
                          {doc.expiry_date && (
                            <p className="text-xs text-muted-foreground">
                              Expires: {formatDate(doc.expiry_date, "PPP")}
                            </p>
                          )}
                          {doc.trip_name && (
                            <p className="text-xs text-muted-foreground">
                              Trip: {doc.trip_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={doc.status} />
                          {doc.expiry_date && (
                            <Badge
                              variant={
                                new Date(doc.expiry_date) > new Date()
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {new Date(doc.expiry_date) > new Date() ? "Valid" : "Expired"}
                            </Badge>
                          )}
                          {doc.file_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDocument(doc.file_url)}
                              title="View document"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                            title="Edit document"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents on record</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
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
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

