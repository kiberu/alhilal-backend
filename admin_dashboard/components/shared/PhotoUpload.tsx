"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Loader2, Camera, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export interface UploadedPhoto {
  publicId: string
  secureUrl: string
  format: string
  bytes: number
}

interface PhotoUploadProps {
  label: string
  value?: string
  onChange: (url: string) => void
  onUploadSuccess?: (photo: UploadedPhoto) => void
  onUploadError?: (error: string) => void
  placeholder?: string
  accept?: string
  maxSize?: number // in MB
  folder?: string
  className?: string
  required?: boolean
}

export function PhotoUpload({
  label,
  value,
  onChange,
  onUploadSuccess,
  onUploadError,
  placeholder = "Select a photo",
  accept = "image/*",
  maxSize = 5,
  folder = "trips",
  className = "",
  required = false
}: PhotoUploadProps) {
  const { accessToken } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file'
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`
    }

    return null
  }

  const uploadToBackend = async (file: File) => {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      formData.append("resource_type", "image")

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
      
      const uploadedPhoto: UploadedPhoto = {
        publicId: data.publicId,
        secureUrl: data.secureUrl,
        format: data.format,
        bytes: data.bytes,
      }

      onChange(uploadedPhoto.secureUrl)
      onUploadSuccess?.(uploadedPhoto)
      toast.success("Photo uploaded successfully")
    } catch (err) {
      console.error("Upload error:", err)
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      onUploadError?.(errorMessage)
      toast.error(errorMessage)
      setFileError(errorMessage)
      setPreview(null)
      setSelectedFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setFileError(validationError)
      toast.error(validationError)
      return
    }

    setFileError(null)
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onChange(result) // For immediate preview
    }
    reader.readAsDataURL(file)

    // Upload to backend
    await uploadToBackend(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
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

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    setFileError(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const displayImage = preview || value
  const hasError = fileError

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className={hasError ? "text-red-600" : ""}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Card 
        className={`
          relative overflow-hidden transition-colors cursor-pointer
          ${dragActive ? 'border-primary bg-primary/5' : ''}
          ${hasError ? 'border-red-500' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="p-6">
          {displayImage ? (
            <div className="relative">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 rounded-lg">
                  <AvatarImage src={displayImage} alt="Preview" className="object-cover" />
                  <AvatarFallback className="rounded-lg">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Current photo"}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openFileDialog()
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearSelection()
                      }}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                {isLoading ? (
                  <Loader2 className="h-12 w-12 animate-spin" />
                ) : (
                  <Camera className="h-12 w-12" />
                )}
              </div>
              <p className="text-sm font-medium mb-2">
                {isLoading ? "Uploading..." : placeholder}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Drag and drop or click to select • Max {maxSize}MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  openFileDialog()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Photo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileError}
          </AlertDescription>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}

