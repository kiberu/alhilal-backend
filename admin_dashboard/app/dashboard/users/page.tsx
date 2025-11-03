"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Plus, Filter, Shield, UserCog } from "lucide-react"
import { DataTable, SearchBar, StatusBadge, type Column } from "@/components/shared"
import { UserService } from "@/lib/api/services/users"
import { useAuth } from "@/hooks/useAuth"
import type { User } from "@/types/models"
import { format } from "date-fns"

export default function UsersPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: Record<string, string | number | boolean> = {
        page,
        size: pageSize,
      }

      if (searchQuery) {
        filters.search = searchQuery
      }

      if (roleFilter && roleFilter !== "all") {
        filters.role = roleFilter
      }

      if (statusFilter && statusFilter !== "all") {
        filters.isActive = statusFilter === "active"
      }

      const response = await UserService.getUsers(filters, accessToken)

      if (response.success) {
        const items = response.items || []
        setUsers(items)
        setTotalPages(response.meta?.totalPages || 1)
        setTotalItems(response.meta?.total || items.length)
      } else {
        setError(response.error || "Failed to load users")
      }
    } catch (err) {
      console.error("Error loading users:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load users"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setRoleFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.phone}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <span className="text-sm">{user.email || "N/A"}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <StatusBadge
          status={user.role}
          variant={user.role === "STAFF" ? "default" : "secondary"}
        />
      ),
    },
    {
      key: "staffRole",
      header: "Staff Role",
      render: (user) => {
        if (user.role !== "STAFF" || !user.staffRole) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <StatusBadge
            status={user.staffRole}
            variant={
              user.staffRole === "ADMIN" 
                ? "destructive" 
                : user.staffRole === "AGENT" 
                ? "default" 
                : "secondary"
            }
          />
        )
      },
    },
    {
      key: "isActive",
      header: "Status",
      render: (user) => (
        <StatusBadge
          status={user.isActive ? "ACTIVE" : "INACTIVE"}
          variant={user.isActive ? "success" : "secondary"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(user.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (user) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
        >
          Edit
        </Button>
      ),
      className: "text-right",
    },
  ]

  const roleCounts = {
    staff: users.filter(u => u.role === "STAFF").length,
    pilgrim: users.filter(u => u.role === "PILGRIM").length,
  }

  const statusCounts = {
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage all user accounts and permissions
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/users/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search by name, phone, or email..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PILGRIM">Pilgrim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{roleCounts.staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pilgrims</p>
                <p className="text-2xl font-bold">{roleCounts.pilgrim}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found"
            emptyDescription="Add your first user to get started"
            pagination={{
              page,
              totalPages,
              totalItems,
              pageSize,
              onPageChange: setPage,
            }}
            onRowClick={(user) => router.push(`/dashboard/users/${user.id}/edit`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

