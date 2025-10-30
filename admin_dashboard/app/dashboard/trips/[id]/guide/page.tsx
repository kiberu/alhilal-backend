"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Eye,
  BookOpen,
  AlertCircle,
  Save,
} from "lucide-react"
import { TripService } from "@/lib/api/services/trips"
import { useAuth } from "@/hooks/useAuth"
import type { TripGuideSection } from "@/types/models"

const guideSectionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  orderIndex: z.string().transform(val => parseInt(val)),
})

type GuideSectionFormData = z.infer<typeof guideSectionSchema>

export default function TravelGuidePage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuth()
  const tripId = params.id as string

  const [sections, setSections] = useState<TripGuideSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSection, setEditingSection] = useState<TripGuideSection | null>(null)

  const form = useForm<GuideSectionFormData>({
    resolver: zodResolver(guideSectionSchema),
    defaultValues: {
      title: "",
      content: "",
      orderIndex: "0",
    },
  })

  useEffect(() => {
    loadGuide()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  useEffect(() => {
    if (editingSection) {
      form.reset({
        title: editingSection.title,
        content: editingSection.content,
        orderIndex: editingSection.orderIndex.toString(),
      })
      setShowForm(true)
    }
  }, [editingSection, form])

  const loadGuide = async () => {
    try {
      setLoading(true)
      const response = await TripService.getTravelGuide(tripId, accessToken)
      if (response.success && response.data) {
        setSections(response.data)
      }
    } catch (err) {
      console.error("Error loading guide:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: GuideSectionFormData) => {
    try {
      setSaving(true)
      setError(null)

      let response
      if (editingSection) {
        response = await TripService.updateGuideSection(
          tripId,
          editingSection.id,
          data,
          accessToken
        )
      } else {
        response = await TripService.addGuideSection(tripId, data, accessToken)
      }

      if (response.success) {
        await loadGuide()
        setShowForm(false)
        setEditingSection(null)
        form.reset()
      } else {
        setError(response.error || "Failed to save section")
      }
    } catch (err) {
      console.error("Error saving section:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to save section"
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (!confirm("Delete this guide section?")) return

    try {
      const response = await TripService.deleteGuideSection(tripId, sectionId, accessToken)
      if (response.success) {
        await loadGuide()
      }
    } catch (err) {
      console.error("Error deleting section:", err)
    }
  }

  const handleEdit = (section: TripGuideSection) => {
    setEditingSection(section)
  }

  const handleCancelEdit = () => {
    setEditingSection(null)
    setShowForm(false)
    form.reset()
  }

  // Simple markdown rendering (basic support)
  const renderMarkdown = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-semibold mt-4 mb-2">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-bold mt-4 mb-2">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-bold mt-4 mb-2">
              {line.slice(2)}
            </h1>
          )
        }
        // Bullet points
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4">
              {line.slice(2)}
            </li>
          )
        }
        // Bold text
        const boldRegex = /\*\*(.*?)\*\*/g
        if (boldRegex.test(line)) {
          const parts = line.split(boldRegex)
          return (
            <p key={i} className="mb-2">
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          )
        }
        // Regular paragraph
        if (line.trim()) {
          return (
            <p key={i} className="mb-2">
              {line}
            </p>
          )
        }
        return <br key={i} />
      })
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
          Back to Trip
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Travel Guide</h1>
              <p className="text-muted-foreground">
                Create helpful guide sections for pilgrims
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSection ? "Edit Section" : "Add New Section"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., What to Pack, Prayer Times" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orderIndex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>Lower numbers appear first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your guide content here. Supports basic markdown:&#10;# Header 1&#10;## Header 2&#10;### Header 3&#10;- Bullet point&#10;**Bold text**"
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Supports basic markdown: # Headers, - Lists, **Bold**
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : editingSection ? "Update" : "Add Section"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Guide Sections */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No guide sections yet. Add your first section to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">Order: {section.orderIndex}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview">
                    <TabsList>
                      <TabsTrigger value="preview">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="raw">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Raw
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(section.content)}
                      </div>
                    </TabsContent>
                    <TabsContent value="raw" className="mt-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md">
                        {section.content}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

