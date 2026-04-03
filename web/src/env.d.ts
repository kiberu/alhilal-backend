/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string
  readonly VITE_PUBLIC_SITE_URL: string
  readonly VITE_CONTACT_PHONE: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_WHATSAPP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
