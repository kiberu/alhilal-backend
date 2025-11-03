"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save, Trash2, AlertCircle, Key } from "lucide-react"
import { UserService } from "@/lib/api/services/users"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import type { User } from "@/types/models"

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["STAFF", "PILGRIM"]),
  staffRole: z.enum(["ADMIN", "AGENT", "AUDITOR"]).optional(),
  isActive: z.boolean().default(true),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
})

type UserFormData = z.infer<typeof userSchema>

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string
  const { accessToken } = useAuth()
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const selectedRole = watch("role")
  const isActive = watch("isActive")
  const isStaff = watch("isStaff")
  const isSuperuser = watch("isSuperuser")

  useEffect(() => {
    if (userId) {
      loadUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await UserService.getUser(userId, accessToken)

      if (response.success && response.data) {
        const userData = response.data
        setUser(userData)
        
        // Set form values
        setValue("name", userData.name)
        setValue("phone", userData.phone)
        setValue("email", userData.email || "")
        setValue("role", userData.role)
        setValue("staffRole", userData.staffRole)
        setValue("isActive", userData.isActive)
        setValue("isStaff", userData.isStaff)
        setValue("isSuperuser", userData.isSuperuser || false)
      } else {
        setError(response.error || "Failed to load user")
        toast.error(response.error || "Failed to load user")
      }
    } catch (err) {
      console.error("Error loading user:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load user"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Remove staffRole if not STAFF
      const submitData = { ...data }
      if (submitData.role !== "STAFF") {
        delete submitData.staffRole
      }

      const response = await UserService.updateUser(userId, submitData, accessToken)

      if (response.success) {
        toast.success("User updated successfully")
        router.push("/dashboard/users")
      } else {
        const errorMessage = response.error || "Failed to update user"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error updating user:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update user"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsChangingPassword(true)

      const response = await UserService.changeUserPassword(
        userId,
        { newPassword: data.newPassword },
        accessToken
      )

      if (response.success) {
        toast.success("Password changed successfully")
        setShowPasswordDialog(false)
        resetPassword()
      } else {
        toast.error(response.error || "Failed to change password")
      }
    } catch (err) {
      console.error("Error changing password:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to change password"
      toast.error(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const response = await UserService.deleteUser(userId, accessToken)

      if (response.success) {
        toast.success("User deleted successfully")
        router.push("/dashboard/users")
      } else {
        toast.error(response.error || "Failed to delete user")
        setShowDeleteDialog(false)
      }
    } catch (err) {
      console.error("Error deleting user:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user"
      toast.error(errorMessage)
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
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
          Back to Users
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="mt-2 text-muted-foreground">
              Update user information and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(true)}
            >
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Ahmed Ali"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="+971501234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    User Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue("role", value as "STAFF" | "PILGRIM")
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="PILGRIM">Pilgrim</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                {selectedRole === "STAFF" && (
                  <div className="space-y-2">
                    <Label htmlFor="staffRole">
                      Staff Role
                    </Label>
                    <Select
                      value={watch("staffRole") || undefined}
                      onValueChange={(value) =>
                        setValue("staffRole", value as "ADMIN" | "AGENT" | "AUDITOR")
                      }
                    >
                      <SelectTrigger id="staffRole">
                        <SelectValue placeholder="Select staff role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="AGENT">Agent</SelectItem>
                        <SelectItem value="AUDITOR">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.staffRole && (
                      <p className="text-sm text-red-500">{errors.staffRole.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) =>
                      setValue("isActive", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Active Account
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Inactive accounts cannot log in
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isStaff"
                    checked={isStaff}
                    onCheckedChange={(checked) =>
                      setValue("isStaff", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="isStaff"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Staff Access
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Allow access to admin dashboard
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSuperuser"
                    checked={isSuperuser}
                    onCheckedChange={(checked) =>
                      setValue("isSuperuser", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="isSuperuser"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Superuser
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Full system access and permissions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter a new password for this user account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...registerPassword("newPassword")}
                  placeholder="••••••••"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...registerPassword("confirmPassword")}
                  placeholder="••••••••"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  resetPassword()
                }}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

