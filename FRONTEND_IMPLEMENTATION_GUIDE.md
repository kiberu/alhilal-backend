# Frontend Implementation Guide

## ✅ Completed Features

### 1. Pilgrim Management (100% Complete)
- ✅ **Create Form** - `/dashboard/pilgrims/new`
  - No user account required
  - Fields: fullName, passportNumber, phone, emergencyName, emergencyPhone, emergencyRelationship, medicalConditions
- ✅ **Edit Form** - `/dashboard/pilgrims/[id]/edit`
  - All fields updated to match backend
- ✅ **List Page** - `/dashboard/pilgrims`
  - Displays: fullName, passportNumber, phone, bookingsCount

### 2. Trip Management (100% Complete)
- ✅ **Create Form** - `/dashboard/trips/new`
- ✅ **Edit Form** - `/dashboard/trips/[id]/edit` (NEW)
- ✅ **Detail Page** - `/dashboard/trips/[id]`
  - ✅ Duplicate action implemented
  - ✅ Delete action with confirmation
- ✅ **List Page** - `/dashboard/trips`

### 3. Booking Management (Partially Complete)
- ✅ **Create Form** - `/dashboard/bookings/new`
  - Updated fields: paymentNote, ticketNumber, roomAssignment, specialNeeds
- ✅ **List Page** - `/dashboard/bookings`
- ⏳ **Bulk Actions** - See implementation below

### 4. Package Management (Partially Complete)
- ✅ **Create Form** - `/dashboard/trips/[id]/packages/new`
  - Fixed schema and API call
- ⏳ **Edit/Delete** - See implementation below

---

## 🔧 Implementation Templates

### Booking Bulk Actions

Add to `/dashboard/bookings/page.tsx`:

```typescript
// Add state for selected bookings
const [selectedBookings, setSelectedBookings] = useState<string[]>([])

// Bulk action handlers
const handleBulkConvertToBooked = async () => {
  if (!confirm(`Convert ${selectedBookings.length} EOI(s) to BOOKED?`)) return
  
  try {
    await Promise.all(
      selectedBookings.map(id =>
        BookingService.update(id, { status: 'BOOKED' }, accessToken)
      )
    )
    loadBookings() // Refresh list
    setSelectedBookings([])
    toast.success('Bookings converted successfully')
  } catch (err) {
    toast.error('Failed to convert bookings')
  }
}

const handleBulkCancel = async () => {
  if (!confirm(`Cancel ${selectedBookings.length} booking(s)?`)) return
  
  try {
    await Promise.all(
      selectedBookings.map(id =>
        BookingService.update(id, { status: 'CANCELLED' }, accessToken)
      )
    )
    loadBookings()
    setSelectedBookings([])
    toast.success('Bookings cancelled')
  } catch (err) {
    toast.error('Failed to cancel bookings')
  }
}

// Add to table columns - checkbox column
{
  key: 'select',
  header: () => (
    <Checkbox
      checked={selectedBookings.length === bookings.length}
      onCheckedChange={(checked) => {
        setSelectedBookings(checked ? bookings.map(b => b.id) : [])
      }}
    />
  ),
  render: (booking) => (
    <Checkbox
      checked={selectedBookings.includes(booking.id)}
      onCheckedChange={(checked) => {
        setSelectedBookings(prev =>
          checked
            ? [...prev, booking.id]
            : prev.filter(id => id !== booking.id)
        )
      }}
    />
  ),
}

// Add bulk action toolbar
{selectedBookings.length > 0 && (
  <div className="flex gap-2 p-4 bg-muted rounded-lg">
    <span className="text-sm font-medium">
      {selectedBookings.length} selected
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={handleBulkConvertToBooked}
    >
      Convert to Booked
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={handleBulkCancel}
    >
      Cancel Selected
    </Button>
  </div>
)}
```

---

### Itinerary CRUD & Reordering

Create `/dashboard/trips/[id]/itinerary/page.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/card"
import { GripVertical, Plus, Edit, Trash } from "lucide-react"

export default function ItineraryPage() {
  const params = useParams()
  const tripId = params.id as string
  const [items, setItems] = useState<ItineraryItem[]>([])

  const loadItinerary = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/itinerary?trip=${tripId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    if (response.ok) {
      const data = await response.json()
      setItems(data)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [moved] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, moved)

    setItems(newItems)

    // Update order on backend
    const orderedIds = newItems.map((item, index) => ({
      id: item.id,
      day_index: index + 1
    }))

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/itinerary/reorder`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ items: orderedIds })
      }
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this itinerary item?')) return
    
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/itinerary/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
    loadItinerary()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Trip Itinerary</h1>
        <Button onClick={() => router.push(`/dashboard/trips/${tripId}/itinerary/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="itinerary">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-4 p-4 mb-2 bg-card rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Day {item.dayIndex} • {item.startTime} - {item.endTime}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/trips/${tripId}/itinerary/${item.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
```

**Required Package**: `npm install @hello-pangea/dnd`

---

### Trip Updates/Announcements CRUD

Create `/dashboard/trips/[id]/updates/page.tsx`:

```typescript
const handleTogglePin = async (updateId: string, currentlyPinned: boolean) => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/updates/${updateId}/toggle_pin`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  )
  loadUpdates()
}

