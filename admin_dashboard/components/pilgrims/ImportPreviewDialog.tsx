"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileWarning,
  Users,
  UserCheck,
  UserX
} from "lucide-react"

interface ImportRow {
  row_number: number
  full_name: string
  passport_number: string
  phone: string
  dob: string | null
  gender: string | null
  nationality: string | null
  address: string | null
  emergency_name: string | null
  emergency_phone: string | null
  emergency_relationship: string | null
  medical_conditions: string | null
  errors: string[]
  warnings: string[]
  duplicate_type?: 'phone' | 'passport' | 'both' | null
}

interface ImportSummary {
  total: number
  valid: number
  duplicates: number
  errors: number
}

interface ImportPreviewDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  summary: ImportSummary | null
  validRows: ImportRow[]
  duplicateRows: ImportRow[]
  errorRows: ImportRow[]
  loading?: boolean
}

export function ImportPreviewDialog({
  open,
  onClose,
  onConfirm,
  summary,
  validRows,
  duplicateRows,
  errorRows,
  loading = false,
}: ImportPreviewDialogProps) {
  if (!summary) return null

  const hasValidRows = validRows.length > 0
  const hasDuplicates = duplicateRows.length > 0
  const hasErrors = errorRows.length > 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Import Preview
          </DialogTitle>
          <DialogDescription>
            Review the data before importing. Only valid rows will be imported.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-green-50 dark:bg-green-950">
            <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-muted-foreground">Valid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.valid}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm text-muted-foreground">Duplicates</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.duplicates}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-red-50 dark:bg-red-950">
            <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.errors}</p>
            </div>
          </div>
        </div>

        {/* Tabs for different row categories */}
        <Tabs defaultValue="valid" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="valid" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Valid ({summary.valid})
            </TabsTrigger>
            <TabsTrigger value="duplicates" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Duplicates ({summary.duplicates})
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Errors ({summary.errors})
            </TabsTrigger>
          </TabsList>

          {/* Valid Rows Tab */}
          <TabsContent value="valid" className="mt-4">
            {hasValidRows ? (
              <div className="h-[300px] overflow-y-auto rounded-md border">
                <div className="p-4 space-y-3">
                  {validRows.map((row) => (
                    <div
                      key={row.row_number}
                      className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{row.full_name}</p>
                          <Badge variant="outline" className="text-xs">
                            Row {row.row_number}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 text-sm text-muted-foreground">
                          <p><span className="font-medium">Passport:</span> {row.passport_number}</p>
                          <p><span className="font-medium">Phone:</span> {row.phone}</p>
                          {row.dob && <p><span className="font-medium">DOB:</span> {row.dob}</p>}
                          {row.gender && <p><span className="font-medium">Gender:</span> {row.gender}</p>}
                        </div>
                        {row.warnings.length > 0 && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {row.warnings.join(', ')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UserCheck className="h-12 w-12 mb-2" />
                <p>No valid rows to import</p>
              </div>
            )}
          </TabsContent>

          {/* Duplicates Tab */}
          <TabsContent value="duplicates" className="mt-4">
            {hasDuplicates ? (
              <>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These rows match existing pilgrims and will be skipped during import.
                  </AlertDescription>
                </Alert>
                <div className="h-[250px] overflow-y-auto rounded-md border">
                  <div className="p-4 space-y-3">
                    {duplicateRows.map((row) => (
                      <div
                        key={row.row_number}
                        className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950"
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{row.full_name}</p>
                            <Badge variant="outline" className="text-xs">
                              Row {row.row_number}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 text-sm text-muted-foreground">
                            <p><span className="font-medium">Passport:</span> {row.passport_number}</p>
                            <p><span className="font-medium">Phone:</span> {row.phone}</p>
                          </div>
                          {row.warnings.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {row.warnings.map((warning, i) => (
                                <p key={i} className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {warning}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-2" />
                <p>No duplicate rows found</p>
              </div>
            )}
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="mt-4">
            {hasErrors ? (
              <>
                <Alert className="mb-4" variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    These rows have validation errors and will be skipped during import.
                  </AlertDescription>
                </Alert>
                <div className="h-[250px] overflow-y-auto rounded-md border">
                  <div className="p-4 space-y-3">
                    {errorRows.map((row) => (
                      <div
                        key={row.row_number}
                        className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                      >
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{row.full_name || '(Invalid Name)'}</p>
                            <Badge variant="outline" className="text-xs">
                              Row {row.row_number}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 text-sm text-muted-foreground">
                            <p><span className="font-medium">Passport:</span> {row.passport_number || 'N/A'}</p>
                            <p><span className="font-medium">Phone:</span> {row.phone || 'N/A'}</p>
                          </div>
                          {row.errors.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {row.errors.map((error, i) => (
                                <p key={i} className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-2" />
                <p>No errors found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!hasValidRows || loading}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Importing...
              </>
            ) : (
              <>
                Import {summary.valid} Valid Row{summary.valid !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

