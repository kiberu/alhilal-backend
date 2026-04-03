import type { HTMLAttributes, ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Reveal({ children, className = '', ...rest }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
}
