import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BookingStatus, VisaStatus, TripVisibility } from "@/types/models"

interface StatusBadgeProps {
  status: BookingStatus | VisaStatus | TripVisibility | string
  className?: string
}

const STATUS_STYLES: Record<string, string> = {
  // Booking statuses
  EOI: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
  BOOKED: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  
  // Visa statuses
  PENDING: "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200",
  SUBMITTED: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  REJECTED: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
  
  // Trip visibility
  PUBLIC: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  PRIVATE: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
  ARCHIVED: "bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase()
  const style = STATUS_STYLES[normalizedStatus] || "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"

  return (
    <Badge
      variant="outline"
      className={cn(style, "font-medium", className)}
    >
      {status}
    </Badge>
  )
}

