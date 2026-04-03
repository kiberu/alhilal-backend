import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AppIcon, appIcons } from './AppIcon'

type BaseProps = {
  children: ReactNode
  className?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

type LinkInlineProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href?: never
    to: string
  }

type AnchorInlineProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    to?: never
  }

type InlineLinkProps = LinkInlineProps | AnchorInlineProps

function InlineLinkContent({
  children,
  leadingIcon,
  trailingIcon,
}: Pick<BaseProps, 'children' | 'leadingIcon' | 'trailingIcon'>) {
  return (
    <>
      {leadingIcon ? <span className="inline-link__icon">{leadingIcon}</span> : null}
      <span className="inline-link__label">{children}</span>
      <span className="inline-link__icon">
        {trailingIcon ?? <AppIcon icon={appIcons.arrowUpRight} size="sm" />}
      </span>
    </>
  )
}

export function InlineLink(props: InlineLinkProps) {
  const { children, className = '', leadingIcon, trailingIcon } = props
  const classes = `inline-link ${className}`.trim()

  if ('to' in props && props.to) {
    const { to, ...rest } = props

    return (
      <Link className={classes} to={to} {...rest}>
        <InlineLinkContent
          children={children}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
        />
      </Link>
    )
  }

  const { href, ...rest } = props

  return (
    <a className={classes} href={href} {...rest}>
      <InlineLinkContent
        children={children}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
      />
    </a>
  )
}