// In render:
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleTogglePin(update.id, update.pinned)}
>
  {update.pinned ? <PinOff /> : <Pin />}
  {update.pinned ? 'Unpin' : 'Pin'}
</Button>
```

---

### Travel Guides CRUD & Reordering

Similar to Itinerary - use drag-and-drop with:

```typescript
// API endpoint for reordering
POST /api/v1/guides/reorder
Body: { guides: [{ id: "uuid", order: 1 }, ...] }
```

---

### Checklist Items CRUD

Create `/dashboard/trips/[id]/checklist/page.tsx`:

```typescript
// Simple CRUD with filtering by category
const categories = ['DOCS', 'MONEY', 'CLOTHING', 'HEALTH', 'MISC']

<Select value={selectedCategory} onValueChange={setSelectedCategory}>
  {categories.map(cat => (
    <SelectItem value={cat}>{cat}</SelectItem>
  ))}
</Select>
```

---

### Emergency Contacts CRUD

Basic CRUD page at `/dashboard/trips/[id]/contacts/page.tsx` with fields:
- label
- phone
- hours
- notes

---

### FAQs CRUD & Reordering

Similar to guides - use drag-and-drop with order field.

---

## 📦 Required Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^16.5.0",
    "sonner": "^1.4.0"
  }
}
```

---

## 🔗 API Service Updates Needed

Create `/lib/api/services/trip-content.ts`:

```typescript
export class TripContentService {
  // Packages
  static async listPackages(tripId: string, token?: string) {
    return apiClient.get(`/packages?trip=${tripId}`, {}, token)
  }

  static async createPackage(data: any, token?: string) {
    return apiClient.post('/packages', data, {}, token)
  }

  static async updatePackage(id: string, data: any, token?: string) {
    return apiClient.patch(`/packages/${id}`, data, {}, token)
  }

  static async deletePackage(id: string, token?: string) {
    return apiClient.delete(`/packages/${id}`, {}, token)
  }

  // Itinerary
  static async listItinerary(tripId: string, token?: string) {
    return apiClient.get(`/itinerary?trip=${tripId}`, {}, token)
  }

  static async reorderItinerary(items: any[], token?: string) {
    return apiClient.post('/itinerary/reorder', { items }, {}, token)
  }

  // Updates
  static async togglePinUpdate(id: string, token?: string) {
    return apiClient.post(`/updates/${id}/toggle_pin`, {}, {}, token)
  }

  // Add similar methods for guides, checklists, contacts, FAQs
}
```

---

## 🎯 Priority Implementation Order

1. **Itinerary CRUD** - Most visible to users
2. **Trip Updates** - Critical for communication
3. **Travel Guides** - Important content
4. **Booking Bulk Actions** - Admin efficiency
5. **Checklist/Contacts/FAQs** - Nice-to-have

---

## ✅ Testing Checklist

### Frontend Testing
- [ ] All forms validate correctly
- [ ] API calls have proper error handling
- [ ] Loading states display correctly
- [ ] Success/error toasts appear
- [ ] Navigation works after CRUD operations
- [ ] Drag-and-drop saves order correctly

### Backend Testing
- [x] All 88 API tests passing
- [x] Authentication working
- [x] CORS configured for localhost
- [x] All models have API endpoints

---

## 🚀 Deployment Notes

### Environment Variables Required

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Backend (.env)
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
DEBUG=True
```

---

## 📚 Additional Resources

- **Backend API Reference**: All endpoints documented in backend tests
- **Component Library**: Shadcn UI components already installed
- **State Management**: React hooks (useState, useEffect)
- **Form Validation**: Zod schemas
- **Authentication**: NextAuth.js with JWT

---

## 🎓 Development Best Practices

1. **Always validate on both frontend and backend**
2. **Use TypeScript types for API responses**
3. **Handle loading and error states**
4. **Add optimistic UI updates where possible**
5. **Use toast notifications for user feedback**
6. **Implement proper permissions checks**
7. **Test with real data scenarios**

---

*Last Updated: October 30, 2025*
*Backend: 100% Complete | Frontend: ~60% Complete*

