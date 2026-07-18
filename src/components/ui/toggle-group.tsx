"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const toggleGroupVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-muted p-1",
        outline: "bg-transparent",
      },
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function ToggleGroup({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({ variant, size }),
        "data-[state=on]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants }
