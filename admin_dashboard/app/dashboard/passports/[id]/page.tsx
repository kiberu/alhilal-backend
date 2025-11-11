"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ExternalLink, Edit, Trash2, AlertCircle, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PassportService } from "@/lib/api/services/passports"
import { useAuth } from "@/hooks/useAuth"
import type { Passport } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function PassportDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const passportId = params.id as string

  const [passport, setPassport] = useState<Passport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (passportId) {
      loadPassportDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passportId])

  const loadPassportDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await PassportService.get(passportId, accessToken)

      if (response.success && response.data) {
        setPassport(response.data)
      } else {
        const errorMessage = response.error || "Failed to load passport details"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading passport:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load passport"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = () => {
    if (passport?.scannedCopy) {
      window.open(passport.scannedCopy, '_blank')
    } else {
      toast.error('Document file not available')
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await PassportService.delete(passportId, accessToken)
      
      if (response.success) {
        toast.success("Passport deleted successfully")
        router.back()
      } else {
        throw new Error(response.error || "Failed to delete passport")
      }
    } catch (err) {
      console.error("Error deleting passport:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete passport"
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !passport) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Passport not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isExpired = new Date(passport.expiryDate) < new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Passport Details</h1>
            <p className="text-muted-foreground">#{passport.number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {passport.scannedCopy && (
            <Button onClick={handleViewDocument} size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Document
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast.info("Edit functionality coming soon")}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Passport Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passport Number</p>
                <p className="text-lg font-medium">{passport.number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Country</p>
                <p className="text-lg font-medium">{passport.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{formatDate(passport.expiryDate, "PPP")}</p>
                  <Badge variant={isExpired ? "destructive" : "default"}>
                    {isExpired ? "Expired" : "Valid"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-lg font-medium">{formatDate(passport.created_at, "PPP")}</p>
              </div>
            </div>

            {passport.scannedCopy && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Document File</p>
                <Button onClick={handleViewDocument} variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Passport?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this passport? This action cannot be undone.
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
              onClick={handleDelete}
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

