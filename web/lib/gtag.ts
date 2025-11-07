/**
 * Google Analytics utility functions
 * For tracking page views and events
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track specific events for your business
export const trackPackageView = (packageName: string) => {
  event({
    action: 'view_package',
    category: 'engagement',
    label: packageName,
  })
}

export const trackContactFormSubmit = (formType: string) => {
  event({
    action: 'submit_form',
    category: 'conversion',
    label: formType,
  })
}

export const trackPhoneClick = () => {
  event({
    action: 'click_phone',
    category: 'conversion',
    label: 'phone_number',
  })
}

export const trackWhatsAppClick = () => {
  event({
    action: 'click_whatsapp',
    category: 'conversion',
    label: 'whatsapp_button',
  })
}

export const trackBookingStart = (packageType: string) => {
  event({
    action: 'start_booking',
    category: 'conversion',
    label: packageType,
  })
}

