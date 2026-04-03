/* eslint-disable react-refresh/only-export-components */
import type { LucideIcon, LucideProps } from 'lucide-react'
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Menu,
  MessageCircleMore,
  Phone,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

const iconSizes = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const

export const appIcons = {
  arrowUpRight: ArrowUpRight,
  badgeCheck: BadgeCheck,
  calendar: CalendarDays,
  chat: MessageCircleMore,
  chevronDown: ChevronDown,
  clock: Clock3,
  close: X,
  email: Mail,
  location: MapPin,
  menu: Menu,
  phone: Phone,
  shield: ShieldCheck,
  users: Users,
} as const

type AppIconProps = Omit<LucideProps, 'size'> & {
  icon: LucideIcon
  size?: keyof typeof iconSizes | number
  decorative?: boolean
}

export function AppIcon({
  icon: Icon,
  size = 'md',
  decorative = true,
  className = '',
  strokeWidth = 2,
  ...props
}: AppIconProps) {
  const resolvedSize = typeof size === 'number' ? size : iconSizes[size]

  return (
    <Icon
      aria-hidden={decorative}
      className={`app-icon ${className}`.trim()}
      focusable="false"
      role={decorative ? undefined : 'img'}
      size={resolvedSize}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}
