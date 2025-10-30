"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSizeMB?: number
  folder?: string
  className?: string
}

export function CloudinaryUpload({
  onUploadSuccess,
  onUploadError,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  folder = "documents",
  className,
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      const error = `File size exceeds ${maxSizeMB}MB limit`
      onUploadError?.(error)
      return
    }

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

    await uploadToCloudinary(file)
  }

  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true)

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error("Cloudinary cloud name not configured")
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "unsigned_uploads") // Use your unsigned upload preset
      formData.append("folder", folder)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      onUploadSuccess(data.secure_url, data.public_id)
    } catch (err) {
      console.error("Upload error:", err)
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      onUploadError?.(errorMessage)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
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
          className="border-2 border-dashed cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload or drag and drop
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
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-10 w-10 text-gray-600" />
                </div>
              ) : (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview || ""}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {uploading ? "Uploading..." : "Upload complete"}
                </p>
                <p className="text-xs text-gray-500">
                  {uploading ? "Please wait..." : "File uploaded successfully"}
                </p>
              </div>

              {!uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="h-8 w-8"
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

