function requireEnv(name: string): string {
  const value = import.meta.env[name];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizePhoneToE164Digits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

const contactPhone = requireEnv('VITE_CONTACT_PHONE');
const whatsappUrlFromEnv = import.meta.env.VITE_WHATSAPP_URL?.trim();

export const appEnv = {
  apiBaseUrl: ensureTrailingSlash(requireEnv('VITE_PUBLIC_API_URL')),
  siteUrl: requireEnv('VITE_PUBLIC_SITE_URL'),
  contactPhone,
  contactEmail: requireEnv('VITE_CONTACT_EMAIL'),
  whatsappUrl:
    whatsappUrlFromEnv && whatsappUrlFromEnv.length
      ? whatsappUrlFromEnv
      : `https://wa.me/${normalizePhoneToE164Digits(contactPhone)}`,
} as const;
