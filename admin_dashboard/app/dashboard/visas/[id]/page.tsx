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
import { VisaService } from "@/lib/api/services/visas"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { Visa } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function VisaDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const visaId = params.id as string

  const [visa, setVisa] = useState<Visa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (visaId) {
      loadVisaDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visaId])

  const loadVisaDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await VisaService.get(visaId, accessToken)

      if (response.success && response.data) {
        setVisa(response.data)
      } else {
        const errorMessage = response.error || "Failed to load visa details"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error loading visa:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load visa"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocument = () => {
    if (visa?.visaCopy) {
      window.open(visa.visaCopy, '_blank')
    } else {
      toast.error('Document file not available')
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await VisaService.delete(visaId, accessToken)
      
      if (response.success) {
        toast.success("Visa deleted successfully")
        router.back()
      } else {
        throw new Error(response.error || "Failed to delete visa")
      }
    } catch (err) {
      console.error("Error deleting visa:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete visa"
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

  if (error || !visa) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Visa not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Visa Details</h1>
            <p className="text-muted-foreground">{visa.visaType} Visa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visa.visaCopy && (
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
              Visa Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visa Type</p>
                <p className="text-lg font-medium">{visa.visaType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <StatusBadge status={visa.status} />
              </div>
              {visa.number && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Visa Number</p>
                  <p className="text-lg font-medium">{visa.number}</p>
                </div>
              )}
              {visa.applicationDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                  <p className="text-lg font-medium">{formatDate(visa.applicationDate, "PPP")}</p>
                </div>
              )}
              {visa.submittedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                  <p className="text-lg font-medium">{formatDate(visa.submittedAt, "PPP")}</p>
                </div>
              )}
              {visa.approvedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                  <p className="text-lg font-medium">{formatDate(visa.approvedAt, "PPP")}</p>
                </div>
              )}
              {visa.rejectedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected At</p>
                  <p className="text-lg font-medium">{formatDate(visa.rejectedAt, "PPP")}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-lg font-medium">{formatDate(visa.created_at, "PPP")}</p>
              </div>
            </div>

            {visa.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{visa.notes}</p>
              </div>
            )}

            {visa.visaCopy && (
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
            <DialogTitle>Delete Visa?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visa? This action cannot be undone.
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

