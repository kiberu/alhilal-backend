"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Mail, Settings, Shield, User, Video } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { PlatformService } from "@/lib/api/services/platform"
import type { PlatformSettings } from "@/types/models"

const EMPTY_SETTINGS: PlatformSettings = {
  otpSupportPhone: "",
  otpSupportWhatsApp: "",
  otpFallbackMessage: "",
  mobileSupportPhone: "",
  mobileSupportWhatsApp: "",
  mobileSupportEmail: "",
  mobileSupportMessage: "",
  notificationProviderEnabled: false,
  notificationProviderName: "",
  notificationProviderNotes: "",
  leadNotificationToEmail: "",
  leadNotificationCcEmail: "",
  youtubeChannelId: "",
  youtubePlaylistId: "",
  youtubeCacheSyncedAt: null,
  updatedAt: "",
}

export default function SettingsPage() {
  const { user, accessToken, isLoading: authLoading, isAdmin } = useAuth()
  const [settings, setSettings] = useState<PlatformSettings>(EMPTY_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await PlatformService.getSettings(accessToken)
      if (response.success && response.data) {
        setSettings(response.data)
      } else {
        toast.error(response.error || "Failed to load platform settings.")
      }
    } catch (error) {
      console.error("Error loading platform settings:", error)
      toast.error("Failed to load platform settings.")
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !isAdmin) {
      setLoading(false)
      return
    }

    void loadSettings()
  }, [accessToken, isAdmin, loadSettings])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await PlatformService.updateSettings(settings, accessToken)
      if (response.success && response.data) {
        setSettings(response.data)
        toast.success("Platform settings updated.")
        return
      }

      toast.error(response.error || "Failed to save platform settings.")
    } catch (error) {
      console.error("Error saving platform settings:", error)
      toast.error("Failed to save platform settings.")
    } finally {
      setSaving(false)
    }
  }

  const updateField = <K extends keyof PlatformSettings>(field: K, value: PlatformSettings[K]) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const formatLastSynced = (value?: string | null) => {
    if (!value) {
      return "Not synced yet"
    }

    try {
      return new Intl.DateTimeFormat("en-UG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Control lead notifications, the platform-wide support experience, and the mobile lesson feed.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Account Summary</CardTitle>
            </div>
            <CardDescription>
              Your current staff identity for this admin session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={user?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={user?.phone || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Staff Role</Label>
              <Input id="role" value={user?.staffProfile?.role || "Unknown"} disabled />
            </div>
          </CardContent>
        </Card>

        {!authLoading && !isAdmin ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Restricted</CardTitle>
              </div>
              <CardDescription>
                Only admin-role staff can change platform settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Agents and auditors can continue using operational tools, but system-wide lead notification,
                OTP fallback, and YouTube feed controls remain admin-only.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Lead Notification Email</CardTitle>
                </div>
                <CardDescription>
                  Send an internal alert each time a website lead is saved. The lead record is still stored even if email delivery fails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lead-notification-to-email">Primary Notification Email</Label>
                    <Input
                      id="lead-notification-to-email"
                      type="email"
                      placeholder="ops@alhilaltravels.com"
                      value={settings.leadNotificationToEmail}
                      onChange={(event) => updateField("leadNotificationToEmail", event.target.value)}
                      disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank if you want website leads saved without sending an internal email alert.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead-notification-cc-email">CC Email</Label>
                    <Input
                      id="lead-notification-cc-email"
                      type="email"
                      placeholder="leadership@alhilaltravels.com"
                      value={settings.leadNotificationCcEmail}
                      onChange={(event) => updateField("leadNotificationCcEmail", event.target.value)}
                      disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this for a second internal recipient who should always receive the same alert copy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>OTP Fallback Support</CardTitle>
                </div>
                <CardDescription>
                  Define the support path pilgrims see when SMS delivery is delayed or unavailable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="otp-support-phone">Support Phone</Label>
                    <Input
                      id="otp-support-phone"
                      placeholder="+256700000000"
                      value={settings.otpSupportPhone}
                      onChange={(event) => updateField("otpSupportPhone", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp-support-whatsapp">Support WhatsApp</Label>
                    <Input
                      id="otp-support-whatsapp"
                      placeholder="+256700000000"
                      value={settings.otpSupportWhatsApp}
                      onChange={(event) => updateField("otpSupportWhatsApp", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp-fallback-message">Fallback Message</Label>
                  <Textarea
                    id="otp-fallback-message"
                    placeholder="Tell pilgrims what to do if the OTP does not arrive."
                    value={settings.otpFallbackMessage}
                    onChange={(event) => updateField("otpFallbackMessage", event.target.value)}
                    disabled={loading || saving}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Mobile Support Contacts</CardTitle>
                </div>
                <CardDescription>
                  These contacts power the pilgrim app&apos;s document center, readiness handoff, and in-trip support actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-support-phone">Support Phone</Label>
                    <Input
                      id="mobile-support-phone"
                      placeholder="+256700000000"
                      value={settings.mobileSupportPhone}
                      onChange={(event) => updateField("mobileSupportPhone", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-support-whatsapp">Support WhatsApp</Label>
                    <Input
                      id="mobile-support-whatsapp"
                      placeholder="+256700000000"
                      value={settings.mobileSupportWhatsApp}
                      onChange={(event) => updateField("mobileSupportWhatsApp", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-support-email">Support Email</Label>
                    <Input
                      id="mobile-support-email"
                      type="email"
                      placeholder="support@alhilaltravels.com"
                      value={settings.mobileSupportEmail}
                      onChange={(event) => updateField("mobileSupportEmail", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile-support-message">Support Message</Label>
                  <Textarea
                    id="mobile-support-message"
                    placeholder="Tell pilgrims how to hand off missing documents or readiness blockers to support."
                    value={settings.mobileSupportMessage}
                    onChange={(event) => updateField("mobileSupportMessage", event.target.value)}
                    disabled={loading || saving}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notification Provider</CardTitle>
                </div>
                <CardDescription>
                  Keep this provider-agnostic. Record the active delivery integration without baking Expo-specific assumptions into the platform model.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="notification-provider-name">Provider Name</Label>
                    <Input
                      id="notification-provider-name"
                      placeholder="native-apns-fcm"
                      value={settings.notificationProviderName}
                      onChange={(event) => updateField("notificationProviderName", event.target.value)}
                      disabled={loading || saving}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <Label htmlFor="notification-provider-enabled">Enabled</Label>
                      <p className="text-xs text-muted-foreground">
                        Turn this on only when the backend is ready to send through the configured provider.
                      </p>
                    </div>
                    <input
                      id="notification-provider-enabled"
                      type="checkbox"
                      checked={settings.notificationProviderEnabled}
                      onChange={(event) => updateField("notificationProviderEnabled", event.target.checked)}
                      disabled={loading || saving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-provider-notes">Provider Notes</Label>
                  <Textarea
                    id="notification-provider-notes"
                    placeholder="Describe the current delivery path, environment, or rollout note."
                    value={settings.notificationProviderNotes}
                    onChange={(event) => updateField("notificationProviderNotes", event.target.value)}
                    disabled={loading || saving}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <CardTitle>Lesson Video Source</CardTitle>
                </div>
                <CardDescription>
                  Connect the pilgrim app&apos;s lessons tab to a YouTube channel or a specific playlist.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-channel-id">YouTube Channel ID</Label>
                    <Input
                      id="youtube-channel-id"
                      placeholder="UC..."
                      value={settings.youtubeChannelId}
                      onChange={(event) => updateField("youtubeChannelId", event.target.value)}
                      disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this when you want the backend to resolve the channel&apos;s uploads playlist automatically.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube-playlist-id">YouTube Playlist ID</Label>
                    <Input
                      id="youtube-playlist-id"
                      placeholder="PL..."
                      value={settings.youtubePlaylistId}
                      onChange={(event) => updateField("youtubePlaylistId", event.target.value)}
                      disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use this when you want to curate a specific lesson sequence for pilgrims.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>Last video sync: {formatLastSynced(settings.youtubeCacheSyncedAt)}</span>
                  <span>Last settings update: {formatLastSynced(settings.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Save Changes</CardTitle>
                </div>
                <CardDescription>
                  These settings affect website lead alerts, pilgrim sign-in fallback guidance, and the mobile lessons feed immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Keep the notification emails current, and keep either a playlist ID or a channel ID configured so the app always has a stable source for lesson videos.
                </p>
                <Button onClick={handleSave} disabled={loading || saving}>
                  {saving ? "Saving..." : "Save Platform Settings"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
