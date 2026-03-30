import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold-solid)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--brand-maroon)] text-white shadow-[0_14px_36px_rgba(33,21,26,0.14)] hover:opacity-92",
        gold: "bg-[color:var(--gold-solid)] text-[color:var(--ink-strong)] shadow-[0_14px_36px_rgba(249,160,40,0.18)] hover:opacity-92",
        outline: "border border-[color:var(--border-soft)] text-[color:var(--brand-maroon)] hover:bg-[color:var(--brand-maroon)] hover:text-white",
        ghost: "text-[color:var(--brand-maroon)] hover:bg-[color:var(--surface-muted)]",
        link: "text-[color:var(--brand-maroon)] underline-offset-4 hover:underline hover:opacity-80",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
