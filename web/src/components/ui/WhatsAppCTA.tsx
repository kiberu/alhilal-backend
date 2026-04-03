import type { MouseEventHandler } from 'react'
import { brand } from '../../data/site'
import { AppIcon, appIcons } from './AppIcon'
import { Button } from './Button'

type WhatsAppCTAProps = {
  children?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  ctaLabel?: string
  contextLabel?: string
}

export function WhatsAppCTA({
  children = 'Ask on WhatsApp',
  className,
  variant = 'primary',
  href,
  onClick,
  ctaLabel = 'whatsapp_click',
  contextLabel = 'global',
}: WhatsAppCTAProps) {
  return (
    <Button
      className={className}
      data-cta-label={ctaLabel}
      data-context-label={contextLabel}
      data-track-cta="true"
      href={href ?? brand.whatsappUrl}
      icon={<AppIcon icon={appIcons.chat} size="sm" />}
      iconPosition="start"
      onClick={onClick}
      rel="noreferrer"
      target="_blank"
      variant={variant}
    >
      {children}
    </Button>
  )
}
