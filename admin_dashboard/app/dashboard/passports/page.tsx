"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { PassportService } from "@/lib/api/services/passports"
import { useAuth } from "@/hooks/useAuth"
import type { Passport } from "@/types/models"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function PassportsPage() {
  const router = useRouter()
  const { accessToken } = useAuth()

  const [passports, setPassports] = useState<Passport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadPassports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPassports = async () => {
    try {
      setLoading(true)

      const response = await PassportService.list(undefined, accessToken)

      if (response.success && response.data) {
        setPassports(response.data.results || [])
      } else {
        toast.error(response.error || "Failed to load passports")
      }
    } catch (err) {
      console.error("Error loading passports:", err)
      toast.error("Failed to load passports")
    } finally {
      setLoading(false)
    }
  }

  const filteredPassports = passports.filter(
    (passport) =>
      passport.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passport.country.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Passports</h1>
          <p className="text-muted-foreground">Manage pilgrim passports</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Passports ({filteredPassports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by number or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passport Number</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPassports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No passports found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPassports.map((passport) => {
                  const isExpired = new Date(passport.expiryDate) < new Date()
                  return (
                    <TableRow
                      key={passport.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/passports/${passport.id}`)}
                    >
                      <TableCell className="font-medium">{passport.number}</TableCell>
                      <TableCell>{passport.country}</TableCell>
                      <TableCell>{formatDate(passport.expiryDate, "PP")}</TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? "destructive" : "default"}>
                          {isExpired ? "Expired" : "Valid"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(passport.created_at, "PP")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/passports/${passport.id}`)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

