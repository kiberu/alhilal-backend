import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { Link } from 'react-router-dom'

type BaseProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  className?: string
  'data-track-cta'?: string
  'data-cta-label'?: string
  'data-context-label'?: string
}

type LinkButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: never
    to: string
  }

type AnchorButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    to?: never
  }

type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never
    to?: never
  }

type ButtonProps = LinkButtonProps | AnchorButtonProps | NativeButtonProps

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    icon,
    iconPosition = 'end',
    className = '',
  } = props

  const classes = `button button--${variant} ${className}`.trim()
  const content = (
    <>
      {icon && iconPosition === 'start' ? (
        <span className="button__icon button__icon--start">{icon}</span>
      ) : null}
      <span className="button__label">{children}</span>
      {icon && iconPosition === 'end' ? (
        <span className="button__icon button__icon--end">{icon}</span>
      ) : null}
    </>
  )

  const trackingAttrs = {
    'data-track-cta': props['data-track-cta'],
    'data-cta-label': props['data-cta-label'],
    'data-context-label': props['data-context-label'],
  }

  if ('to' in props && props.to) {
    const { onClick, to } = props

    return (
      <Link className={classes} onClick={onClick} to={to} {...trackingAttrs}>
        {content}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const { download, href, onClick, rel, target } = props

    return (
      <a
        className={classes}
        download={download}
        href={href}
        onClick={onClick}
        rel={rel}
        target={target}
        {...trackingAttrs}
      >
        {content}
      </a>
    )
  }

  const { disabled, form, name, onClick, type, value } = props as NativeButtonProps

  return (
    <button
      className={classes}
      disabled={disabled}
      form={form}
      name={name}
      onClick={onClick}
      type={type ?? 'button'}
      value={value}
      {...trackingAttrs}
    >
      {content}
    </button>
  )
}
