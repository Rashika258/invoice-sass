"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  render,
  asChild,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={nativeButton ?? (render == null && !asChild)}
      render={render}
      suppressHydrationWarning
      {...props}
    />
  )
}

export { Button, buttonVariants }
