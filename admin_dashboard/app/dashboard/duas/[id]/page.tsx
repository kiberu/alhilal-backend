"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react"
import { DuaService } from "@/lib/api/services/duas"
import { useAuth } from "@/hooks/useAuth"
import type { Dua } from "@/types/models"
import { Skeleton } from "@/components/ui/skeleton"

export default function DuaDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const duaId = params.id as string

  const [dua, setDua] = useState<Dua | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (duaId) {
      loadDuaDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duaId])

  const loadDuaDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await DuaService.get(duaId, accessToken)

      if (response.success && response.data) {
        setDua(response.data)
      } else {
        setError(response.error || "Failed to load dua details")
      }
    } catch (err) {
      console.error("Error loading dua:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load dua"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this dua?")) return

    try {
      const response = await DuaService.delete(duaId, accessToken)
      if (response.success) {
        router.push("/dashboard/duas")
      } else {
        alert(response.error || "Failed to delete dua")
      }
    } catch (err) {
      console.error("Error deleting dua:", err)
      alert("Failed to delete dua")
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

  if (error || !dua) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Duas
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Dua not found"}</AlertDescription>
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
          Back to Duas
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{dua.title}</h1>
            <p className="text-muted-foreground">Category: {dua.category}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/duas/${duaId}/edit`)}
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

      {/* Arabic Content */}
      <Card>
        <CardHeader>
          <CardTitle>Arabic Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <p className="font-arabic text-2xl" dir="rtl">
              {dua.titleArabic || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Content</p>
            <div
              className="font-arabic text-xl whitespace-pre-wrap rounded-lg bg-gray-50 p-4"
              dir="rtl"
            >
              {dua.contentArabic || "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* English Content */}
      <Card>
        <CardHeader>
          <CardTitle>English Translation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <p className="text-lg font-medium">{dua.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Content</p>
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4">
              {dua.content || "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transliteration */}
      {dua.transliteration && (
        <Card>
          <CardHeader>
            <CardTitle>Transliteration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4">
              {dua.transliteration}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reference */}
      {dua.reference && (
        <Card>
          <CardHeader>
            <CardTitle>Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{dua.reference}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

