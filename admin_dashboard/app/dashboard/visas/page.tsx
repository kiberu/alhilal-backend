"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Search } from "lucide-react"
import { VisaService } from "@/lib/api/services/visas"
import { useAuth } from "@/hooks/useAuth"
import { StatusBadge } from "@/components/shared"
import type { Visa } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function VisasPage() {
  const router = useRouter()
  const { accessToken } = useAuth()

  const [visas, setVisas] = useState<Visa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadVisas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadVisas = async () => {
    try {
      setLoading(true)

      const response = await VisaService.list(undefined, accessToken)

      if (response.success && response.data) {
        setVisas(response.data.results || [])
      } else {
        toast.error(response.error || "Failed to load visas")
      }
    } catch (err) {
      console.error("Error loading visas:", err)
      toast.error("Failed to load visas")
    } finally {
      setLoading(false)
    }
  }

  const filteredVisas = visas.filter(
    (visa) =>
      visa.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visa.number && visa.number.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visas</h1>
          <p className="text-muted-foreground">Manage pilgrim visas</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Visas ({filteredVisas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by type or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visa Type</TableHead>
                <TableHead>Visa Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No visas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisas.map((visa) => (
                  <TableRow
                    key={visa.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/visas/${visa.id}`)}
                  >
                    <TableCell className="font-medium">{visa.visaType}</TableCell>
                    <TableCell>{visa.number || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={visa.status} />
                    </TableCell>
                    <TableCell>
                      {visa.applicationDate ? formatDate(visa.applicationDate, "PP") : "-"}
                    </TableCell>
                    <TableCell>{formatDate(visa.created_at, "PP")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/dashboard/visas/${visa.id}`)
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

