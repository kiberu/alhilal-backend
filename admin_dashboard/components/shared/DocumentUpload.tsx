"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export interface UploadedDocument {
  publicId: string
  secureUrl: string
  format: string
  bytes: number
}

interface DocumentUploadProps {
  onUploadSuccess: (document: UploadedDocument) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSizeMB?: number
  folder?: string
  className?: string
  label?: string
  description?: string
}

export function DocumentUpload({
  onUploadSuccess,
  onUploadError,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  folder = "documents",
  className,
  label = "Upload Document",
  description = "Click to upload or drag and drop",
}: DocumentUploadProps) {
  const { accessToken } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [uploadComplete, setUploadComplete] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndProcessFile = async (file: File) => {
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      const error = `File size exceeds ${maxSizeMB}MB limit`
      onUploadError?.(error)
      toast.error(error)
      return
    }

    setFileName(file.name)

    // Show preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview("document")
    }

    await uploadToBackend(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await validateAndProcessFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await validateAndProcessFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const uploadToBackend = async (file: File) => {
    try {
      setUploading(true)
      setUploadComplete(false)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      formData.append("resource_type", "auto")

      // Import API client and config
      const { apiClient } = await import("@/lib/api/client")
      const { API_ENDPOINTS } = await import("@/lib/api/config")

      const response = await apiClient.postFormData(
        API_ENDPOINTS.COMMON.UPLOAD,
        formData,
        undefined,
        accessToken
      )

      if (!response.success) {
        throw new Error(response.error || "Upload failed")
      }

      const data = response.data
      
      const uploadedDoc: UploadedDocument = {
        publicId: data.publicId,
        secureUrl: data.secureUrl,
        format: data.format,
        bytes: data.bytes,
      }

      setUploadComplete(true)
      onUploadSuccess(uploadedDoc)
      toast.success("Document uploaded successfully")
    } catch (err) {
      console.error("Upload error:", err)
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      onUploadError?.(errorMessage)
      toast.error(errorMessage)
      setPreview(null)
      setFileName("")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setFileName("")
    setUploadComplete(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!preview ? (
        <Card
          className={cn(
            "border-2 border-dashed cursor-pointer hover:border-gray-400 transition-colors",
            dragActive && "border-primary bg-primary/5"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Upload className={cn(
              "h-10 w-10 mb-3",
              dragActive ? "text-primary" : "text-gray-400"
            )} />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {dragActive ? "Drop file here" : description}
            </p>
            <p className="text-xs text-gray-500">
              {accept === "image/*" ? "Images" : "Images and PDFs"} up to {maxSizeMB}MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="relative p-4">
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              {preview === "document" ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-8 w-8 text-gray-600" />
                </div>
              ) : (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview || ""}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {fileName}
                  </p>
                  {uploadComplete && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {uploading ? "Uploading..." : uploadComplete ? "Upload complete" : "Ready to upload"}
                </p>
              </div>

              {!uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

