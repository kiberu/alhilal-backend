"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import { UserService } from "@/lib/api/services/users"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STAFF", "PILGRIM"]),
  staffRole: z.enum(["ADMIN", "AGENT", "AUDITOR"]).optional(),
  isActive: z.boolean().default(true),
  isStaff: z.boolean().default(false),
  isSuperuser: z.boolean().default(false),
})

type UserFormData = z.infer<typeof userSchema>

export default function NewUserPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      role: "STAFF",
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  })

  const selectedRole = watch("role")
  const isActive = watch("isActive")
  const isStaff = watch("isStaff")
  const isSuperuser = watch("isSuperuser")

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Remove staffRole if not STAFF
      const submitData = { ...data }
      if (submitData.role !== "STAFF") {
        delete submitData.staffRole
      }

      const response = await UserService.createUser(submitData, accessToken)

      if (response.success && response.data) {
        toast.success("User created successfully")
        router.push("/dashboard/users")
      } else {
        const errorMessage = response.error || "Failed to create user"
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error("Error creating user:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create user"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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

        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
        <p className="mt-2 text-muted-foreground">
          Add a new user account to the system
        </p>
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

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters
                </p>
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
                      Staff Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
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
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

