import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  as?: 'article' | 'div'
}

export function Card({ children, className = '', as = 'div' }: CardProps) {
  const Component = as

  return <Component className={`card ${className}`.trim()}>{children}</Component>
}
